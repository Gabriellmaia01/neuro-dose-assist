package com.neurodose.medication;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "medications")
public class MedicationEntity {
    @Id
    public String id;

    @Indexed
    public String workspaceOwnerId;

    public String name;
    public String brandName;
    public String activeIngredient;
    public String therapeuticClass;
    public String form;
    public double minDose;
    public double maxDose;
    public String unit;
    public Double halfLifeHours;
    public String createdBy;
    public String createdAt;
    public String updatedAt;
}
