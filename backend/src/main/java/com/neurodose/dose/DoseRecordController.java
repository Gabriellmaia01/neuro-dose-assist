package com.neurodose.dose;

import com.neurodose.activity.ActivityLogService;
import com.neurodose.security.AuthenticatedUser;
import com.neurodose.security.TenantAccessGuard;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/doses")
public class DoseRecordController {

    private final DoseRecordRepository repo;
    private final ActivityLogService activityLogs;
    private final TenantAccessGuard guard;

    public DoseRecordController(
            DoseRecordRepository repo,
            ActivityLogService activityLogs,
            TenantAccessGuard guard
    ) {
        this.repo = repo;
        this.activityLogs = activityLogs;
        this.guard = guard;
    }

    public record DoseDto(
            String id,
            String patientId,
            String medicationId,
            String doseAmount,
            String time,
            String indication,
            Map<String, Object> subjectiveState,
            Map<String, Object> analysis,
            String timestamp,
            String createdAt
    ) {}

    public record CreateDosePayload(
            @NotBlank(message = "patientId é obrigatório")
            @Size(max = 100)
            String patientId,
            @NotBlank(message = "medicationId é obrigatório")
            @Size(max = 100)
            String medicationId,
            @Size(max = 40)
            String doseAmount,
            @Size(max = 20)
            String time,
            @Size(max = 240)
            String indication,
            @Size(max = 50)
            Map<String, Object> subjectiveState,
            @Size(max = 50)
            Map<String, Object> analysis,
            @Size(max = 50)
            String timestamp,
            @Size(max = 120)
            String patientName,
            @Size(max = 120)
            String medicationName,
            @Size(max = 120)
            String auditUserName,
            @Size(max = 180)
            String auditUserEmail
    ) {}

    @GetMapping
    public List<DoseDto> list(
            @PathVariable String workspaceId,
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) Integer limit
    ) {
        guard.requireWorkspaceAccess(workspaceId);
        Pageable page = (limit != null && limit > 0)
                ? PageRequest.of(0, Math.min(limit, 2000))
                : Pageable.unpaged();

        List<DoseRecordEntity> rows = (patientId != null && !patientId.isBlank())
                ? repo.findByWorkspaceOwnerIdAndPatientIdOrderByDoseTimestampDesc(workspaceId, patientId.trim(), page)
                : repo.findByWorkspaceOwnerIdOrderByDoseTimestampDesc(workspaceId, page);

        return rows.stream().map(this::toDto).toList();
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> create(
            @PathVariable String workspaceId,
            @Valid @RequestBody CreateDosePayload p
    ) {
        AuthenticatedUser actor = guard.requireWorkspaceAccess(workspaceId);
        String id = UUID.randomUUID().toString();
        String now = Instant.now().toString();

        DoseRecordEntity row = new DoseRecordEntity();
        row.id = id;
        row.workspaceOwnerId = workspaceId;
        row.patientId = p.patientId();
        row.medicationId = p.medicationId();
        row.doseAmount = p.doseAmount() != null ? p.doseAmount() : "0";
        row.doseTime = p.time() != null ? p.time() : "";
        row.indication = p.indication() != null ? p.indication() : "";
        row.subjectiveState = p.subjectiveState() != null ? p.subjectiveState() : Map.of();
        row.analysis = p.analysis() != null ? p.analysis() : Map.of();
        row.doseTimestamp = (p.timestamp() != null && !p.timestamp().isBlank()) ? p.timestamp() : now;
        row.createdAt = now;
        repo.save(row);

        String entityLabel = (p.medicationName() != null && !p.medicationName().isBlank() ? p.medicationName() : "Medicamento")
                + " " + row.doseAmount + "mg - "
                + (p.patientName() != null && !p.patientName().isBlank() ? p.patientName() : "Paciente");

        activityLogs.record(
                workspaceId,
                actor.uid(),
                "create",
                "dose",
                id,
                entityLabel,
                p.auditUserName() != null ? p.auditUserName() : actor.name(),
                p.auditUserEmail() != null ? p.auditUserEmail() : actor.email(),
                null
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id));
    }

    @DeleteMapping("/{doseId}")
    public ResponseEntity<Void> delete(
            @PathVariable String workspaceId,
            @PathVariable String doseId,
            @RequestParam(required = false) String doseName,
            @RequestParam(required = false) String auditUserName,
            @RequestParam(required = false) String auditUserEmail
    ) {
        AuthenticatedUser actor = guard.requireClinicManager(workspaceId);
        Optional<DoseRecordEntity> found = repo.findByIdAndWorkspaceOwnerId(doseId, workspaceId);
        found.ifPresent(repo::delete);

        activityLogs.record(
                workspaceId,
                actor.uid(),
                "delete",
                "dose",
                doseId,
                (doseName != null && !doseName.isBlank()) ? doseName : "Dose",
                auditUserName != null ? auditUserName : actor.name(),
                auditUserEmail != null ? auditUserEmail : actor.email(),
                null
        );

        return ResponseEntity.noContent().build();
    }

    private DoseDto toDto(DoseRecordEntity r) {
        return new DoseDto(
                r.id,
                r.patientId,
                r.medicationId,
                r.doseAmount,
                r.doseTime,
                r.indication,
                r.subjectiveState,
                r.analysis,
                r.doseTimestamp,
                r.createdAt
        );
    }
}
