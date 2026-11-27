package com.neurodose.note;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PatientNoteRepository extends MongoRepository<PatientNoteEntity, String> {
    List<PatientNoteEntity> findByWorkspaceOwnerIdOrderByCreatedAtDesc(String workspaceOwnerId);

    List<PatientNoteEntity> findByWorkspaceOwnerIdAndPatientIdOrderByCreatedAtDesc(String workspaceOwnerId, String patientId);

    Optional<PatientNoteEntity> findByIdAndWorkspaceOwnerId(String id, String workspaceOwnerId);
}
