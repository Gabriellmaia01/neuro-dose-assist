package com.neurodose.patient;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "patients")
public class PatientEntity {
    @Id
    public String id;

    @Indexed
    public String workspaceOwnerId;

    public String name;
    public int age;
    public String gender;
    public String conditionName;
    public String clinicalHistory;
    public String allergies;
    public List<String> activeMedicationIds;
    public String currentMedications;
    public String createdBy;
    public String createdAt;
    public String updatedAt;
}
