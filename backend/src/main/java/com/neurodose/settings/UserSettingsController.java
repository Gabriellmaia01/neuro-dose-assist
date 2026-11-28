package com.neurodose.settings;

import com.neurodose.security.TenantAccessGuard;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users/{userId}/settings")
public class UserSettingsController {

    private final UserSettingsRepository repo;
    private final TenantAccessGuard guard;

    public UserSettingsController(UserSettingsRepository repo, TenantAccessGuard guard) {
        this.repo = repo;
        this.guard = guard;
    }

    public record UserSettingsDto(
            Map<String, Object> profile,
            Map<String, Object> notifications,
            Map<String, Object> ai,
            String updatedAt
    ) {}

    @GetMapping
    public ResponseEntity<UserSettingsDto> get(@PathVariable String userId) {
        guard.requireSelf(userId);
        return repo.findById(userId)
                .map(row -> ResponseEntity.ok(toDto(row)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<Void> save(
            @PathVariable String userId,
            @RequestBody Map<String, Object> body
    ) {
        guard.requireSelf(userId);
        UserSettingsEntity row = findOrInit(userId);
        if (body.get("profile") instanceof Map<?, ?> p) {
            row.profile = new LinkedHashMap<>((Map<String, Object>) p);
        }
        if (body.get("notifications") instanceof Map<?, ?> n) {
            row.notifications = new LinkedHashMap<>((Map<String, Object>) n);
        }
        if (body.get("ai") instanceof Map<?, ?> a) {
            row.ai = new LinkedHashMap<>((Map<String, Object>) a);
        }
        row.updatedAt = Instant.now().toString();
        repo.save(row);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/profile")
    public ResponseEntity<Void> patchProfile(
            @PathVariable String userId,
            @RequestBody Map<String, Object> profilePatch
    ) {
        guard.requireSelf(userId);
        UserSettingsEntity row = findOrInit(userId);
        Map<String, Object> merged = new LinkedHashMap<>(row.profile != null ? row.profile : Map.of());
        merged.putAll(profilePatch);
        row.profile = merged;
        row.updatedAt = Instant.now().toString();
        repo.save(row);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/notifications")
    public ResponseEntity<Void> patchNotifications(
            @PathVariable String userId,
            @RequestBody Map<String, Object> notificationsPatch
    ) {
        guard.requireSelf(userId);
        UserSettingsEntity row = findOrInit(userId);
        Map<String, Object> merged = new LinkedHashMap<>(row.notifications != null ? row.notifications : Map.of());
        merged.putAll(notificationsPatch);
        row.notifications = merged;
        row.updatedAt = Instant.now().toString();
        repo.save(row);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/ai")
    public ResponseEntity<Void> patchAi(
            @PathVariable String userId,
            @RequestBody Map<String, Object> aiPatch
    ) {
        guard.requireSelf(userId);
        UserSettingsEntity row = findOrInit(userId);
        Map<String, Object> merged = new LinkedHashMap<>(row.ai != null ? row.ai : Map.of());
        merged.putAll(aiPatch);
        row.ai = merged;
        row.updatedAt = Instant.now().toString();
        repo.save(row);
        return ResponseEntity.noContent().build();
    }

    private UserSettingsEntity findOrInit(String userId) {
        return repo.findById(userId).orElseGet(() -> {
            String now = Instant.now().toString();
            UserSettingsEntity fresh = new UserSettingsEntity();
            fresh.userId = userId;
            fresh.profile = new LinkedHashMap<>();
            fresh.notifications = new LinkedHashMap<>(Map.of(
                    "email", true,
                    "push", true,
                    "alerts", true,
                    "recommendations", true,
                    "reports", false
            ));
            fresh.ai = new LinkedHashMap<>(Map.of(
                    "autoAnalysis", true,
                    "riskAlerts", true,
                    "recommendations", true,
                    "confidence", "high"
            ));
            fresh.createdAt = now;
            fresh.updatedAt = now;
            return fresh;
        });
    }

    private UserSettingsDto toDto(UserSettingsEntity row) {
        return new UserSettingsDto(
                row.profile != null ? row.profile : Map.of(),
                row.notifications != null ? row.notifications : Map.of(),
                row.ai != null ? row.ai : Map.of(),
                row.updatedAt
        );
    }
}
