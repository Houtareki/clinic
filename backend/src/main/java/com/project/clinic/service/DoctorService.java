package com.project.clinic.service;

import com.project.clinic.entity.Doctor;

import java.util.List;
import java.util.Optional;


public interface DoctorService {
    Optional<Doctor> findById(int doctorId);
    List<Doctor> getAllDoctors();

    void save(Doctor doctor);
}
