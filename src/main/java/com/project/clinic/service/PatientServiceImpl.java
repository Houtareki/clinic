package com.project.clinic.service;

import com.project.clinic.entity.Patient;
import com.project.clinic.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientServiceImpl implements PatientService {

    private PatientRepository patientRepository;

    @Autowired
    public void setPatientRepository(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    @Override
    public Patient findByFullName(String fullName) {
        Optional<Patient> result = patientRepository.findByFullName(fullName);
        Patient thePatient;

        if (result.isPresent()) {
            thePatient = result.get();
        } else {
            throw new RuntimeException("Patient not found");
        }

        return thePatient;
    }

    @Override
    public Patient findByPhone(String phone) {
        Optional<Patient> result = patientRepository.findByPhone(phone);
        Patient thePatient;

        if (result.isPresent()) {
            thePatient = result.get();
        } else {
            throw new RuntimeException("Phone number not found");
        }
        return thePatient;
    }
}
