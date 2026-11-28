package com.neurodose.clinic;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public final class ClinicDtos {

    private ClinicDtos() {}

    public record IdResponse(String id) {}

    public record InviteCreatedResponse(String inviteId) {}

    public record EffectiveWorkspaceResponse(String effectiveUserId) {}

    public record ClinicMemberDto(
            String uid,
            String email,
            String name,
            String role,
            String joinedAt
    ) {}

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

    public record ClinicMembershipDto(
            String clinicOwnerId,
            String clinicName,
            String role,
            String joinedAt
    ) {}

    public record ClinicInviteDto(
            String id,
            String email,
            String clinicId,
            String clinicName,
            String role,
            String status,
            String invitedBy,
            String invitedByName,
            String createdAt,
            String expiresAt
    ) {}

    public record CreateClinicRequest(
            @NotBlank(message = "Nome da clínica é obrigatório")
            @Size(max = 120, message = "Nome da clínica excede 120 caracteres")
            String name,
            @Email(message = "E-mail do proprietário inválido")
            @Size(max = 180)
            String ownerEmail
    ) {}

    public record UpdateClinicRequest(
            @NotBlank(message = "Nome da clínica é obrigatório")
            @Size(max = 120, message = "Nome da clínica excede 120 caracteres")
            String name
    ) {}

    public record CreateInviteRequest(
            @Size(max = 120)
            String clinicName,
            @NotBlank(message = "E-mail é obrigatório")
            @Email(message = "E-mail inválido")
            @Size(max = 180)
            String email,
            @Pattern(regexp = "^(admin|member)$", message = "Papel inválido. Use 'admin' ou 'member'")
            String role,
            @Size(max = 120)
            String invitedByName
    ) {}

    public record AcceptInviteRequest(
            @Size(max = 180)
            String userEmail,
            @Size(max = 120)
            String userName
    ) {}

    public record AddMemberRequest(
            @NotBlank(message = "E-mail é obrigatório")
            @Email(message = "E-mail inválido")
            @Size(max = 180)
            String email,
            @Size(max = 120)
            String name,
            @Pattern(regexp = "^(admin|member)$", message = "Papel inválido. Use 'admin' ou 'member'")
            String role
    ) {}
}
