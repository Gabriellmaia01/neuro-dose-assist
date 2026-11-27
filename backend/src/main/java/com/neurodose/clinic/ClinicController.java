package com.neurodose.clinic;

import com.neurodose.security.AuthenticatedUser;
import com.neurodose.security.TenantAccessGuard;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
public class ClinicController {

    private final ClinicRepository clinicRepository;
    private final ClinicMemberRepository memberRepository;
    private final ClinicInviteRepository inviteRepository;
    private final TenantAccessGuard guard;

    public ClinicController(
            ClinicRepository clinicRepository,
            ClinicMemberRepository memberRepository,
            ClinicInviteRepository inviteRepository,
            TenantAccessGuard guard
    ) {
        this.clinicRepository = clinicRepository;
        this.memberRepository = memberRepository;
        this.inviteRepository = inviteRepository;
        this.guard = guard;
    }

    public record ClinicMemberDto(String uid, String email, String name, String role, String joinedAt) {}

    public record ClinicDto(
            String id,
            String name,
            String ownerId,
            String ownerEmail,
            List<ClinicMemberDto> members,
            Map<String, Boolean> memberUids,
            String createdAt,
            String updatedAt
    ) {}

    public record ClinicMembershipDto(String clinicOwnerId, String clinicName, String role, String joinedAt) {}

    public record ClinicInviteDto(
            String id,
            String email,
            String clinicId,
            String clinicName,
            String role,
            String status,
            String invitedBy,
            String invitedByName,
            String createdAt
    ) {}

    public record CreateClinicRequest(String name, String ownerEmail) {}
    public record UpdateClinicRequest(String name) {}
    public record CreateInviteRequest(String clinicName, String email, String role, String invitedByName) {}
    public record AcceptInviteRequest(String userEmail, String userName) {}
    public record AddMemberRequest(String email, String name, String role) {}

    @PostMapping("/clinics")
    public Map<String, String> createClinic(@RequestBody CreateClinicRequest req) {
        AuthenticatedUser user = guard.currentUser();
        String now = Instant.now().toString();
        String ownerEmail = (req.ownerEmail() != null && !req.ownerEmail().isBlank())
                ? req.ownerEmail().trim().toLowerCase()
                : (user.email() != null ? user.email().toLowerCase() : "");

        ClinicEntity clinic = clinicRepository.findById(user.uid()).orElseGet(ClinicEntity::new);
        clinic.id = user.uid();
        clinic.name = req.name().trim();
        clinic.ownerId = user.uid();
        clinic.ownerEmail = ownerEmail;
        if (clinic.createdAt == null) {
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
            ownerMember.role = "owner";
            ownerMember.joinedAt = now;
            memberRepository.save(ownerMember);
        }

        return Map.of("id", user.uid());
    }

    @GetMapping("/users/{userId}/clinic")
    public ResponseEntity<ClinicDto> getUserClinic(@PathVariable String userId) {
        guard.requireSelf(userId);

        Optional<ClinicEntity> owned = clinicRepository.findById(userId);
        if (owned.isPresent()) {
            return ResponseEntity.ok(toClinicDto(owned.get()));
        }

        Optional<ClinicMemberEntity> membership = memberRepository.findFirstByMemberUidAndRoleNot(userId, "owner");
        if (membership.isPresent()) {
            Optional<ClinicEntity> ownerClinic = clinicRepository.findById(membership.get().clinicId);
            if (ownerClinic.isPresent()) {
                return ResponseEntity.ok(toClinicDto(ownerClinic.get()));
            }
        }

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{userId}/clinic-membership")
    public ResponseEntity<ClinicMembershipDto> getClinicMembership(@PathVariable String userId) {
        guard.requireSelf(userId);

        Optional<ClinicMemberEntity> membership = memberRepository.findFirstByMemberUidAndRoleNot(userId, "owner");
        if (membership.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        ClinicMemberEntity m = membership.get();
        String clinicName = clinicRepository.findById(m.clinicId)
                .map(c -> c.name)
                .orElse("Clínica");

        return ResponseEntity.ok(new ClinicMembershipDto(m.clinicId, clinicName, m.role, m.joinedAt));
    }

    @GetMapping("/users/{userId}/effective-workspace")
    public Map<String, String> getEffectiveWorkspace(@PathVariable String userId) {
        guard.requireSelf(userId);

        if (clinicRepository.existsById(userId)) {
            return Map.of("effectiveUserId", userId);
        }

        return memberRepository.findFirstByMemberUidAndRoleNot(userId, "owner")
                .map(m -> Map.of("effectiveUserId", m.clinicId))
                .orElseGet(() -> Map.of("effectiveUserId", userId));
    }

    @PatchMapping("/clinics/{clinicId}")
    public ResponseEntity<Void> updateClinic(
            @PathVariable String clinicId,
            @RequestBody UpdateClinicRequest req
    ) {
        guard.requireClinicManager(clinicId);
        ClinicEntity clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clínica não encontrada"));
        if (req.name() != null && !req.name().isBlank()) {
            clinic.name = req.name().trim();
        }
        clinic.updatedAt = Instant.now().toString();
        clinicRepository.save(clinic);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/clinics/{clinicId}/members")
    public List<ClinicMemberDto> getClinicMembers(@PathVariable String clinicId) {
        guard.requireWorkspaceAccess(clinicId);
        return memberRepository.findByClinicIdOrderByJoinedAtAsc(clinicId).stream()
                .map(this::toMemberDto)
                .toList();
    }

    @PostMapping("/clinics/{clinicId}/members")
    public ResponseEntity<Void> addClinicMember(
            @PathVariable String clinicId,
            @RequestBody AddMemberRequest req
    ) {
        guard.requireClinicManager(clinicId);
        if (!clinicRepository.existsById(clinicId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Clínica não encontrada");
        }
        ClinicMemberEntity member = new ClinicMemberEntity();
        member.id = UUID.randomUUID().toString();
        member.clinicId = clinicId;
        member.memberUid = "member_" + System.currentTimeMillis();
        member.email = req.email().trim().toLowerCase();
        member.name = req.name();
        member.role = req.role() != null ? req.role() : "member";
        member.joinedAt = Instant.now().toString();
        memberRepository.save(member);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/clinics/{clinicId}/members/{memberUid}")
    public ResponseEntity<Void> removeClinicMember(
            @PathVariable String clinicId,
            @PathVariable String memberUid
    ) {
        guard.requireClinicManager(clinicId);
        if (clinicId.equals(memberUid)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é permitido remover o proprietário da clínica");
        }
        memberRepository.deleteByClinicIdAndMemberUid(clinicId, memberUid);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/clinics/{clinicId}/invites")
    public Map<String, Object> createInvite(
            @PathVariable String clinicId,
            @RequestBody CreateInviteRequest req
    ) {
        AuthenticatedUser user = guard.requireClinicManager(clinicId);
        ClinicEntity clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clínica não encontrada"));

        String inviteId = UUID.randomUUID().toString();
        ClinicInviteEntity invite = new ClinicInviteEntity();
        invite.id = inviteId;
        invite.clinicId = clinicId;
        invite.clinicName = (req.clinicName() != null && !req.clinicName().isBlank()) ? req.clinicName() : clinic.name;
        invite.email = req.email().trim().toLowerCase();
        invite.role = req.role() != null ? req.role() : "member";
        invite.status = "pending";
        invite.invitedBy = user.uid();
        invite.invitedByName = req.invitedByName() != null ? req.invitedByName() : user.name();
        invite.createdAt = Instant.now().toString();

        inviteRepository.save(invite);
        return Map.of("inviteId", inviteId);
    }

    @GetMapping("/clinics/{clinicId}/invites/{inviteId}")
    public ResponseEntity<ClinicInviteDto> getInviteById(
            @PathVariable String clinicId,
            @PathVariable String inviteId
    ) {
        return inviteRepository.findByIdAndClinicId(inviteId, clinicId)
                .map(inv -> ResponseEntity.ok(toInviteDto(inv)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/clinics/{clinicId}/invites")
    public List<ClinicInviteDto> getPendingInvites(
            @PathVariable String clinicId,
            @RequestParam String email
    ) {
        guard.currentUser();
        return inviteRepository.findByClinicIdAndEmailIgnoreCaseAndStatus(clinicId, email.trim(), "pending")
                .stream()
                .map(this::toInviteDto)
                .toList();
    }

    @PostMapping("/clinics/{clinicId}/invites/{inviteId}/accept")
    public ResponseEntity<Void> acceptInvite(
            @PathVariable String clinicId,
            @PathVariable String inviteId,
            @RequestBody AcceptInviteRequest req
    ) {
        AuthenticatedUser user = guard.currentUser();

        ClinicInviteEntity invite = inviteRepository.findByIdAndClinicId(inviteId, clinicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Convite não encontrado"));

        if (!"pending".equals(invite.status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este convite já foi utilizado");
        }

        ClinicEntity clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clínica não encontrada"));

        String email = (req.userEmail() != null && !req.userEmail().isBlank())
                ? req.userEmail().trim().toLowerCase()
                : (user.email() != null ? user.email().toLowerCase() : invite.email);

        if (!memberRepository.existsByClinicIdAndMemberUid(clinicId, user.uid())) {
            ClinicMemberEntity member = new ClinicMemberEntity();
            member.id = UUID.randomUUID().toString();
            member.clinicId = clinicId;
            member.memberUid = user.uid();
            member.email = email;
            member.name = req.userName() != null && !req.userName().isBlank()
                    ? req.userName()
                    : (email.contains("@") ? email.split("@")[0] : "Colaborador");
            member.role = invite.role;
            member.joinedAt = Instant.now().toString();
            memberRepository.save(member);
        }

        clinic.updatedAt = Instant.now().toString();
        clinicRepository.save(clinic);

        invite.status = "accepted";
        inviteRepository.save(invite);

        return ResponseEntity.noContent().build();
    }

    private ClinicDto toClinicDto(ClinicEntity clinic) {
        List<ClinicMemberDto> members = memberRepository.findByClinicIdOrderByJoinedAtAsc(clinic.id).stream()
                .map(this::toMemberDto)
                .toList();

        Map<String, Boolean> memberUids = new LinkedHashMap<>();
        for (ClinicMemberDto m : members) {
            memberUids.put(m.uid(), Boolean.TRUE);
        }

        return new ClinicDto(clinic.id, clinic.name, clinic.ownerId, clinic.ownerEmail, members, memberUids, clinic.createdAt, clinic.updatedAt);
    }

    private ClinicMemberDto toMemberDto(ClinicMemberEntity m) {
        return new ClinicMemberDto(m.memberUid, m.email, m.name, m.role, m.joinedAt);
    }

    private ClinicInviteDto toInviteDto(ClinicInviteEntity inv) {
        return new ClinicInviteDto(inv.id, inv.email, inv.clinicId, inv.clinicName, inv.role, inv.status, inv.invitedBy, inv.invitedByName, inv.createdAt);
    }
}
