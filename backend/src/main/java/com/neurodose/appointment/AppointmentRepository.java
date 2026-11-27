package com.neurodose.appointment;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends MongoRepository<AppointmentEntity, String> {
    List<AppointmentEntity> findByWorkspaceOwnerIdOrderByAppointmentDateAscAppointmentTimeAsc(String workspaceOwnerId);

    List<AppointmentEntity> findByWorkspaceOwnerIdAndAppointmentDateOrderByAppointmentTimeAsc(String workspaceOwnerId, String appointmentDate);

    List<AppointmentEntity> findByWorkspaceOwnerIdAndPatientIdOrderByAppointmentDateAscAppointmentTimeAsc(String workspaceOwnerId, String patientId);

    List<AppointmentEntity> findByWorkspaceOwnerIdAndAppointmentDateGreaterThanEqualOrderByAppointmentDateAscAppointmentTimeAsc(
            String workspaceOwnerId,
            String todayIso
    );

    Optional<AppointmentEntity> findByIdAndWorkspaceOwnerId(String id, String workspaceOwnerId);
}
