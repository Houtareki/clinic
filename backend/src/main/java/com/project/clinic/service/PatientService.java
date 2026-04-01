package com.project.clinic.service;

import com.project.clinic.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface PatientService {
    List<Patient> findAll();

    Optional<Patient> findByPatientId(int id);
    Patient findByPhone(String phone);
    Patient findByFullName(String fullName);
    Patient findById(int id);
    Patient save(Patient patient);
    
    boolean existsByPhone(String phone);
    boolean existsByFullName(String fullName);
    Page<Patient> getPatientWithPageAndSearch(String keyword, int page, int size);
}
