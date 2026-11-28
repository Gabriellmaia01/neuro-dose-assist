package com.neurodose.appointment;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "appointments")
@CompoundIndex(name = "idx_appointments_ws_date", def = "{'workspaceOwnerId': 1, 'appointmentDate': 1, 'appointmentTime': 1}")
public class AppointmentEntity {
    @Id
    public String id;

    public String workspaceOwnerId;
    public String patientId;
    public String patientName;
    public String appointmentDate;
    public String appointmentTime;
    public int duration;
    public String appointmentType;
    public String status;
    public String notes;
    public String createdBy;
    public String createdAt;
    public String updatedAt;
}
