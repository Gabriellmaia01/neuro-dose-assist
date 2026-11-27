package com.neurodose.activity;

import com.neurodose.security.AuthenticatedUser;
import com.neurodose.security.TenantAccessGuard;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/activity-logs")
public class ActivityLogController {

    private final ActivityLogService service;
    private final TenantAccessGuard guard;

    public ActivityLogController(ActivityLogService service, TenantAccessGuard guard) {
        this.service = service;
        this.guard = guard;
    }

    @GetMapping
    public List<ActivityLogService.ActivityLogDto> list(
            @PathVariable String workspaceId,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "100") int limit
    ) {
        guard.requireWorkspaceAccess(workspaceId);
        return service.list(workspaceId, entityType, action, limit);
    }

    @PostMapping
    public Map<String, String> create(
            @PathVariable String workspaceId,
            @RequestBody ActivityLogService.CreateActivityRequest req
    ) {
        AuthenticatedUser user = guard.requireWorkspaceAccess(workspaceId);
        String id = service.record(
                workspaceId,
                user.uid(),
                req.action(),
                req.entityType(),
                req.entityId(),
                req.entityName(),
                req.userName() != null ? req.userName() : user.name(),
                req.userEmail() != null ? req.userEmail() : user.email(),
                req.metadata()
        );
        return Map.of("id", id);
    }
}
