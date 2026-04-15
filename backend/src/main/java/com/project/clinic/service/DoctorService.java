package com.project.clinic.service;

import com.project.clinic.entity.Doctor;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;


public interface DoctorService {
    Optional<Doctor> findById(int doctorId);
    List<Doctor> getAllDoctors();

    Optional<Doctor> findByAccountId(int accountId);
    Page<Doctor> getDoctorsWithPageAndSearch(String keyword, int page, int size);
    void save(Doctor doctor);
}
