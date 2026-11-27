package com.neurodose.activity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "activity_logs")
@CompoundIndex(name = "idx_activity_ws_ts", def = "{'workspaceOwnerId': 1, 'eventTimestamp': -1}")
public class ActivityLogEntity {
    @Id
    public String id;

    public String workspaceOwnerId;
    public String action;
    public String entityType;
    public String entityId;
    public String entityName;
    public String description;
    public String userId;
    public String userName;
    public String userEmail;
    public Map<String, Object> metadata;
    public String eventTimestamp;
}
