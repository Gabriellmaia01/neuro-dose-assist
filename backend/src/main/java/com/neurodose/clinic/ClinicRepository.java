package com.neurodose.clinic;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ClinicRepository extends MongoRepository<ClinicEntity, String> {
    Optional<ClinicEntity> findByOwnerId(String ownerId);
}
