package com.neurodose.clinic;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ClinicMemberRepository extends MongoRepository<ClinicMemberEntity, String> {
    List<ClinicMemberEntity> findByClinicIdOrderByJoinedAtAsc(String clinicId);

    Optional<ClinicMemberEntity> findFirstByMemberUidAndRoleNot(String memberUid, String excludedRole);

    Optional<ClinicMemberEntity> findFirstByClinicIdAndMemberUid(String clinicId, String memberUid);

    boolean existsByClinicIdAndMemberUid(String clinicId, String memberUid);

    void deleteByClinicIdAndMemberUid(String clinicId, String memberUid);
}
