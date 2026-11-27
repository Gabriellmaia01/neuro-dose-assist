package com.neurodose.activity;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ActivityLogRepository extends MongoRepository<ActivityLogEntity, String> {
    List<ActivityLogEntity> findByWorkspaceOwnerIdOrderByEventTimestampDesc(String workspaceOwnerId, Pageable pageable);

    List<ActivityLogEntity> findByWorkspaceOwnerIdAndEntityTypeOrderByEventTimestampDesc(
            String workspaceOwnerId,
            String entityType,
            Pageable pageable
    );

    List<ActivityLogEntity> findByWorkspaceOwnerIdAndActionOrderByEventTimestampDesc(
            String workspaceOwnerId,
            String action,
            Pageable pageable
    );
}
