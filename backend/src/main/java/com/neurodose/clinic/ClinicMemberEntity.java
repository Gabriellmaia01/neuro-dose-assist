package com.neurodose.clinic;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "clinic_members")
@CompoundIndex(name = "idx_clinic_member", def = "{'clinicId': 1, 'memberUid': 1}")
public class ClinicMemberEntity {
    @Id
    public String id;

    @Indexed
    public String clinicId;

    @Indexed
    public String memberUid;

    public String email;
    public String name;
    public String role;
    public String joinedAt;
}
