package com.neurodose.patient;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PatientRepository extends MongoRepository<PatientEntity, String> {
    List<PatientEntity> findByWorkspaceOwnerIdOrderByCreatedAtDesc(String workspaceOwnerId);

    Optional<PatientEntity> findByIdAndWorkspaceOwnerId(String id, String workspaceOwnerId);
}
