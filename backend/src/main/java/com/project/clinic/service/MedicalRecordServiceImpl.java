package com.project.clinic.service;

import com.project.clinic.entity.MedicalRecord;
import com.project.clinic.repository.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicalRecordServiceImpl implements MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;

    @Autowired
    public MedicalRecordServiceImpl(MedicalRecordRepository medicalRecordRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @Override
    public List<MedicalRecord> findAll() {
        return medicalRecordRepository.findAll();
    }

    @Override
    public MedicalRecord findById(int id) {
        Optional<MedicalRecord> medicalRecord = medicalRecordRepository.findById(id);
        MedicalRecord theMedicalRecord;

        if (medicalRecord.isPresent()) {
            theMedicalRecord = medicalRecord.get();
        } else {
            throw new RuntimeException("Không tìm thấy ca khám");
        }
        return theMedicalRecord;
    }

    @Override
    public List<MedicalRecord> findByPatientId(int patientId) {
        return medicalRecordRepository.findByPatient_PatientId(patientId);
    }

    @Override
    public MedicalRecord save(MedicalRecord record) {
        return medicalRecordRepository.save(record);
    }
}
