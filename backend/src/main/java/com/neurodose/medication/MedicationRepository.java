package com.neurodose.medication;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface MedicationRepository extends MongoRepository<MedicationEntity, String> {
    List<MedicationEntity> findByWorkspaceOwnerIdOrderByNameAsc(String workspaceOwnerId);

    Optional<MedicationEntity> findByIdAndWorkspaceOwnerId(String id, String workspaceOwnerId);
}
