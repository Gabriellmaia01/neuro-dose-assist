package com.neurodose.settings;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserSettingsRepository extends MongoRepository<UserSettingsEntity, String> {
}
