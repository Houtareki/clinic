package com.project.clinic.service;

import com.project.clinic.entity.Doctor;

import java.util.List;
import java.util.Optional;


public interface DoctorService {
    Optional<Doctor> findById(int doctorId);
    List<Doctor> getAllDoctors();

    Optional<Doctor> findByAccountId(int accountId);
    void save(Doctor doctor);
}
