package com.neurodose.clinic;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "clinics")
public class ClinicEntity {
    @Id
    public String id;

    public String name;

    @Indexed
    public String ownerId;

    public String ownerEmail;
    public String createdAt;
    public String updatedAt;
}
