package com.neurodose;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neurodose.activity.ActivityLogEntity;
import com.neurodose.activity.ActivityLogRepository;
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
import com.neurodose.note.PatientNoteRepository;
import com.neurodose.patient.PatientEntity;
import com.neurodose.patient.PatientRepository;
import com.neurodose.settings.UserSettingsEntity;
import com.neurodose.settings.UserSettingsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NeuroDoseApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PatientRepository patientRepository;
    @MockitoBean
    private MedicationRepository medicationRepository;
    @MockitoBean
    private DoseRecordRepository doseRecordRepository;
    @MockitoBean
    private AppointmentRepository appointmentRepository;
    @MockitoBean
    private PatientNoteRepository patientNoteRepository;
    @MockitoBean
    private ActivityLogRepository activityLogRepository;
    @MockitoBean
    private ClinicRepository clinicRepository;
    @MockitoBean
    private ClinicMemberRepository clinicMemberRepository;
    @MockitoBean
    private ClinicInviteRepository clinicInviteRepository;
    @MockitoBean
    private UserSettingsRepository userSettingsRepository;

    private final Map<String, PatientEntity> patients = new ConcurrentHashMap<>();
    private final Map<String, MedicationEntity> medications = new ConcurrentHashMap<>();
    private final Map<String, DoseRecordEntity> doses = new ConcurrentHashMap<>();
    private final List<ActivityLogEntity> logs = new CopyOnWriteArrayList<>();
    private final Map<String, ClinicEntity> clinics = new ConcurrentHashMap<>();
    private final List<ClinicMemberEntity> members = new CopyOnWriteArrayList<>();
    private final Map<String, ClinicInviteEntity> invites = new ConcurrentHashMap<>();
    private final Map<String, UserSettingsEntity> settings = new ConcurrentHashMap<>();

    @BeforeEach
    void wireInMemoryMongoStubs() {
        patients.clear();
        medications.clear();
        doses.clear();
        logs.clear();
        clinics.clear();
        members.clear();
        invites.clear();
        settings.clear();

        when(patientRepository.save(any(PatientEntity.class))).thenAnswer(inv -> {
            PatientEntity e = inv.getArgument(0);
            patients.put(e.id, e);
            return e;
        });
        when(patientRepository.findByWorkspaceOwnerIdOrderByCreatedAtDesc(anyString())).thenAnswer(inv -> {
            String ws = inv.getArgument(0);
            return patients.values().stream()
                    .filter(p -> ws.equals(p.workspaceOwnerId))
                    .sorted(Comparator.comparing((PatientEntity p) -> p.createdAt).reversed())
                    .toList();
        });
        when(patientRepository.findByIdAndWorkspaceOwnerId(anyString(), anyString())).thenAnswer(inv -> {
            PatientEntity p = patients.get(inv.getArgument(0));
            return (p != null && inv.getArgument(1).equals(p.workspaceOwnerId)) ? Optional.of(p) : Optional.empty();
        });

        when(medicationRepository.save(any(MedicationEntity.class))).thenAnswer(inv -> {
            MedicationEntity e = inv.getArgument(0);
            medications.put(e.id, e);
            return e;
        });
        when(medicationRepository.findByWorkspaceOwnerIdOrderByNameAsc(anyString())).thenAnswer(inv -> {
            String ws = inv.getArgument(0);
            return medications.values().stream()
                    .filter(m -> ws.equals(m.workspaceOwnerId))
                    .sorted(Comparator.comparing(m -> m.name))
                    .toList();
        });

        when(doseRecordRepository.save(any(DoseRecordEntity.class))).thenAnswer(inv -> {
            DoseRecordEntity e = inv.getArgument(0);
            doses.put(e.id, e);
            return e;
        });
        when(doseRecordRepository.findByWorkspaceOwnerIdOrderByDoseTimestampDesc(anyString(), any(Pageable.class)))
                .thenAnswer(inv -> {
                    String ws = inv.getArgument(0);
                    return doses.values().stream()
                            .filter(d -> ws.equals(d.workspaceOwnerId))
                            .sorted(Comparator.comparing((DoseRecordEntity d) -> d.doseTimestamp).reversed())
                            .toList();
                });

        when(activityLogRepository.save(any(ActivityLogEntity.class))).thenAnswer(inv -> {
            ActivityLogEntity e = inv.getArgument(0);
            logs.add(e);
            return e;
        });
        when(activityLogRepository.findByWorkspaceOwnerIdOrderByEventTimestampDesc(anyString(), any(Pageable.class)))
                .thenAnswer(inv -> {
                    String ws = inv.getArgument(0);
                    return logs.stream()
                            .filter(l -> ws.equals(l.workspaceOwnerId))
                            .sorted(Comparator.comparing((ActivityLogEntity l) -> l.eventTimestamp).reversed())
                            .toList();
                });

        when(clinicRepository.save(any(ClinicEntity.class))).thenAnswer(inv -> {
            ClinicEntity e = inv.getArgument(0);
            clinics.put(e.id, e);
            return e;
        });
        when(clinicRepository.findById(anyString())).thenAnswer(inv -> Optional.ofNullable(clinics.get(inv.getArgument(0))));

        when(clinicMemberRepository.save(any(ClinicMemberEntity.class))).thenAnswer(inv -> {
            ClinicMemberEntity e = inv.getArgument(0);
            members.removeIf(m -> e.clinicId.equals(m.clinicId) && e.memberUid.equals(m.memberUid));
            members.add(e);
            return e;
        });
        when(clinicMemberRepository.existsByClinicIdAndMemberUid(anyString(), anyString())).thenAnswer(inv -> {
            String clinicId = inv.getArgument(0);
            String uid = inv.getArgument(1);
            return members.stream().anyMatch(m -> clinicId.equals(m.clinicId) && uid.equals(m.memberUid));
        });
        when(clinicMemberRepository.findFirstByMemberUidAndRoleNot(anyString(), anyString())).thenAnswer(inv -> {
            String uid = inv.getArgument(0);
            String excludedRole = inv.getArgument(1);
            return members.stream()
                    .filter(m -> uid.equals(m.memberUid) && !excludedRole.equals(m.role))
                    .findFirst();
        });
        when(clinicMemberRepository.findFirstByClinicIdAndMemberUid(anyString(), anyString())).thenAnswer(inv -> {
            String clinicId = inv.getArgument(0);
            String uid = inv.getArgument(1);
            return members.stream()
                    .filter(m -> clinicId.equals(m.clinicId) && uid.equals(m.memberUid))
                    .findFirst();
        });
        when(clinicMemberRepository.findByClinicIdOrderByJoinedAtAsc(anyString())).thenAnswer(inv -> {
            String clinicId = inv.getArgument(0);
            return members.stream().filter(m -> clinicId.equals(m.clinicId)).toList();
        });

        when(clinicInviteRepository.save(any(ClinicInviteEntity.class))).thenAnswer(inv -> {
            ClinicInviteEntity e = inv.getArgument(0);
            invites.put(e.id, e);
            return e;
        });
        when(clinicInviteRepository.findByIdAndClinicId(anyString(), anyString())).thenAnswer(inv -> {
            ClinicInviteEntity i = invites.get(inv.getArgument(0));
            return (i != null && inv.getArgument(1).equals(i.clinicId)) ? Optional.of(i) : Optional.empty();
        });
        when(clinicInviteRepository.findByClinicIdAndEmailIgnoreCaseAndStatus(anyString(), anyString(), anyString()))
                .thenAnswer(inv -> {
                    String clinicId = inv.getArgument(0);
                    String email = inv.getArgument(1);
                    String status = inv.getArgument(2);
                    return invites.values().stream()
                            .filter(i -> clinicId.equals(i.clinicId)
                                    && email.equalsIgnoreCase(i.email)
                                    && status.equals(i.status))
                            .toList();
                });
        when(clinicInviteRepository.findByClinicIdAndStatusOrderByCreatedAtDesc(anyString(), anyString()))
                .thenAnswer(inv -> {
                    String clinicId = inv.getArgument(0);
                    String status = inv.getArgument(1);
                    return invites.values().stream()
                            .filter(i -> clinicId.equals(i.clinicId) && status.equals(i.status))
                            .sorted(Comparator.comparing((ClinicInviteEntity i) -> i.createdAt).reversed())
                            .toList();
                });
        when(clinicInviteRepository.findByEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(anyString(), anyString()))
                .thenAnswer(inv -> {
                    String email = inv.getArgument(0);
                    String status = inv.getArgument(1);
                    return invites.values().stream()
                            .filter(i -> email.equalsIgnoreCase(i.email) && status.equals(i.status))
                            .sorted(Comparator.comparing((ClinicInviteEntity i) -> i.createdAt).reversed())
                            .toList();
                });

        when(userSettingsRepository.save(any(UserSettingsEntity.class))).thenAnswer(inv -> {
            UserSettingsEntity e = inv.getArgument(0);
            settings.put(e.userId, e);
            return e;
        });
        when(userSettingsRepository.findById(anyString()))
                .thenAnswer(inv -> Optional.ofNullable(settings.get(inv.getArgument(0))));
    }

    @Test
    void healthEndpointIsPublicAndWorkspaceRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));

        mockMvc.perform(get("/api/v1/workspaces/user-owner/patients"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void fullClinicalWorkflowAndMultiTenantIsolation() throws Exception {
        var ownerJwt = jwt().jwt(b -> b
                .subject("owner-1")
                .claim("email", "dra.ana@neurodose.com")
                .claim("name", "Dra. Ana"));

        var outsiderJwt = jwt().jwt(b -> b
                .subject("outsider-9")
                .claim("email", "outro@neurodose.com")
                .claim("name", "Dr. Outro"));

        var memberJwt = jwt().jwt(b -> b
                .subject("member-2")
                .claim("email", "residente@neurodose.com")
                .claim("name", "Dr. Residente"));

        // 1. Criar paciente e medicamento no workspace owner-1
        MvcResult patientRes = mockMvc.perform(post("/api/v1/workspaces/owner-1/patients")
                        .with(ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Lucas Silva",
                                  "age": 24,
                                  "gender": "Masculino",
                                  "condition": "TDAH",
                                  "activeMedicationIds": ["med-a"]
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String patientId = readId(patientRes);

        MvcResult medRes = mockMvc.perform(post("/api/v1/workspaces/owner-1/medications")
                        .with(ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Ritalina",
                                  "brandName": "Novartis",
                                  "activeIngredient": "Metilfenidato",
                                  "therapeuticClass": "Estimulante",
                                  "form": "Comprimido",
                                  "minDose": 5,
                                  "maxDose": 20,
                                  "unit": "mg",
                                  "halfLifeHours": 3.5
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String medId = readId(medRes);

        // 2. Registrar dose com subdocumento BSON nativo e verificar log automático de auditoria
        mockMvc.perform(post("/api/v1/workspaces/owner-1/doses")
                        .with(ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "patientId": "%s",
                                  "medicationId": "%s",
                                  "doseAmount": "10",
                                  "time": "08:00",
                                  "indication": "TDAH",
                                  "subjectiveState": { "mood": 4, "energy": 8, "sleep": 7 },
                                  "analysis": { "efficacyPrediction": 84, "recommendation": "Manter" },
                                  "timestamp": "2026-11-27T11:00:00.000Z",
                                  "patientName": "Lucas Silva",
                                  "medicationName": "Ritalina"
                                }
                                """.formatted(patientId, medId)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/workspaces/owner-1/doses").with(ownerJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].doseAmount").value("10"))
                .andExpect(jsonPath("$[0].subjectiveState.mood").value(4))
                .andExpect(jsonPath("$[0].analysis.efficacyPrediction").value(84));

        mockMvc.perform(get("/api/v1/workspaces/owner-1/activity-logs").with(ownerJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));

        // 3. Outsider não autorizado recebe 403 Forbidden
        mockMvc.perform(get("/api/v1/workspaces/owner-1/patients").with(outsiderJwt))
                .andExpect(status().isForbidden());

        // 4. Criar clínica, emitir convite e aceitar com member-2
        mockMvc.perform(post("/api/v1/clinics")
                        .with(ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "name": "Clínica Neuro Vida", "ownerEmail": "dra.ana@neurodose.com" }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("owner-1"));

        // Rejeita tentativa de escalar papel para "owner" via convite (400 Bad Request)
        mockMvc.perform(post("/api/v1/clinics/owner-1/invites")
                        .with(ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "clinicName": "Clínica Neuro Vida",
                                  "email": "residente@neurodose.com",
                                  "role": "owner"
                                }
                                """))
                .andExpect(status().isBadRequest());

        MvcResult inviteRes = mockMvc.perform(post("/api/v1/clinics/owner-1/invites")
                        .with(ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "clinicName": "Clínica Neuro Vida",
                                  "email": "residente@neurodose.com",
                                  "role": "member"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();
        String inviteId = objectMapper.readTree(inviteRes.getResponse().getContentAsString()).get("inviteId").asText();

        // Reenvio para o mesmo e-mail deduplica em vez de criar convites pendentes duplicados
        mockMvc.perform(post("/api/v1/clinics/owner-1/invites")
                        .with(ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "clinicName": "Clínica Neuro Vida",
                                  "email": "residente@neurodose.com",
                                  "role": "member"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteId").value(inviteId));

        // Leitura pública de prévia do convite funciona sem autenticação, mascarando PII (e-mail e invitedBy)
        mockMvc.perform(get("/api/v1/clinics/owner-1/invites/" + inviteId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clinicName").value("Clínica Neuro Vida"))
                .andExpect(jsonPath("$.email").value("re***@neurodose.com"))
                .andExpect(jsonPath("$.invitedBy").doesNotExist());

        // Terceiro não autorizado não consegue enumerar convites de outro e-mail (403 Forbidden)
        mockMvc.perform(get("/api/v1/clinics/owner-1/invites")
                        .param("email", "residente@neurodose.com")
                        .with(outsiderJwt))
                .andExpect(status().isForbidden());

        // Proprietário consegue listar convites pendentes da clínica e convidado descobre automaticamente
        mockMvc.perform(get("/api/v1/clinics/owner-1/invites").with(ownerJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].email").value("residente@neurodose.com"));

        mockMvc.perform(get("/api/v1/invites/pending").with(memberJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(inviteId));

        // P1 Segurança: usuário com outro e-mail NÃO consegue sequestrar o convite (403 Forbidden)
        mockMvc.perform(post("/api/v1/clinics/owner-1/invites/" + inviteId + "/accept")
                        .with(outsiderJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "userEmail": "outro@neurodose.com", "userName": "Dr. Outro" }
                                """))
                .andExpect(status().isForbidden());

        // Membro aceita convite e passa a enxergar o workspace compartilhado owner-1
        mockMvc.perform(post("/api/v1/clinics/owner-1/invites/" + inviteId + "/accept")
                        .with(memberJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "userEmail": "residente@neurodose.com", "userName": "Dr. Residente" }
                                """))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/users/member-2/effective-workspace").with(memberJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.effectiveUserId").value("owner-1"));

        mockMvc.perform(get("/api/v1/workspaces/owner-1/patients").with(memberJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Lucas Silva"));

        // DevSecOps RBAC: membro comum (role="member") não pode excluir prontuário de paciente (403), mas owner pode (204)
        mockMvc.perform(delete("/api/v1/workspaces/owner-1/patients/" + patientId).with(memberJwt))
                .andExpect(status().isForbidden());

        // DevSecOps Validação: payload inválido (nome em branco) retorna 400 Bad Request
        mockMvc.perform(post("/api/v1/workspaces/owner-1/patients")
                        .with(ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "name": "   ", "age": 20 }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("validation-error"));

        // 5. Configurações de usuário
        mockMvc.perform(patch("/api/v1/users/owner-1/settings/profile")
                        .with(ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "fullName": "Dra. Ana Beatriz", "crm": "CRM-SP 123456" }
                                """))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/users/owner-1/settings").with(ownerJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.crm").value("CRM-SP 123456"))
                .andExpect(jsonPath("$.ai.confidence").value("high"));
    }

    private String readId(MvcResult result) throws Exception {
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String id = json.get("id").asText();
        assertThat(id).isNotBlank();
        return id;
    }
}
