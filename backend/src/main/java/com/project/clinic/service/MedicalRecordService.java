package com.project.clinic.service;

import com.project.clinic.entity.MedicalRecord;

import java.util.List;

public interface MedicalRecordService {
    List<MedicalRecord> findAll();
    MedicalRecord findById(int id);
    List<MedicalRecord> findByPatientId(int patientId);
    MedicalRecord save(MedicalRecord record);
}
