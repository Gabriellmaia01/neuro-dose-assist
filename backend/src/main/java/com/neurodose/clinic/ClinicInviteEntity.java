package com.neurodose.clinic;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "clinic_invites")
@CompoundIndex(name = "idx_invite_lookup", def = "{'clinicId': 1, 'email': 1, 'status': 1}")
public class ClinicInviteEntity {
    @Id
    public String id;

    public String clinicId;
    public String clinicName;
    public String email;
    public String role;
    public String status;
    public String invitedBy;
    public String invitedByName;
    public String createdAt;
}
