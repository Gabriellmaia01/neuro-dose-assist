package com.neurodose.common;

import org.bson.Document;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final MongoTemplate mongoTemplate;

    public HealthController(ObjectProvider<MongoTemplate> mongoTemplateProvider) {
        this.mongoTemplate = mongoTemplateProvider.getIfAvailable();
    }

    @GetMapping
    public Map<String, Object> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        body.put("service", "neuro-dose-api");
        body.put("timestamp", Instant.now().toString());

        if (mongoTemplate != null) {
            try {
                mongoTemplate.executeCommand(new Document("ping", 1));
                body.put("database", "UP");
                body.put("databaseName", mongoTemplate.getDb().getName());
            } catch (Exception ex) {
                body.put("status", "DEGRADED");
                body.put("database", "DOWN");
                body.put("databaseError", ex.getMessage());
            }
        } else {
            body.put("database", "DISABLED");
        }
        return body;
    }
}
