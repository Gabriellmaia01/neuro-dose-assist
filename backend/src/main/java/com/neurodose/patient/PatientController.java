package com.neurodose.patient;

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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/patients")
public class PatientController {

    private final PatientRepository repository;
    private final ActivityLogService activityLogService;
    private final TenantAccessGuard guard;

    public PatientController(
            PatientRepository repository,
            ActivityLogService activityLogService,
            TenantAccessGuard guard
    ) {
        this.repository = repository;
        this.activityLogService = activityLogService;
        this.guard = guard;
    }

    public record PatientDto(
            String id,
            String name,
            Integer age,
            String gender,
            String condition,
            String clinicalHistory,
            String allergies,
            List<String> activeMedicationIds,
            String currentMedications,
            String createdAt,
            String updatedAt,
            String createdBy
    ) {}

    public record SavePatientRequest(
            @NotBlank(message = "Nome do paciente é obrigatório")
            @Size(max = 120, message = "Nome excede o limite de 120 caracteres")
            String name,
            @Min(value = 0, message = "Idade não pode ser negativa")
            @Max(value = 150, message = "Idade inválida")
            Integer age,
            @Size(max = 40)
            String gender,
            @Size(max = 200)
            String condition,
            @Size(max = 5000, message = "Histórico clínico excede o limite permitido")
            String clinicalHistory,
            @Size(max = 1000, message = "Alergias excede o limite permitido")
            String allergies,
            @Size(max = 100)
            List<String> activeMedicationIds,
            @Size(max = 2000)
            String currentMedications,
            @Size(max = 120)
            String auditUserName,
            @Size(max = 180)
            String auditUserEmail
    ) {}

    @GetMapping
    public List<PatientDto> list(@PathVariable String workspaceId) {
        guard.requireWorkspaceAccess(workspaceId);
        return repository.findByWorkspaceOwnerIdOrderByCreatedAtDesc(workspaceId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping("/{patientId}")
    public ResponseEntity<PatientDto> getById(
            @PathVariable String workspaceId,
            @PathVariable String patientId
    ) {
        guard.requireWorkspaceAccess(workspaceId);
        return repository.findByIdAndWorkspaceOwnerId(patientId, workspaceId)
                .map(row -> ResponseEntity.ok(toDto(row)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> create(
            @PathVariable String workspaceId,
            @Valid @RequestBody SavePatientRequest req
    ) {
        AuthenticatedUser user = guard.requireWorkspaceAccess(workspaceId);
        String id = UUID.randomUUID().toString();
        String now = Instant.now().toString();

        PatientEntity entity = new PatientEntity();
        entity.id = id;
        entity.workspaceOwnerId = workspaceId;
        entity.name = req.name();
        entity.age = req.age() != null ? req.age() : 0;
        entity.gender = req.gender() != null ? req.gender() : "Outro";
        entity.conditionName = req.condition() != null ? req.condition() : "";
        entity.clinicalHistory = req.clinicalHistory();
        entity.allergies = req.allergies();
        entity.activeMedicationIds = req.activeMedicationIds();
        entity.currentMedications = req.currentMedications();
        entity.createdBy = user.uid();
        entity.createdAt = now;
        entity.updatedAt = now;

        repository.save(entity);

        activityLogService.record(
                workspaceId,
                user.uid(),
                "create",
                "patient",
                id,
                entity.name,
                req.auditUserName() != null ? req.auditUserName() : user.name(),
                req.auditUserEmail() != null ? req.auditUserEmail() : user.email(),
                null
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id));
    }

    @PutMapping("/{patientId}")
    public Map<String, String> updateFull(
            @PathVariable String workspaceId,
            @PathVariable String patientId,
            @Valid @RequestBody SavePatientRequest req
    ) {
        AuthenticatedUser user = guard.requireWorkspaceAccess(workspaceId);
        PatientEntity entity = repository.findByIdAndWorkspaceOwnerId(patientId, workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente não encontrado"));

        entity.name = req.name();
        entity.age = req.age() != null ? req.age() : entity.age;
        entity.gender = req.gender() != null ? req.gender() : entity.gender;
        entity.conditionName = req.condition() != null ? req.condition() : entity.conditionName;
        entity.clinicalHistory = req.clinicalHistory();
        entity.allergies = req.allergies();
        entity.activeMedicationIds = req.activeMedicationIds();
        entity.currentMedications = req.currentMedications();
        entity.updatedAt = Instant.now().toString();

        repository.save(entity);

        activityLogService.record(
                workspaceId,
                user.uid(),
                "update",
                "patient",
                patientId,
                entity.name,
                req.auditUserName() != null ? req.auditUserName() : user.name(),
                req.auditUserEmail() != null ? req.auditUserEmail() : user.email(),
                null
        );

        return Map.of("id", patientId);
    }

    @PatchMapping("/{patientId}")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Void> patch(
            @PathVariable String workspaceId,
            @PathVariable String patientId,
            @RequestBody Map<String, Object> fields
    ) {
        guard.requireWorkspaceAccess(workspaceId);
        PatientEntity entity = repository.findByIdAndWorkspaceOwnerId(patientId, workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente não encontrado"));

        if (fields.get("name") != null) entity.name = String.valueOf(fields.get("name"));
        if (fields.get("age") instanceof Number num) entity.age = num.intValue();
        if (fields.get("gender") != null) entity.gender = String.valueOf(fields.get("gender"));
        if (fields.get("condition") != null) entity.conditionName = String.valueOf(fields.get("condition"));
        if (fields.containsKey("clinicalHistory")) {
            entity.clinicalHistory = fields.get("clinicalHistory") != null ? String.valueOf(fields.get("clinicalHistory")) : null;
        }
        if (fields.containsKey("allergies")) {
            entity.allergies = fields.get("allergies") != null ? String.valueOf(fields.get("allergies")) : null;
        }
        if (fields.containsKey("activeMedicationIds")) {
            entity.activeMedicationIds = fields.get("activeMedicationIds") instanceof List<?> list
                    ? (List<String>) list
                    : null;
        }
        if (fields.containsKey("currentMedications")) {
            entity.currentMedications = fields.get("currentMedications") != null ? String.valueOf(fields.get("currentMedications")) : null;
        }

        entity.updatedAt = Instant.now().toString();
        repository.save(entity);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{patientId}")
    public ResponseEntity<Void> delete(
            @PathVariable String workspaceId,
            @PathVariable String patientId,
            @RequestParam(required = false) String patientName,
            @RequestParam(required = false) String auditUserName,
            @RequestParam(required = false) String auditUserEmail
    ) {
        AuthenticatedUser user = guard.requireClinicManager(workspaceId);
        Optional<PatientEntity> existing = repository.findByIdAndWorkspaceOwnerId(patientId, workspaceId);
        String resolvedName = patientName != null && !patientName.isBlank()
                ? patientName
                : existing.map(p -> p.name).orElse("Paciente");

        existing.ifPresent(repository::delete);

        activityLogService.record(
                workspaceId,
                user.uid(),
                "delete",
                "patient",
                patientId,
                resolvedName,
                auditUserName != null ? auditUserName : user.name(),
                auditUserEmail != null ? auditUserEmail : user.email(),
                null
        );

        return ResponseEntity.noContent().build();
    }

    private PatientDto toDto(PatientEntity row) {
        return new PatientDto(
                row.id,
                row.name,
                row.age,
                row.gender,
                row.conditionName,
                row.clinicalHistory,
                row.allergies,
                row.activeMedicationIds,
                row.currentMedications,
                row.createdAt,
                row.updatedAt,
                row.createdBy
        );
    }
}
