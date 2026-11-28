package com.neurodose.clinic;

import com.neurodose.activity.ActivityLogService;
import com.neurodose.clinic.ClinicDtos.*;
import com.neurodose.security.AuthenticatedUser;
import com.neurodose.security.TenantAccessGuard;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ClinicService {

    public static final String ROLE_OWNER = "owner";
    public static final String ROLE_ADMIN = "admin";
    public static final String ROLE_MEMBER = "member";
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_ACCEPTED = "accepted";
    private static final long INVITE_TTL_DAYS = 7L;

    private final ClinicRepository clinicRepository;
    private final ClinicMemberRepository memberRepository;
    private final ClinicInviteRepository inviteRepository;
    private final ActivityLogService activityLogService;
    private final TenantAccessGuard guard;

    public ClinicService(
            ClinicRepository clinicRepository,
            ClinicMemberRepository memberRepository,
            ClinicInviteRepository inviteRepository,
            ActivityLogService activityLogService,
            TenantAccessGuard guard
    ) {
        this.clinicRepository = clinicRepository;
        this.memberRepository = memberRepository;
        this.inviteRepository = inviteRepository;
        this.activityLogService = activityLogService;
        this.guard = guard;
    }

    public IdResponse createClinic(CreateClinicRequest req) {
        AuthenticatedUser user = guard.currentUser();
        Instant nowInstant = Instant.now();
        String now = nowInstant.toString();
        String ownerEmail = firstNonBlank(
                normalizeEmail(user.email()),
                normalizeEmail(req.ownerEmail())
        );

        ClinicEntity clinic = clinicRepository.findById(user.uid()).orElseGet(ClinicEntity::new);
        boolean isNew = clinic.createdAt == null;
        clinic.id = user.uid();
        clinic.name = req.name().trim();
        clinic.ownerId = user.uid();
        clinic.ownerEmail = ownerEmail;
        if (isNew) {
            clinic.createdAt = now;
        } else {
            clinic.updatedAt = now;
        }
        clinicRepository.save(clinic);

        if (!memberRepository.existsByClinicIdAndMemberUid(user.uid(), user.uid())) {
            ClinicMemberEntity ownerMember = new ClinicMemberEntity();
            ownerMember.id = UUID.randomUUID().toString();
            ownerMember.clinicId = user.uid();
            ownerMember.memberUid = user.uid();
            ownerMember.email = ownerEmail;
            ownerMember.name = user.name();
            ownerMember.role = ROLE_OWNER;
            ownerMember.joinedAt = now;
            memberRepository.save(ownerMember);
        }

        activityLogService.record(
                user.uid(),
                user.uid(),
                isNew ? "create" : "update",
                "clinic",
                clinic.id,
                clinic.name,
                user.name(),
                ownerEmail,
                null
        );

        return new IdResponse(user.uid());
    }

    public Optional<ClinicDto> getUserClinic(String userId) {
        guard.requireSelf(userId);

        Optional<ClinicEntity> owned = clinicRepository.findById(userId);
        if (owned.isPresent()) {
            return Optional.of(toClinicDto(owned.get()));
        }

        return memberRepository.findFirstByMemberUidAndRoleNot(userId, ROLE_OWNER)
                .flatMap(membership -> clinicRepository.findById(membership.clinicId))
                .map(this::toClinicDto);
    }

    public Optional<ClinicMembershipDto> getClinicMembership(String userId) {
        guard.requireSelf(userId);

        Optional<ClinicMemberEntity> membership = memberRepository.findFirstByMemberUidAndRoleNot(userId, ROLE_OWNER);
        if (membership.isEmpty()) {
            return Optional.empty();
        }

        ClinicMemberEntity m = membership.get();
        String clinicName = clinicRepository.findById(m.clinicId)
                .map(c -> c.name)
                .orElse("Clínica");

        return Optional.of(new ClinicMembershipDto(m.clinicId, clinicName, m.role, m.joinedAt));
    }

    public EffectiveWorkspaceResponse getEffectiveWorkspace(String userId) {
        guard.requireSelf(userId);

        if (clinicRepository.existsById(userId)) {
            return new EffectiveWorkspaceResponse(userId);
        }

        String effectiveId = memberRepository.findFirstByMemberUidAndRoleNot(userId, ROLE_OWNER)
                .map(m -> m.clinicId)
                .orElse(userId);
        return new EffectiveWorkspaceResponse(effectiveId);
    }

    public void updateClinic(String clinicId, UpdateClinicRequest req) {
        AuthenticatedUser actor = guard.requireClinicManager(clinicId);
        ClinicEntity clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clínica não encontrada"));

        clinic.name = req.name().trim();
        clinic.updatedAt = Instant.now().toString();
        clinicRepository.save(clinic);

        activityLogService.record(
                clinicId,
                actor.uid(),
                "update",
                "clinic",
                clinicId,
                clinic.name,
                actor.name(),
                actor.email(),
                null
        );
    }

    public List<ClinicMemberDto> getClinicMembers(String clinicId) {
        guard.requireWorkspaceAccess(clinicId);
        return memberRepository.findByClinicIdOrderByJoinedAtAsc(clinicId).stream()
                .map(this::toMemberDto)
                .toList();
    }

    public void addClinicMember(String clinicId, AddMemberRequest req) {
        AuthenticatedUser actor = guard.requireClinicManager(clinicId);
        if (!clinicRepository.existsById(clinicId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Clínica não encontrada");
        }

        String email = normalizeEmail(req.email());
        boolean alreadyExists = memberRepository.findByClinicIdOrderByJoinedAtAsc(clinicId).stream()
                .anyMatch(m -> email.equalsIgnoreCase(m.email));
        if (alreadyExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já pertence à clínica");
        }

        String role = normalizeAssignableRole(req.role());

        ClinicMemberEntity member = new ClinicMemberEntity();
        member.id = UUID.randomUUID().toString();
        member.clinicId = clinicId;
        member.memberUid = "member_" + UUID.randomUUID();
        member.email = email;
        member.name = firstNonBlank(req.name(), deriveDisplayName(email));
        member.role = role;
        member.joinedAt = Instant.now().toString();
        memberRepository.save(member);

        activityLogService.record(
                clinicId,
                actor.uid(),
                "create",
                "clinic_member",
                member.memberUid,
                member.email,
                actor.name(),
                actor.email(),
                Map.of("role", role)
        );
    }

    public void removeClinicMember(String clinicId, String memberUid) {
        AuthenticatedUser actor = guard.requireClinicManager(clinicId);
        if (clinicId.equals(memberUid)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é permitido remover o proprietário da clínica");
        }

        Optional<ClinicMemberEntity> target = memberRepository.findFirstByClinicIdAndMemberUid(clinicId, memberUid);
        memberRepository.deleteByClinicIdAndMemberUid(clinicId, memberUid);

        activityLogService.record(
                clinicId,
                actor.uid(),
                "delete",
                "clinic_member",
                memberUid,
                target.map(m -> m.email).orElse(memberUid),
                actor.name(),
                actor.email(),
                null
        );
    }

    public InviteCreatedResponse createInvite(String clinicId, CreateInviteRequest req) {
        AuthenticatedUser actor = guard.requireClinicManager(clinicId);
        ClinicEntity clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clínica não encontrada"));

        String email = normalizeEmail(req.email());
        boolean alreadyMember = memberRepository.findByClinicIdOrderByJoinedAtAsc(clinicId).stream()
                .anyMatch(m -> email.equalsIgnoreCase(m.email));
        if (alreadyMember) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já é membro da clínica");
        }

        String role = normalizeAssignableRole(req.role());
        Instant now = Instant.now();
        String expiresAt = now.plus(INVITE_TTL_DAYS, ChronoUnit.DAYS).toString();
        String clinicName = firstNonBlank(req.clinicName(), clinic.name);
        String invitedByName = firstNonBlank(req.invitedByName(), actor.name());

        // Evita convites pendentes duplicados: atualiza o convite pendente existente para o mesmo e-mail
        List<ClinicInviteEntity> existingPending =
                inviteRepository.findByClinicIdAndEmailIgnoreCaseAndStatus(clinicId, email, STATUS_PENDING);

        ClinicInviteEntity invite = existingPending.isEmpty() ? new ClinicInviteEntity() : existingPending.get(0);
        if (invite.id == null) {
            invite.id = UUID.randomUUID().toString();
        }
        invite.clinicId = clinicId;
        invite.clinicName = clinicName;
        invite.email = email;
        invite.role = role;
        invite.status = STATUS_PENDING;
        invite.invitedBy = actor.uid();
        invite.invitedByName = invitedByName;
        invite.createdAt = now.toString();
        invite.expiresAt = expiresAt;
        inviteRepository.save(invite);

        activityLogService.record(
                clinicId,
                actor.uid(),
                "create",
                "clinic_invite",
                invite.id,
                email,
                actor.name(),
                actor.email(),
                Map.of("role", role)
        );

        return new InviteCreatedResponse(invite.id);
    }

    /**
     * Prévia pública (permitAll) minimizada para LGPD: mascara e-mail e omite UID interno do remetente.
     */
    public Optional<ClinicInviteDto> getPublicInvitePreview(String clinicId, String inviteId) {
        return inviteRepository.findByIdAndClinicId(inviteId, clinicId)
                .map(this::toPublicInviteDto);
    }

    public List<ClinicInviteDto> getPendingInvites(String clinicId, String email) {
        if (email == null || email.isBlank()) {
            guard.requireClinicManager(clinicId);
            return inviteRepository.findByClinicIdAndStatusOrderByCreatedAtDesc(clinicId, STATUS_PENDING)
                    .stream()
                    .filter(this::isNotExpired)
                    .map(this::toInviteDto)
                    .toList();
        }

        AuthenticatedUser user = guard.currentUser();
        String normalizedQueryEmail = normalizeEmail(email);
        boolean isSelfEmail = user.email() != null && normalizedQueryEmail.equalsIgnoreCase(user.email().trim());
        if (!isSelfEmail) {
            // Somente gerentes da clínica podem consultar convites de terceiros
            guard.requireClinicManager(clinicId);
        }

        return inviteRepository.findByClinicIdAndEmailIgnoreCaseAndStatus(clinicId, normalizedQueryEmail, STATUS_PENDING)
                .stream()
                .filter(this::isNotExpired)
                .map(this::toInviteDto)
                .toList();
    }

    public List<ClinicInviteDto> getMyPendingInvites() {
        AuthenticatedUser user = guard.currentUser();
        if (user.email() == null || user.email().isBlank()) {
            return List.of();
        }
        return inviteRepository.findByEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(user.email().trim(), STATUS_PENDING)
                .stream()
                .filter(this::isNotExpired)
                .map(this::toInviteDto)
                .toList();
    }

    public void acceptInvite(String clinicId, String inviteId, AcceptInviteRequest req) {
        AuthenticatedUser user = guard.currentUser();

        ClinicInviteEntity invite = inviteRepository.findByIdAndClinicId(inviteId, clinicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Convite não encontrado"));

        if (!STATUS_PENDING.equals(invite.status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este convite já foi utilizado");
        }

        if (!isNotExpired(invite)) {
            throw new ResponseStatusException(HttpStatus.GONE, "Este convite expirou. Solicite um novo convite.");
        }

        // Confia exclusivamente no e-mail do JWT verificado (nunca no corpo JSON enviado pelo cliente)
        String authenticatedEmail = normalizeEmail(user.email());
        if (authenticatedEmail.isBlank()
                || invite.email == null
                || !invite.email.trim().equalsIgnoreCase(authenticatedEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Este convite foi enviado para outro endereço de e-mail"
            );
        }

        ClinicEntity clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clínica não encontrada"));

        String resolvedRole = normalizeAssignableRole(invite.role);
        String displayName = firstNonBlank(
                req != null ? req.userName() : null,
                user.name(),
                deriveDisplayName(authenticatedEmail)
        );

        if (!memberRepository.existsByClinicIdAndMemberUid(clinicId, user.uid())) {
            ClinicMemberEntity member = new ClinicMemberEntity();
            member.id = UUID.randomUUID().toString();
            member.clinicId = clinicId;
            member.memberUid = user.uid();
            member.email = authenticatedEmail;
            member.name = displayName;
            member.role = resolvedRole;
            member.joinedAt = Instant.now().toString();
            memberRepository.save(member);
        }

        clinic.updatedAt = Instant.now().toString();
        clinicRepository.save(clinic);

        invite.status = STATUS_ACCEPTED;
        inviteRepository.save(invite);

        activityLogService.record(
                clinicId,
                user.uid(),
                "update",
                "clinic_invite",
                inviteId,
                "Aceito por " + authenticatedEmail,
                displayName,
                authenticatedEmail,
                Map.of("role", resolvedRole)
        );
    }

    private String normalizeAssignableRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            return ROLE_MEMBER;
        }
        String normalized = rawRole.trim().toLowerCase();
        if (ROLE_ADMIN.equals(normalized) || ROLE_MEMBER.equals(normalized)) {
            return normalized;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Papel inválido. Permitido apenas 'admin' ou 'member'.");
    }

    private boolean isNotExpired(ClinicInviteEntity invite) {
        if (invite.expiresAt == null || invite.expiresAt.isBlank()) {
            return true;
        }
        try {
            return Instant.parse(invite.expiresAt).isAfter(Instant.now());
        } catch (Exception ignored) {
            return true;
        }
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v.trim();
            }
        }
        return "";
    }

    private static String deriveDisplayName(String email) {
        if (email != null && email.contains("@")) {
            return email.substring(0, email.indexOf('@'));
        }
        return "Colaborador";
    }

    static String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "";
        }
        int at = email.indexOf('@');
        String local = email.substring(0, at);
        String domain = email.substring(at);
        String visible = local.length() <= 2 ? local.substring(0, Math.min(1, local.length())) : local.substring(0, 2);
        return visible + "***" + domain;
    }

    private ClinicDto toClinicDto(ClinicEntity clinic) {
        List<ClinicMemberDto> members = memberRepository.findByClinicIdOrderByJoinedAtAsc(clinic.id).stream()
                .map(this::toMemberDto)
                .toList();

        Map<String, Boolean> memberUids = new LinkedHashMap<>();
        for (ClinicMemberDto m : members) {
            memberUids.put(m.uid(), Boolean.TRUE);
        }

        return new ClinicDto(
                clinic.id,
                clinic.name,
                clinic.ownerId,
                clinic.ownerEmail,
                members,
                memberUids,
                clinic.createdAt,
                clinic.updatedAt
        );
    }

    private ClinicMemberDto toMemberDto(ClinicMemberEntity m) {
        return new ClinicMemberDto(m.memberUid, m.email, m.name, m.role, m.joinedAt);
    }

    private ClinicInviteDto toInviteDto(ClinicInviteEntity inv) {
        return new ClinicInviteDto(
                inv.id,
                inv.email,
                inv.clinicId,
                inv.clinicName,
                inv.role,
                inv.status,
                inv.invitedBy,
                inv.invitedByName,
                inv.createdAt,
                inv.expiresAt
        );
    }

    private ClinicInviteDto toPublicInviteDto(ClinicInviteEntity inv) {
        return new ClinicInviteDto(
                inv.id,
                maskEmail(inv.email),
                inv.clinicId,
                inv.clinicName,
                inv.role,
                inv.status,
                null,
                inv.invitedByName,
                inv.createdAt,
                inv.expiresAt
        );
    }
}
