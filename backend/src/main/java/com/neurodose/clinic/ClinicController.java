package com.neurodose.clinic;

import com.neurodose.clinic.ClinicDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ClinicController {

    private final ClinicService clinicService;

    public ClinicController(ClinicService clinicService) {
        this.clinicService = clinicService;
    }

    @PostMapping("/clinics")
    public IdResponse createClinic(@Valid @RequestBody CreateClinicRequest req) {
        return clinicService.createClinic(req);
    }

    @GetMapping("/users/{userId}/clinic")
    public ResponseEntity<ClinicDto> getUserClinic(@PathVariable String userId) {
        return clinicService.getUserClinic(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/users/{userId}/clinic-membership")
    public ResponseEntity<ClinicMembershipDto> getClinicMembership(@PathVariable String userId) {
        return clinicService.getClinicMembership(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/users/{userId}/effective-workspace")
    public EffectiveWorkspaceResponse getEffectiveWorkspace(@PathVariable String userId) {
        return clinicService.getEffectiveWorkspace(userId);
    }

    @PatchMapping("/clinics/{clinicId}")
    public ResponseEntity<Void> updateClinic(
            @PathVariable String clinicId,
            @Valid @RequestBody UpdateClinicRequest req
    ) {
        clinicService.updateClinic(clinicId, req);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/clinics/{clinicId}/members")
    public List<ClinicMemberDto> getClinicMembers(@PathVariable String clinicId) {
        return clinicService.getClinicMembers(clinicId);
    }

    @PostMapping("/clinics/{clinicId}/members")
    public ResponseEntity<Void> addClinicMember(
            @PathVariable String clinicId,
            @Valid @RequestBody AddMemberRequest req
    ) {
        clinicService.addClinicMember(clinicId, req);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/clinics/{clinicId}/members/{memberUid}")
    public ResponseEntity<Void> removeClinicMember(
            @PathVariable String clinicId,
            @PathVariable String memberUid
    ) {
        clinicService.removeClinicMember(clinicId, memberUid);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/clinics/{clinicId}/invites")
    public InviteCreatedResponse createInvite(
            @PathVariable String clinicId,
            @Valid @RequestBody CreateInviteRequest req
    ) {
        return clinicService.createInvite(clinicId, req);
    }

    @GetMapping("/clinics/{clinicId}/invites/{inviteId}")
    public ResponseEntity<ClinicInviteDto> getInviteById(
            @PathVariable String clinicId,
            @PathVariable String inviteId
    ) {
        return clinicService.getPublicInvitePreview(clinicId, inviteId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/clinics/{clinicId}/invites")
    public List<ClinicInviteDto> getPendingInvites(
            @PathVariable String clinicId,
            @RequestParam(required = false) String email
    ) {
        return clinicService.getPendingInvites(clinicId, email);
    }

    @GetMapping("/invites/pending")
    public List<ClinicInviteDto> getMyPendingInvites() {
        return clinicService.getMyPendingInvites();
    }

    @PostMapping("/clinics/{clinicId}/invites/{inviteId}/accept")
    public ResponseEntity<Void> acceptInvite(
            @PathVariable String clinicId,
            @PathVariable String inviteId,
            @Valid @RequestBody(required = false) AcceptInviteRequest req
    ) {
        clinicService.acceptInvite(clinicId, inviteId, req);
        return ResponseEntity.noContent().build();
    }
}
