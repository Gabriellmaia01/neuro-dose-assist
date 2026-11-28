package com.neurodose.sandbox;

import com.neurodose.activity.ActivityLogEntity;
import com.neurodose.activity.ActivityLogRepository;
import com.neurodose.appointment.AppointmentEntity;
import com.neurodose.appointment.AppointmentRepository;
import com.neurodose.clinic.ClinicEntity;
import com.neurodose.clinic.ClinicInviteEntity;
import com.neurodose.clinic.ClinicInviteRepository;
import com.neurodose.clinic.ClinicMemberEntity;
import com.neurodose.clinic.ClinicMemberRepository;
import com.neurodose.clinic.ClinicRepository;
import com.neurodose.dose.DoseRecordEntity;
import com.neurodose.dose.DoseRecordRepository;
import com.neurodose.medication.MedicationEntity;
import com.neurodose.medication.MedicationRepository;
import com.neurodose.note.PatientNoteEntity;
import com.neurodose.note.PatientNoteRepository;
import com.neurodose.patient.PatientEntity;
import com.neurodose.patient.PatientRepository;
import com.neurodose.settings.UserSettingsEntity;
import com.neurodose.settings.UserSettingsRepository;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.lang.reflect.Proxy;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Function;

/**
 * Ambiente Virtual Seguro (Sandbox QA) — ativo EXCLUSIVAMENTE com --spring.profiles.active=sandbox.
 * Mantém 100% dos dados em memória volátil (RAM) e emite tokens JWT locais efêmeros,
 * sem conectar ao MongoDB Atlas nem alterar dados reais de produção.
 */
@Configuration
@Profile("sandbox & !prod")
public class SandboxEnvironmentConfig {

    private final SecretKey ephemeralKey;

    private final Map<String, PatientEntity> patients = new ConcurrentHashMap<>();
    private final Map<String, MedicationEntity> medications = new ConcurrentHashMap<>();
    private final Map<String, DoseRecordEntity> doses = new ConcurrentHashMap<>();
    private final Map<String, AppointmentEntity> appointments = new ConcurrentHashMap<>();
    private final Map<String, PatientNoteEntity> notes = new ConcurrentHashMap<>();
    private final List<ActivityLogEntity> activityLogs = new CopyOnWriteArrayList<>();
    private final Map<String, ClinicEntity> clinics = new ConcurrentHashMap<>();
    private final List<ClinicMemberEntity> members = new CopyOnWriteArrayList<>();
    private final Map<String, ClinicInviteEntity> invites = new ConcurrentHashMap<>();
    private final Map<String, UserSettingsEntity> settings = new ConcurrentHashMap<>();

    public SandboxEnvironmentConfig(Environment environment) {
        if (environment.acceptsProfiles(Profiles.of("prod"))) {
            throw new IllegalStateException("Perfil sandbox não pode ser ativado junto com prod.");
        }
        String mongoUri = environment.getProperty("MONGODB_URI", "");
        if (mongoUri.startsWith("mongodb+srv://")) {
            throw new IllegalStateException("Perfil sandbox bloqueado quando MONGODB_URI de nuvem (Atlas) está configurado.");
        }
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        this.ephemeralKey = new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    @Primary
    public JwtDecoder sandboxJwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(ephemeralKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public JwtEncoder sandboxJwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(ephemeralKey));
    }

    @RestController
    @Profile("sandbox & !prod")
    @RequestMapping("/api/v1/sandbox/auth")
    public static class SandboxAuthController {
        private final JwtEncoder jwtEncoder;

        public SandboxAuthController(JwtEncoder jwtEncoder) {
            this.jwtEncoder = jwtEncoder;
        }

        public record SandboxTokenRequest(String uid, String email, String name) {}

        @PostMapping("/token")
        public Map<String, String> issueToken(@RequestBody SandboxTokenRequest req) {
            Instant now = Instant.now();
            String uid = (req.uid() != null && !req.uid().isBlank()) ? req.uid().trim() : "sandbox-user";
            String email = (req.email() != null && !req.email().isBlank()) ? req.email().trim() : "sandbox@neurodose.local";
            String name = (req.name() != null && !req.name().isBlank()) ? req.name().trim() : "Usuário Sandbox";

            JwtClaimsSet claims = JwtClaimsSet.builder()
                    .issuer("neurodose-sandbox")
                    .subject(uid)
                    .issuedAt(now)
                    .expiresAt(now.plusSeconds(14400))
                    .claim("email", email)
                    .claim("name", name)
                    .build();

            JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
            String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
            return Map.of("token", token, "uid", uid);
        }
    }

    @Bean
    public PatientRepository sandboxPatientRepository() {
        return repoProxy(PatientRepository.class, (method, args) -> switch (method) {
            case "save" -> {
                PatientEntity e = (PatientEntity) args[0];
                patients.put(e.id, e);
                yield e;
            }
            case "findByWorkspaceOwnerIdOrderByCreatedAtDesc" -> {
                String ws = (String) args[0];
                yield patients.values().stream()
                        .filter(p -> ws.equals(p.workspaceOwnerId))
                        .sorted(Comparator.comparing((PatientEntity p) -> nullSafe(p.createdAt)).reversed())
                        .toList();
            }
            case "findByIdAndWorkspaceOwnerId" -> {
                PatientEntity p = patients.get((String) args[0]);
                yield (p != null && args[1].equals(p.workspaceOwnerId)) ? Optional.of(p) : Optional.empty();
            }
            case "delete" -> {
                PatientEntity e = (PatientEntity) args[0];
                if (e != null && e.id != null) patients.remove(e.id);
                yield null;
            }
            default -> defaultCrud(patients, p -> p.id, method, args);
        });
    }

    @Bean
    public MedicationRepository sandboxMedicationRepository() {
        return repoProxy(MedicationRepository.class, (method, args) -> switch (method) {
            case "save" -> {
                MedicationEntity e = (MedicationEntity) args[0];
                medications.put(e.id, e);
                yield e;
            }
            case "findByWorkspaceOwnerIdOrderByNameAsc" -> {
                String ws = (String) args[0];
                yield medications.values().stream()
                        .filter(m -> ws.equals(m.workspaceOwnerId))
                        .sorted(Comparator.comparing(m -> nullSafe(m.name).toLowerCase()))
                        .toList();
            }
            case "findByIdAndWorkspaceOwnerId" -> {
                MedicationEntity m = medications.get((String) args[0]);
                yield (m != null && args[1].equals(m.workspaceOwnerId)) ? Optional.of(m) : Optional.empty();
            }
            case "delete" -> {
                MedicationEntity e = (MedicationEntity) args[0];
                if (e != null && e.id != null) medications.remove(e.id);
                yield null;
            }
            default -> defaultCrud(medications, m -> m.id, method, args);
        });
    }

    @Bean
    public DoseRecordRepository sandboxDoseRecordRepository() {
        return repoProxy(DoseRecordRepository.class, (method, args) -> switch (method) {
            case "save" -> {
                DoseRecordEntity e = (DoseRecordEntity) args[0];
                doses.put(e.id, e);
                yield e;
            }
            case "findByWorkspaceOwnerIdOrderByDoseTimestampDesc" -> {
                String ws = (String) args[0];
                Pageable pg = (Pageable) args[1];
                yield doses.values().stream()
                        .filter(d -> ws.equals(d.workspaceOwnerId))
                        .sorted(Comparator.comparing((DoseRecordEntity d) -> nullSafe(d.doseTimestamp)).reversed())
                        .limit(pg.isPaged() ? pg.getPageSize() : Long.MAX_VALUE)
                        .toList();
            }
            case "findByWorkspaceOwnerIdAndPatientIdOrderByDoseTimestampDesc" -> {
                String ws = (String) args[0];
                String pid = (String) args[1];
                Pageable pg = (Pageable) args[2];
                yield doses.values().stream()
                        .filter(d -> ws.equals(d.workspaceOwnerId) && pid.equals(d.patientId))
                        .sorted(Comparator.comparing((DoseRecordEntity d) -> nullSafe(d.doseTimestamp)).reversed())
                        .limit(pg.isPaged() ? pg.getPageSize() : Long.MAX_VALUE)
                        .toList();
            }
            case "findByIdAndWorkspaceOwnerId" -> {
                DoseRecordEntity d = doses.get((String) args[0]);
                yield (d != null && args[1].equals(d.workspaceOwnerId)) ? Optional.of(d) : Optional.empty();
            }
            case "delete" -> {
                DoseRecordEntity e = (DoseRecordEntity) args[0];
                if (e != null && e.id != null) doses.remove(e.id);
                yield null;
            }
            default -> defaultCrud(doses, d -> d.id, method, args);
        });
    }

    @Bean
    public AppointmentRepository sandboxAppointmentRepository() {
        Comparator<AppointmentEntity> cmp = Comparator
                .comparing((AppointmentEntity a) -> nullSafe(a.appointmentDate))
                .thenComparing(a -> nullSafe(a.appointmentTime));
        return repoProxy(AppointmentRepository.class, (method, args) -> switch (method) {
            case "save" -> {
                AppointmentEntity e = (AppointmentEntity) args[0];
                appointments.put(e.id, e);
                yield e;
            }
            case "findByWorkspaceOwnerIdOrderByAppointmentDateAscAppointmentTimeAsc" -> {
                String ws = (String) args[0];
                yield appointments.values().stream()
                        .filter(a -> ws.equals(a.workspaceOwnerId))
                        .sorted(cmp)
                        .toList();
            }
            case "findByWorkspaceOwnerIdAndAppointmentDateOrderByAppointmentTimeAsc" -> {
                String ws = (String) args[0];
                String dt = (String) args[1];
                yield appointments.values().stream()
                        .filter(a -> ws.equals(a.workspaceOwnerId) && dt.equals(a.appointmentDate))
                        .sorted(Comparator.comparing(a -> nullSafe(a.appointmentTime)))
                        .toList();
            }
            case "findByWorkspaceOwnerIdAndPatientIdOrderByAppointmentDateAscAppointmentTimeAsc" -> {
                String ws = (String) args[0];
                String pid = (String) args[1];
                yield appointments.values().stream()
                        .filter(a -> ws.equals(a.workspaceOwnerId) && pid.equals(a.patientId))
                        .sorted(cmp)
                        .toList();
            }
            case "findByWorkspaceOwnerIdAndAppointmentDateGreaterThanEqualOrderByAppointmentDateAscAppointmentTimeAsc" -> {
                String ws = (String) args[0];
                String today = (String) args[1];
                yield appointments.values().stream()
                        .filter(a -> ws.equals(a.workspaceOwnerId) && nullSafe(a.appointmentDate).compareTo(today) >= 0)
                        .sorted(cmp)
                        .toList();
            }
            case "findByIdAndWorkspaceOwnerId" -> {
                AppointmentEntity a = appointments.get((String) args[0]);
                yield (a != null && args[1].equals(a.workspaceOwnerId)) ? Optional.of(a) : Optional.empty();
            }
            case "delete" -> {
                AppointmentEntity e = (AppointmentEntity) args[0];
                if (e != null && e.id != null) appointments.remove(e.id);
                yield null;
            }
            default -> defaultCrud(appointments, a -> a.id, method, args);
        });
    }

    @Bean
    public PatientNoteRepository sandboxPatientNoteRepository() {
        return repoProxy(PatientNoteRepository.class, (method, args) -> switch (method) {
            case "save" -> {
                PatientNoteEntity e = (PatientNoteEntity) args[0];
                notes.put(e.id, e);
                yield e;
            }
            case "findByWorkspaceOwnerIdOrderByCreatedAtDesc" -> {
                String ws = (String) args[0];
                yield notes.values().stream()
                        .filter(n -> ws.equals(n.workspaceOwnerId))
                        .sorted(Comparator.comparing((PatientNoteEntity n) -> nullSafe(n.createdAt)).reversed())
                        .toList();
            }
            case "findByWorkspaceOwnerIdAndPatientIdOrderByCreatedAtDesc" -> {
                String ws = (String) args[0];
                String pid = (String) args[1];
                yield notes.values().stream()
                        .filter(n -> ws.equals(n.workspaceOwnerId) && pid.equals(n.patientId))
                        .sorted(Comparator.comparing((PatientNoteEntity n) -> nullSafe(n.createdAt)).reversed())
                        .toList();
            }
            case "findByIdAndWorkspaceOwnerId" -> {
                PatientNoteEntity n = notes.get((String) args[0]);
                yield (n != null && args[1].equals(n.workspaceOwnerId)) ? Optional.of(n) : Optional.empty();
            }
            case "delete" -> {
                PatientNoteEntity e = (PatientNoteEntity) args[0];
                if (e != null && e.id != null) notes.remove(e.id);
                yield null;
            }
            default -> defaultCrud(notes, n -> n.id, method, args);
        });
    }

    @Bean
    public ActivityLogRepository sandboxActivityLogRepository() {
        return repoProxy(ActivityLogRepository.class, (method, args) -> switch (method) {
            case "save" -> {
                ActivityLogEntity e = (ActivityLogEntity) args[0];
                activityLogs.add(e);
                yield e;
            }
            case "findByWorkspaceOwnerIdOrderByEventTimestampDesc" -> {
                String ws = (String) args[0];
                Pageable pg = (Pageable) args[1];
                yield activityLogs.stream()
                        .filter(l -> ws.equals(l.workspaceOwnerId))
                        .sorted(Comparator.comparing((ActivityLogEntity l) -> nullSafe(l.eventTimestamp)).reversed())
                        .limit(pg.isPaged() ? pg.getPageSize() : Long.MAX_VALUE)
                        .toList();
            }
            case "findByWorkspaceOwnerIdAndEntityTypeOrderByEventTimestampDesc" -> {
                String ws = (String) args[0];
                String type = (String) args[1];
                Pageable pg = (Pageable) args[2];
                yield activityLogs.stream()
                        .filter(l -> ws.equals(l.workspaceOwnerId) && type.equals(l.entityType))
                        .sorted(Comparator.comparing((ActivityLogEntity l) -> nullSafe(l.eventTimestamp)).reversed())
                        .limit(pg.isPaged() ? pg.getPageSize() : Long.MAX_VALUE)
                        .toList();
            }
            case "findByWorkspaceOwnerIdAndActionOrderByEventTimestampDesc" -> {
                String ws = (String) args[0];
                String act = (String) args[1];
                Pageable pg = (Pageable) args[2];
                yield activityLogs.stream()
                        .filter(l -> ws.equals(l.workspaceOwnerId) && act.equals(l.action))
                        .sorted(Comparator.comparing((ActivityLogEntity l) -> nullSafe(l.eventTimestamp)).reversed())
                        .limit(pg.isPaged() ? pg.getPageSize() : Long.MAX_VALUE)
                        .toList();
            }
            default -> List.of();
        });
    }

    @Bean
    public ClinicRepository sandboxClinicRepository() {
        return repoProxy(ClinicRepository.class, (method, args) -> switch (method) {
            case "save" -> {
                ClinicEntity e = (ClinicEntity) args[0];
                clinics.put(e.id, e);
                yield e;
            }
            case "findByOwnerId" -> clinics.values().stream()
                    .filter(c -> args[0].equals(c.ownerId))
                    .findFirst();
            default -> defaultCrud(clinics, c -> c.id, method, args);
        });
    }

    @Bean
    public ClinicMemberRepository sandboxClinicMemberRepository() {
        return repoProxy(ClinicMemberRepository.class, (method, args) -> switch (method) {
            case "save" -> {
                ClinicMemberEntity e = (ClinicMemberEntity) args[0];
                members.removeIf(m -> e.clinicId.equals(m.clinicId) && e.memberUid.equals(m.memberUid));
                members.add(e);
                yield e;
            }
            case "existsByClinicIdAndMemberUid" -> members.stream()
                    .anyMatch(m -> args[0].equals(m.clinicId) && args[1].equals(m.memberUid));
            case "findFirstByMemberUidAndRoleNot" -> members.stream()
                    .filter(m -> args[0].equals(m.memberUid) && !args[1].equals(m.role))
                    .findFirst();
            case "findFirstByClinicIdAndMemberUid" -> members.stream()
                    .filter(m -> args[0].equals(m.clinicId) && args[1].equals(m.memberUid))
                    .findFirst();
            case "findByClinicIdOrderByJoinedAtAsc" -> members.stream()
                    .filter(m -> args[0].equals(m.clinicId))
                    .sorted(Comparator.comparing(m -> nullSafe(m.joinedAt)))
                    .toList();
            case "deleteByClinicIdAndMemberUid" -> {
                members.removeIf(m -> args[0].equals(m.clinicId) && args[1].equals(m.memberUid));
                yield null;
            }
            default -> List.of();
        });
    }

    @Bean
    public ClinicInviteRepository sandboxClinicInviteRepository() {
        return repoProxy(ClinicInviteRepository.class, (method, args) -> switch (method) {
            case "save" -> {
                ClinicInviteEntity e = (ClinicInviteEntity) args[0];
                invites.put(e.id, e);
                yield e;
            }
            case "findByIdAndClinicId" -> {
                ClinicInviteEntity inv = invites.get((String) args[0]);
                yield (inv != null && args[1].equals(inv.clinicId)) ? Optional.of(inv) : Optional.empty();
            }
            case "findByClinicIdAndEmailIgnoreCaseAndStatus" -> {
                String cid = (String) args[0];
                String email = (String) args[1];
                String status = (String) args[2];
                yield invites.values().stream()
                        .filter(i -> cid.equals(i.clinicId) && email.equalsIgnoreCase(i.email) && status.equals(i.status))
                        .toList();
            }
            case "findByClinicIdAndStatusOrderByCreatedAtDesc" -> {
                String cid = (String) args[0];
                String status = (String) args[1];
                yield invites.values().stream()
                        .filter(i -> cid.equals(i.clinicId) && status.equals(i.status))
                        .sorted(Comparator.comparing((ClinicInviteEntity i) -> nullSafe(i.createdAt)).reversed())
                        .toList();
            }
            case "findByEmailIgnoreCaseAndStatusOrderByCreatedAtDesc" -> {
                String email = (String) args[0];
                String status = (String) args[1];
                yield invites.values().stream()
                        .filter(i -> email.equalsIgnoreCase(i.email) && status.equals(i.status))
                        .sorted(Comparator.comparing((ClinicInviteEntity i) -> nullSafe(i.createdAt)).reversed())
                        .toList();
            }
            default -> defaultCrud(invites, i -> i.id, method, args);
        });
    }

    @Bean
    public UserSettingsRepository sandboxUserSettingsRepository() {
        return repoProxy(UserSettingsRepository.class, (method, args) -> switch (method) {
            case "save" -> {
                UserSettingsEntity e = (UserSettingsEntity) args[0];
                settings.put(e.userId, e);
                yield e;
            }
            default -> defaultCrud(settings, s -> s.userId, method, args);
        });
    }

    private static String nullSafe(String s) {
        return s != null ? s : "";
    }

    private static <T> Object defaultCrud(Map<String, T> map, Function<T, String> idFn, String method, Object[] args) {
        return switch (method) {
            case "findById" -> Optional.ofNullable(map.get((String) args[0]));
            case "existsById" -> map.containsKey((String) args[0]);
            case "findAll" -> List.copyOf(map.values());
            case "deleteById" -> {
                map.remove((String) args[0]);
                yield null;
            }
            case "count" -> (long) map.size();
            default -> throw new UnsupportedOperationException("Método não implementado no Sandbox: " + method);
        };
    }

    @FunctionalInterface
    private interface RepoDispatcher {
        Object invoke(String method, Object[] args);
    }

    @SuppressWarnings("unchecked")
    private static <R> R repoProxy(Class<R> iface, RepoDispatcher dispatcher) {
        return (R) Proxy.newProxyInstance(
                iface.getClassLoader(),
                new Class<?>[]{iface},
                (proxy, method, args) -> switch (method.getName()) {
                    case "toString" -> iface.getSimpleName() + "[SandboxInMemory]";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == (args != null && args.length > 0 ? args[0] : null);
                    default -> dispatcher.invoke(method.getName(), args != null ? args : new Object[0]);
                }
        );
    }
}
