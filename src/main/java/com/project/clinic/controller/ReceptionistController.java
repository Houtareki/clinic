package com.project.clinic.controller;

import com.project.clinic.dto.EmployeeResponseDTO;
import com.project.clinic.dto.PatientResponseDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.entity.Patient;
import com.project.clinic.mapper.EmployeeMapper;
import com.project.clinic.mapper.PatientMapper;
import com.project.clinic.service.AccountService;
import com.project.clinic.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/receptionist")
public class ReceptionistController {

    private final AccountService accountService;
    private final PatientService patientService;

    public ReceptionistController(AccountService accountService, PatientService patientService) {
        this.accountService = accountService;
        this.patientService = patientService;
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<EmployeeResponseDTO>> getDoctorsList() {
        List<Account> accounts = accountService.getDoctors();

        return ResponseEntity.ok(EmployeeMapper.toEmployeeList(accounts));
    }

    @GetMapping("/patients")
    public ResponseEntity<List<PatientResponseDTO>> getPatientsList() {
        List<Patient> patients = patientService.findAll();

        return ResponseEntity.ok(PatientMapper.toPatientList(patients));
    }



}
