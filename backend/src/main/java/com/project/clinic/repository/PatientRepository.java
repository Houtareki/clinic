package com.project.clinic.repository;

import com.project.clinic.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Integer> {
    Optional<Patient> findByFullName(String fullName);
    Optional<Patient> findByPhone(String phone);

    Optional<Patient> findByPatientId(int patientId);

    boolean existsByPhone(String phone);

    boolean existsByFullName(String fullName);

    Page<Patient> findByFullNameContainingIgnoreCaseOrPhoneContainingIgnoreCase(String fullName, String phone, Pageable pageable);
}
