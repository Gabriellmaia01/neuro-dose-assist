package com.neurodose.medication;

import com.neurodose.activity.ActivityLogService;
import com.neurodose.security.AuthenticatedUser;
import com.neurodose.security.TenantAccessGuard;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/medications")
public class MedicationController {

    private final MedicationRepository repo;
    private final ActivityLogService activityLogs;
    private final TenantAccessGuard guard;

    public MedicationController(MedicationRepository repo, ActivityLogService activityLogs, TenantAccessGuard guard) {
        this.repo = repo;
        this.activityLogs = activityLogs;
        this.guard = guard;
    }

    public record MedicationDto(
            String id,
            String name,
            String brandName,
            String activeIngredient,
            String therapeuticClass,
            String form,
            double minDose,
            double maxDose,
            String unit,
            Double halfLifeHours,
            String createdAt,
            String updatedAt,
            String createdBy
    ) {
    }

    public record SaveMedicationPayload(
            @NotBlank(message = "Nome do medicamento é obrigatório")
            @Size(max = 120)
            String name,
            @Size(max = 120)
            String brandName,
            @Size(max = 200)
            String activeIngredient,
            @Size(max = 120)
            String therapeuticClass,
            @Size(max = 80)
            String form,
            @DecimalMin(value = "0.0")
            Double minDose,
            @DecimalMin(value = "0.0")
            Double maxDose,
            @Size(max = 20)
            String unit,
            @DecimalMin(value = "0.01")
            Double halfLifeHours,
            @Size(max = 120)
            String auditUserName,
            @Size(max = 180)
            String auditUserEmail
    ) {
    }

    @GetMapping
    public List<MedicationDto> list(@PathVariable String workspaceId) {
        guard.requireWorkspaceAccess(workspaceId);
        return repo.findByWorkspaceOwnerIdOrderByNameAsc(workspaceId).stream().map(this::toDto).toList();
    }

    @GetMapping("/{medicationId}")
    public ResponseEntity<MedicationDto> getOne(
            @PathVariable String workspaceId,
            @PathVariable String medicationId
    ) {
        guard.requireWorkspaceAccess(workspaceId);
        return repo.findByIdAndWorkspaceOwnerId(medicationId, workspaceId)
                .map(row -> ResponseEntity.ok(toDto(row)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> create(
            @PathVariable String workspaceId,
            @Valid @RequestBody SaveMedicationPayload payload
    ) {
        AuthenticatedUser actor = guard.requireWorkspaceAccess(workspaceId);
        String id = UUID.randomUUID().toString();
        String now = Instant.now().toString();

        MedicationEntity row = new MedicationEntity();
        row.id = id;
        row.workspaceOwnerId = workspaceId;
        applyPayload(row, payload);
        row.createdBy = actor.uid();
        row.createdAt = now;
        row.updatedAt = now;
        repo.save(row);

        activityLogs.record(
                workspaceId,
                actor.uid(),
                "create",
                "medication",
                id,
                row.name,
                payload.auditUserName() != null ? payload.auditUserName() : actor.name(),
                payload.auditUserEmail() != null ? payload.auditUserEmail() : actor.email(),
                null
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id));
    }

    @PutMapping("/{medicationId}")
    public Map<String, String> replace(
            @PathVariable String workspaceId,
            @PathVariable String medicationId,
            @Valid @RequestBody SaveMedicationPayload payload
    ) {
        AuthenticatedUser actor = guard.requireWorkspaceAccess(workspaceId);
        MedicationEntity row = repo.findByIdAndWorkspaceOwnerId(medicationId, workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicamento não encontrado"));

        applyPayload(row, payload);
        row.updatedAt = Instant.now().toString();
        repo.save(row);

        activityLogs.record(
                workspaceId,
                actor.uid(),
                "update",
                "medication",
                medicationId,
                row.name,
                payload.auditUserName() != null ? payload.auditUserName() : actor.name(),
                payload.auditUserEmail() != null ? payload.auditUserEmail() : actor.email(),
                null
        );

        return Map.of("id", medicationId);
    }

    @PatchMapping("/{medicationId}")
    public ResponseEntity<Void> patch(
            @PathVariable String workspaceId,
            @PathVariable String medicationId,
            @RequestBody Map<String, Object> fields
    ) {
        guard.requireWorkspaceAccess(workspaceId);
        MedicationEntity row = repo.findByIdAndWorkspaceOwnerId(medicationId, workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicamento não encontrado"));

        if (fields.get("name") != null) row.name = String.valueOf(fields.get("name"));
        if (fields.get("brandName") != null) row.brandName = String.valueOf(fields.get("brandName"));
        if (fields.get("activeIngredient") != null) row.activeIngredient = String.valueOf(fields.get("activeIngredient"));
        if (fields.get("therapeuticClass") != null) row.therapeuticClass = String.valueOf(fields.get("therapeuticClass"));
        if (fields.get("form") != null) row.form = String.valueOf(fields.get("form"));
        if (fields.get("minDose") instanceof Number n) row.minDose = n.doubleValue();
        if (fields.get("maxDose") instanceof Number n) row.maxDose = n.doubleValue();
        if (fields.get("unit") != null) row.unit = String.valueOf(fields.get("unit"));
        if (fields.containsKey("halfLifeHours")) {
            Object raw = fields.get("halfLifeHours");
            row.halfLifeHours = raw instanceof Number n ? n.doubleValue() : null;
        }
        row.updatedAt = Instant.now().toString();
        repo.save(row);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{medicationId}")
    public ResponseEntity<Void> delete(
            @PathVariable String workspaceId,
            @PathVariable String medicationId,
            @RequestParam(required = false) String medicationName,
            @RequestParam(required = false) String auditUserName,
            @RequestParam(required = false) String auditUserEmail
    ) {
        AuthenticatedUser actor = guard.requireClinicManager(workspaceId);
        Optional<MedicationEntity> found = repo.findByIdAndWorkspaceOwnerId(medicationId, workspaceId);
        String label = (medicationName != null && !medicationName.isBlank())
                ? medicationName
                : found.map(m -> m.name).orElse("Medicamento");

        found.ifPresent(repo::delete);

        activityLogs.record(
                workspaceId,
                actor.uid(),
                "delete",
                "medication",
                medicationId,
                label,
                auditUserName != null ? auditUserName : actor.name(),
                auditUserEmail != null ? auditUserEmail : actor.email(),
                null
        );

        return ResponseEntity.noContent().build();
    }

    private void applyPayload(MedicationEntity row, SaveMedicationPayload p) {
        row.name = p.name() != null ? p.name() : "";
        row.brandName = p.brandName() != null ? p.brandName() : "";
        row.activeIngredient = p.activeIngredient() != null ? p.activeIngredient() : "";
        row.therapeuticClass = p.therapeuticClass() != null ? p.therapeuticClass() : "";
        row.form = p.form() != null ? p.form() : "";
        row.minDose = p.minDose() != null ? p.minDose() : 0.0;
        row.maxDose = p.maxDose() != null ? p.maxDose() : 0.0;
        row.unit = p.unit() != null ? p.unit() : "mg";
        row.halfLifeHours = p.halfLifeHours();
    }

    private MedicationDto toDto(MedicationEntity r) {
        return new MedicationDto(
                r.id,
                r.name,
                r.brandName,
                r.activeIngredient,
                r.therapeuticClass,
                r.form,
                r.minDose,
                r.maxDose,
                r.unit,
                r.halfLifeHours,
                r.createdAt,
                r.updatedAt,
                r.createdBy
        );
    }
}
