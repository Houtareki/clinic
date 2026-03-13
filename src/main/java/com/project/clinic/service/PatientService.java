package com.project.clinic.service;

import com.project.clinic.entity.Patient;

import java.util.List;

public interface PatientService {
    List<Patient> findAll();

    Patient findByPhone(String phone);
    Patient findByFullName(String fullName);

}
