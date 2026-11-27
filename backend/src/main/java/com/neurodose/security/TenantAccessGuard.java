package com.neurodose.security;

import com.neurodose.clinic.ClinicMemberEntity;
import com.neurodose.clinic.ClinicMemberRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class TenantAccessGuard {

    private final ClinicMemberRepository clinicMemberRepository;

    public TenantAccessGuard(ClinicMemberRepository clinicMemberRepository) {
        this.clinicMemberRepository = clinicMemberRepository;
    }

    public AuthenticatedUser currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Usuário não autenticado");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt jwt) {
            String uid = jwt.getSubject();
            String email = jwt.getClaimAsString("email");
            String name = jwt.getClaimAsString("name");
            if (uid == null || uid.isBlank()) {
                uid = jwt.getClaimAsString("user_id");
            }
            if (uid == null || uid.isBlank()) {
                throw new AccessDeniedException("Token sem identificador de usuário");
            }
            return new AuthenticatedUser(uid, email, name);
        }

        return new AuthenticatedUser(authentication.getName(), null, null);
    }

    public AuthenticatedUser requireSelf(String userId) {
        AuthenticatedUser user = currentUser();
        if (!user.uid().equals(userId)) {
            throw new AccessDeniedException("Acesso negado aos dados de outro usuário");
        }
        return user;
    }

    public AuthenticatedUser requireWorkspaceAccess(String workspaceOwnerId) {
        AuthenticatedUser user = currentUser();
        if (user.uid().equals(workspaceOwnerId)) {
            return user;
        }
        if (clinicMemberRepository.existsByClinicIdAndMemberUid(workspaceOwnerId, user.uid())) {
            return user;
        }
        throw new AccessDeniedException("Sem permissão para acessar este workspace clínico");
    }

    public AuthenticatedUser requireClinicManager(String clinicId) {
        AuthenticatedUser user = currentUser();
        if (user.uid().equals(clinicId)) {
            return user;
        }
        Optional<ClinicMemberEntity> membership =
                clinicMemberRepository.findFirstByClinicIdAndMemberUid(clinicId, user.uid());
        if (membership.isPresent()) {
            String role = membership.get().role;
            if ("owner".equals(role) || "admin".equals(role)) {
                return user;
            }
        }
        throw new AccessDeniedException("Apenas proprietários ou administradores podem gerenciar a clínica");
    }
}
