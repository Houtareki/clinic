package com.project.clinic.repository;

import com.project.clinic.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    Optional<Doctor> findByDoctorId(int doctorId);
    Optional<Doctor> findByAccount_Id(int accountId);

    Page<Doctor> findByAccount_FullNameContainingIgnoreCase(String keyword, Pageable pageable);
}