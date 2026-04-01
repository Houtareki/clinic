package com.project.clinic.service;

import com.project.clinic.entity.Patient;
import com.project.clinic.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    public Optional<Patient> findByPatientId(int id) {
        return patientRepository.findByPatientId(id);
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
    public Patient findById(int id) {
        Optional<Patient> result = patientRepository.findById(id);
        Patient thePatient;

        if (result.isPresent()) {
            thePatient = result.get();
        } else {
            throw new RuntimeException("Patient not found");
        }
        return thePatient;
    }

    @Override
    public Patient save(Patient patient) {
        return patientRepository.save(patient);
    }

    @Override
    public boolean existsByPhone(String phone) {
        return patientRepository.existsByPhone(phone);
    }

    @Override
    public boolean existsByFullName(String fullName) {
        return patientRepository.existsByFullName(fullName);
    }

    @Override
    public Page<Patient> getPatientWithPageAndSearch(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "patientId"));

        if (keyword != null && !keyword.trim().isEmpty()) {
            return patientRepository.findByFullNameContainingIgnoreCaseOrPhoneContainingIgnoreCase(keyword, keyword, pageable);
        }

        return patientRepository.findAll(pageable);
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
