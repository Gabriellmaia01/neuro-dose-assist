package com.neurodose.note;

import com.neurodose.security.AuthenticatedUser;
import com.neurodose.security.TenantAccessGuard;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/notes")
public class PatientNoteController {

    private final PatientNoteRepository repo;
    private final TenantAccessGuard guard;

    public PatientNoteController(PatientNoteRepository repo, TenantAccessGuard guard) {
        this.repo = repo;
        this.guard = guard;
    }

    public record NoteDto(
            String id,
            String patientId,
            String title,
            String content,
            String category,
            String createdAt,
            String updatedAt,
            String createdBy
    ) {
    }

    public record SaveNotePayload(
            @NotBlank(message = "patientId é obrigatório")
            @Size(max = 100)
            String patientId,
            @Size(max = 200)
            String title,
            @NotBlank(message = "Conteúdo da nota é obrigatório")
            @Size(max = 10000)
            String content,
            @Size(max = 60)
            String category
    ) {
    }

    @GetMapping
    public List<NoteDto> list(
            @PathVariable String workspaceId,
            @RequestParam(required = false) String patientId
    ) {
        guard.requireWorkspaceAccess(workspaceId);
        List<PatientNoteEntity> rows = (patientId != null && !patientId.isBlank())
                ? repo.findByWorkspaceOwnerIdAndPatientIdOrderByCreatedAtDesc(workspaceId, patientId.trim())
                : repo.findByWorkspaceOwnerIdOrderByCreatedAtDesc(workspaceId);
        return rows.stream().map(this::toDto).toList();
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> create(
            @PathVariable String workspaceId,
            @Valid @RequestBody SaveNotePayload p
    ) {
        AuthenticatedUser actor = guard.requireWorkspaceAccess(workspaceId);
        String id = UUID.randomUUID().toString();
        String now = Instant.now().toString();

        PatientNoteEntity row = new PatientNoteEntity();
        row.id = id;
        row.workspaceOwnerId = workspaceId;
        row.patientId = p.patientId() != null ? p.patientId() : "";
        row.title = p.title() != null ? p.title() : "";
        row.content = p.content() != null ? p.content() : "";
        row.category = p.category() != null ? p.category() : "Evolução";
        row.createdBy = actor.uid();
        row.createdAt = now;
        row.updatedAt = now;
        repo.save(row);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id));
    }

    @PutMapping("/{noteId}")
    public Map<String, String> replace(
            @PathVariable String workspaceId,
            @PathVariable String noteId,
            @Valid @RequestBody SaveNotePayload p
    ) {
        guard.requireWorkspaceAccess(workspaceId);
        PatientNoteEntity row = repo.findByIdAndWorkspaceOwnerId(noteId, workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nota não encontrada"));

        if (p.title() != null) row.title = p.title();
        if (p.content() != null) row.content = p.content();
        if (p.category() != null) row.category = p.category();
        row.updatedAt = Instant.now().toString();
        repo.save(row);

        return Map.of("id", noteId);
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> delete(
            @PathVariable String workspaceId,
            @PathVariable String noteId
    ) {
        guard.requireWorkspaceAccess(workspaceId);
        repo.findByIdAndWorkspaceOwnerId(noteId, workspaceId).ifPresent(repo::delete);
        return ResponseEntity.noContent().build();
    }

    private NoteDto toDto(PatientNoteEntity r) {
        return new NoteDto(r.id, r.patientId, r.title, r.content, r.category, r.createdAt, r.updatedAt, r.createdBy);
    }
}
