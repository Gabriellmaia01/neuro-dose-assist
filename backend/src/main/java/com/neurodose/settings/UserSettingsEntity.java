package com.neurodose.settings;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "user_settings")
public class UserSettingsEntity {
    @Id
    public String userId;

    public Map<String, Object> profile;
    public Map<String, Object> notifications;
    public Map<String, Object> ai;
    public String createdAt;
    public String updatedAt;
}
