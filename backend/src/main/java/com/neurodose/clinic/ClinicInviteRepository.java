package com.neurodose.clinic;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ClinicInviteRepository extends MongoRepository<ClinicInviteEntity, String> {
    Optional<ClinicInviteEntity> findByIdAndClinicId(String id, String clinicId);

    List<ClinicInviteEntity> findByClinicIdAndEmailIgnoreCaseAndStatus(String clinicId, String email, String status);

    List<ClinicInviteEntity> findByClinicIdAndStatusOrderByCreatedAtDesc(String clinicId, String status);

    List<ClinicInviteEntity> findByEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(String email, String status);
}
