package com.neurodose.dose;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface DoseRecordRepository extends MongoRepository<DoseRecordEntity, String> {
    List<DoseRecordEntity> findByWorkspaceOwnerIdOrderByDoseTimestampDesc(String workspaceOwnerId, Pageable pageable);

    List<DoseRecordEntity> findByWorkspaceOwnerIdAndPatientIdOrderByDoseTimestampDesc(
            String workspaceOwnerId,
            String patientId,
            Pageable pageable
    );

    Optional<DoseRecordEntity> findByIdAndWorkspaceOwnerId(String id, String workspaceOwnerId);
}
