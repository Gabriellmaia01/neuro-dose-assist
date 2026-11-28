package com.neurodose.appointment;

import com.neurodose.activity.ActivityLogService;
import com.neurodose.security.AuthenticatedUser;
import com.neurodose.security.TenantAccessGuard;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/appointments")
public class AppointmentController {

    private final AppointmentRepository repo;
    private final ActivityLogService activityLogs;
    private final TenantAccessGuard guard;

    public AppointmentController(AppointmentRepository repo, ActivityLogService activityLogs, TenantAccessGuard guard) {
        this.repo = repo;
        this.activityLogs = activityLogs;
        this.guard = guard;
    }

    public record AppointmentDto(
            String id,
            String patientId,
            String patientName,
            String date,
            String time,
            int duration,
            String type,
            String status,
            String notes,
            String createdAt,
            String updatedAt,
            String createdBy
    ) {
    }

    public record SaveAppointmentPayload(
            @NotBlank(message = "patientId é obrigatório")
            @Size(max = 100)
            String patientId,
            @Size(max = 120)
            String patientName,
            @NotBlank(message = "date é obrigatória")
            @Size(max = 20)
            String date,
            @NotBlank(message = "time é obrigatório")
            @Size(max = 20)
            String time,
            @Min(5)
            @Max(480)
            Integer duration,
            @Size(max = 60)
            String type,
            @Size(max = 40)
            String status,
            @Size(max = 2000)
            String notes,
            @Size(max = 120)
            String auditUserName,
            @Size(max = 180)
            String auditUserEmail
    ) {
    }

    public record StatusPatchPayload(String status) {
    }

    @GetMapping
    public List<AppointmentDto> list(
            @PathVariable String workspaceId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String patientId,
            @RequestParam(defaultValue = "false") boolean upcoming
    ) {
        guard.requireWorkspaceAccess(workspaceId);

        List<AppointmentEntity> rows;
        if (upcoming) {
            String today = LocalDate.now(ZoneOffset.UTC).toString();
            rows = repo.findByWorkspaceOwnerIdAndAppointmentDateGreaterThanEqualOrderByAppointmentDateAscAppointmentTimeAsc(workspaceId, today)
                    .stream()
                    .filter(r -> !"Cancelada".equals(r.status) && !"Concluída".equals(r.status))
                    .toList();
        } else if (date != null && !date.isBlank()) {
            rows = repo.findByWorkspaceOwnerIdAndAppointmentDateOrderByAppointmentTimeAsc(workspaceId, date.trim());
        } else if (patientId != null && !patientId.isBlank()) {
            rows = repo.findByWorkspaceOwnerIdAndPatientIdOrderByAppointmentDateAscAppointmentTimeAsc(workspaceId, patientId.trim());
        } else {
            rows = repo.findByWorkspaceOwnerIdOrderByAppointmentDateAscAppointmentTimeAsc(workspaceId);
        }

        return rows.stream().map(this::toDto).toList();
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> create(
            @PathVariable String workspaceId,
            @Valid @RequestBody SaveAppointmentPayload p
    ) {
        AuthenticatedUser actor = guard.requireWorkspaceAccess(workspaceId);
        String id = UUID.randomUUID().toString();
        String now = Instant.now().toString();

        AppointmentEntity row = new AppointmentEntity();
        row.id = id;
        row.workspaceOwnerId = workspaceId;
        applyPayload(row, p);
        row.createdBy = actor.uid();
        row.createdAt = now;
        row.updatedAt = now;
        repo.save(row);

        activityLogs.record(
                workspaceId,
                actor.uid(),
                "create",
                "appointment",
                id,
                row.appointmentType + " - " + row.patientName,
                p.auditUserName() != null ? p.auditUserName() : actor.name(),
                p.auditUserEmail() != null ? p.auditUserEmail() : actor.email(),
                null
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id));
    }

    @PutMapping("/{appointmentId}")
    public Map<String, String> replace(
            @PathVariable String workspaceId,
            @PathVariable String appointmentId,
            @Valid @RequestBody SaveAppointmentPayload p
    ) {
        AuthenticatedUser actor = guard.requireWorkspaceAccess(workspaceId);
        AppointmentEntity row = repo.findByIdAndWorkspaceOwnerId(appointmentId, workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consulta não encontrada"));

        applyPayload(row, p);
        row.updatedAt = Instant.now().toString();
        repo.save(row);

        activityLogs.record(
                workspaceId,
                actor.uid(),
                "update",
                "appointment",
                appointmentId,
                row.appointmentType + " - " + row.patientName,
                p.auditUserName() != null ? p.auditUserName() : actor.name(),
                p.auditUserEmail() != null ? p.auditUserEmail() : actor.email(),
                null
        );

        return Map.of("id", appointmentId);
    }

    @PatchMapping("/{appointmentId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable String workspaceId,
            @PathVariable String appointmentId,
            @RequestBody StatusPatchPayload p
    ) {
        guard.requireWorkspaceAccess(workspaceId);
        AppointmentEntity row = repo.findByIdAndWorkspaceOwnerId(appointmentId, workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consulta não encontrada"));

        row.status = p.status();
        row.updatedAt = Instant.now().toString();
        repo.save(row);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<Void> delete(
            @PathVariable String workspaceId,
            @PathVariable String appointmentId,
            @RequestParam(required = false) String appointmentName,
            @RequestParam(required = false) String auditUserName,
            @RequestParam(required = false) String auditUserEmail
    ) {
        AuthenticatedUser actor = guard.requireWorkspaceAccess(workspaceId);
        Optional<AppointmentEntity> found = repo.findByIdAndWorkspaceOwnerId(appointmentId, workspaceId);
        String label = (appointmentName != null && !appointmentName.isBlank())
                ? appointmentName
                : found.map(a -> a.appointmentType + " - " + a.patientName).orElse("Consulta");

        found.ifPresent(repo::delete);

        activityLogs.record(
                workspaceId,
                actor.uid(),
                "delete",
                "appointment",
                appointmentId,
                label,
                auditUserName != null ? auditUserName : actor.name(),
                auditUserEmail != null ? auditUserEmail : actor.email(),
                null
        );

        return ResponseEntity.noContent().build();
    }

    private void applyPayload(AppointmentEntity row, SaveAppointmentPayload p) {
        row.patientId = p.patientId() != null ? p.patientId() : "";
        row.patientName = p.patientName() != null ? p.patientName() : "";
        row.appointmentDate = p.date() != null ? p.date() : "";
        row.appointmentTime = p.time() != null ? p.time() : "";
        row.duration = p.duration() != null ? p.duration() : 30;
        row.appointmentType = p.type() != null ? p.type() : "Consulta";
        row.status = p.status() != null ? p.status() : "Agendada";
        row.notes = (p.notes() != null && !p.notes().isBlank()) ? p.notes() : null;
    }

    private AppointmentDto toDto(AppointmentEntity r) {
        return new AppointmentDto(
                r.id,
                r.patientId,
                r.patientName,
                r.appointmentDate,
                r.appointmentTime,
                r.duration,
                r.appointmentType,
                r.status,
                r.notes,
                r.createdAt,
                r.updatedAt,
                r.createdBy
        );
    }
}
