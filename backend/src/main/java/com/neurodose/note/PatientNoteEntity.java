package com.neurodose.note;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "patient_notes")
@CompoundIndex(name = "idx_notes_ws_pat", def = "{'workspaceOwnerId': 1, 'patientId': 1}")
public class PatientNoteEntity {
    @Id
    public String id;

    public String workspaceOwnerId;
    public String patientId;
    public String title;
    public String content;
    public String category;
    public String createdBy;
    public String createdAt;
    public String updatedAt;
}
