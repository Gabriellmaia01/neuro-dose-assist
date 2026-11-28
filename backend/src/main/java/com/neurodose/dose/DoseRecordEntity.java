package com.neurodose.dose;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "dose_records")
@CompoundIndexes({
        @CompoundIndex(name = "idx_doses_ws_ts", def = "{'workspaceOwnerId': 1, 'doseTimestamp': -1}"),
        @CompoundIndex(name = "idx_doses_ws_pat", def = "{'workspaceOwnerId': 1, 'patientId': 1}")
})
public class DoseRecordEntity {
    @Id
    public String id;

    public String workspaceOwnerId;
    public String patientId;
    public String medicationId;
    public String doseAmount;
    public String doseTime;
    public String indication;
    public Map<String, Object> subjectiveState;
    public Map<String, Object> analysis;
    public String doseTimestamp;
    public String createdAt;
}
