package com.neurodose.activity;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ActivityLogService {

    private static final Map<String, String> ENTITY_LABELS = Map.of(
            "patient", "paciente",
            "medication", "medicamento",
            "appointment", "consulta",
            "dose", "dose",
            "invite", "convite",
            "clinic_member", "membro da clínica"
    );

    private static final Map<String, String> ACTION_LABELS = Map.of(
            "create", "cadastrou",
            "update", "atualizou",
            "delete", "removeu"
    );

    private final ActivityLogRepository repository;

    public ActivityLogService(ActivityLogRepository repository) {
        this.repository = repository;
    }

    public record ActivityLogDto(
            String id,
            String action,
            String entityType,
            String entityId,
            String entityName,
            String description,
            String userId,
            String userName,
            String userEmail,
            String timestamp,
            Map<String, Object> metadata
    ) {
    }

    public record CreateActivityRequest(
            String action,
            String entityType,
            String entityId,
            String entityName,
            String userName,
            String userEmail,
            Map<String, Object> metadata
    ) {
    }

    public String record(
            String workspaceOwnerId,
            String actorUserId,
            String action,
            String entityType,
            String entityId,
            String entityName,
            String userName,
            String userEmail,
            Map<String, Object> metadata
    ) {
        String id = UUID.randomUUID().toString();
        String entityLabel = ENTITY_LABELS.getOrDefault(entityType, entityType);
        String actionLabel = ACTION_LABELS.getOrDefault(action, action);

        ActivityLogEntity entity = new ActivityLogEntity();
        entity.id = id;
        entity.workspaceOwnerId = workspaceOwnerId;
        entity.action = action;
        entity.entityType = entityType;
        entity.entityId = entityId;
        entity.entityName = entityName != null ? entityName : "";
        entity.description = actionLabel + " " + entityLabel + ": " + entity.entityName;
        entity.userId = actorUserId;
        entity.userName = (userName != null && !userName.isBlank()) ? userName : "Usuário";
        entity.userEmail = userEmail != null ? userEmail : "";
        entity.metadata = metadata;
        entity.eventTimestamp = Instant.now().toString();

        repository.save(entity);
        return id;
    }

    public List<ActivityLogDto> list(String workspaceOwnerId, String entityType, String action, int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 500);
        PageRequest page = PageRequest.of(0, safeLimit);

        List<ActivityLogEntity> rows;
        if (entityType != null && !entityType.isBlank()) {
            rows = repository.findByWorkspaceOwnerIdAndEntityTypeOrderByEventTimestampDesc(workspaceOwnerId, entityType, page);
        } else if (action != null && !action.isBlank()) {
            rows = repository.findByWorkspaceOwnerIdAndActionOrderByEventTimestampDesc(workspaceOwnerId, action, page);
        } else {
            rows = repository.findByWorkspaceOwnerIdOrderByEventTimestampDesc(workspaceOwnerId, page);
        }

        return rows.stream().map(this::toDto).toList();
    }

    private ActivityLogDto toDto(ActivityLogEntity row) {
        return new ActivityLogDto(
                row.id,
                row.action,
                row.entityType,
                row.entityId,
                row.entityName,
                row.description,
                row.userId,
                row.userName,
                row.userEmail,
                row.eventTimestamp,
                row.metadata
        );
    }
}
