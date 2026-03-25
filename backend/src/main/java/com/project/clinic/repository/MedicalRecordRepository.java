package com.project.clinic.repository;

import com.project.clinic.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {
    List<MedicalRecord> findByPatient_PatientId(int patientId);
    List<MedicalRecord> findByDoctor_Id(int doctorId);
}
