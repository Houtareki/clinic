package com.project.clinic.repository;

import com.project.clinic.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {
    List<MedicalRecord> findByPatient_PatientId(int patientId);
    List<MedicalRecord> findByDoctor_Id(int doctorId);

    // Đếm tổng số ca khám trong ngày
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // Đếm số ca khám của 1 bác sĩ trong ngày
    long countByDoctor_IdAndCreatedAtBetween(int doctorId, LocalDateTime start, LocalDateTime end);

    // Đếm ca khám của 1 bác sĩ trong ngày + status
    long countByDoctor_IdAndStatusAndCreatedAtBetween(int doctorId, String status, LocalDateTime start, LocalDateTime end);

    long countByDoctor_IdAndStatusInAndCreatedAtBetween(int doctorId, List<String> statuses, LocalDateTime start, LocalDateTime end);
}
