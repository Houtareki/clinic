package com.project.clinic.controller;

import com.project.clinic.dto.DoctorSimpleResponseDTO;
import com.project.clinic.dto.PatientResponseDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.entity.Doctor;
import com.project.clinic.entity.Patient;
import com.project.clinic.mapper.DoctorSimpleMapper;
import com.project.clinic.mapper.PatientMapper;
import com.project.clinic.service.AccountService;
import com.project.clinic.service.DoctorService;
import com.project.clinic.service.PatientService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/receptionist")
public class ReceptionistController {

    private final AccountService accountService;
    private final DoctorService doctorService;
    private final PatientService patientService;

    public ReceptionistController(AccountService accountService, PatientService patientService, DoctorService doctorService) {
        this.accountService = accountService;
        this.doctorService = doctorService;
        this.patientService = patientService;
    }

    // ds bác sĩ
    @GetMapping("/doctors")
    public ResponseEntity<Page<DoctorSimpleResponseDTO>> getAllDoctors(
             @RequestParam(defaultValue = "0") int page,
             @RequestParam(defaultValue = "10") int size,
             @RequestParam(required = false) String keyword) {
        try {
            Page<Doctor> doctorPage = doctorService.getDoctorsWithPageAndSearch(keyword, page, size);
            Page<DoctorSimpleResponseDTO> responseDTOS = doctorPage.map(doctor -> DoctorSimpleMapper.toSimple(doctor.getAccount(), doctor));

            return ResponseEntity.ok(responseDTOS);
        }  catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable int id) {
        Account account = accountService.findById(id);

        if (account == null || account.getRole() != Account.Role.DOCTOR) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy bác sĩ");
        }

        Doctor doctor = doctorService.findByAccountId(id).orElse(null);

        return ResponseEntity.ok(
                DoctorSimpleMapper.toSimple(account, doctor)
        );
    }

    // ds bệnh nhân + tìm kiếm
    @GetMapping("/patients")
    public ResponseEntity<Page<PatientResponseDTO>> getPatientsList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {

        Page<Patient> patients = patientService.getPatientWithPageAndSearch(keyword, page, size);

        Page<PatientResponseDTO> responseDTOS = patients.map(PatientMapper::toPatientResponse);

        return ResponseEntity.ok(responseDTOS);
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable int id) {
        try {
            Patient patient = patientService.findById(id);
            return ResponseEntity.ok(PatientMapper.toPatientResponse(patient));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy bệnh nhân");
        }
    }

    // thêm bệnh nhân
    @PostMapping("/patients")
    public ResponseEntity<?> addPatient(@RequestBody Patient patient) {
        if (patient.getPhone() != null && patientService.existsByPhone(patient.getPhone())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Số điện thoại này đã được đăng ký");
        }

        Patient newPatient = new Patient();
        newPatient.setFullName(patient.getFullName());
        newPatient.setDateOfBirth(patient.getDateOfBirth());
        newPatient.setGender(patient.getGender());
        newPatient.setPhone(patient.getPhone());
        newPatient.setAddress(patient.getAddress());
        newPatient.setMedicalHistory(patient.getMedicalHistory());
        newPatient.setActive(true);
        newPatient.setRegisteredAt(LocalDateTime.now());

        Patient savedPatient = patientService.save(newPatient);
        return ResponseEntity.status(HttpStatus.CREATED).body(PatientMapper.toPatientResponse(savedPatient));
    }

    // cập nhật thông tin bệnh nhân
    @PutMapping("/patients/{id}")
    public ResponseEntity<?> updatePatient(@PathVariable int id, @RequestBody Patient patient) {
        try {
            Patient existingPatient = patientService.findById(id);

            if (patient.getFullName() != null) existingPatient.setFullName(patient.getFullName());
            if (patient.getDateOfBirth() != null) existingPatient.setDateOfBirth(patient.getDateOfBirth());
            if (patient.getGender() != null) existingPatient.setGender(patient.getGender());
            if (patient.getPhone() != null) existingPatient.setPhone(patient.getPhone());
            if (patient.getAddress() != null) existingPatient.setAddress(patient.getAddress());
            if (patient.getMedicalHistory() != null) existingPatient.setMedicalHistory(patient.getMedicalHistory());

            existingPatient.setActive(patient.isActive());

            Patient updatedPatient = patientService.save(existingPatient);
            return ResponseEntity.ok(PatientMapper.toPatientResponse(updatedPatient));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy bệnh nhân");
        }
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable int id) {
        try {
            Patient existingPatient = patientService.findById(id);
            existingPatient.setActive(false);
            patientService.save(existingPatient);

            return ResponseEntity.ok("Xóa thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy bệnh nhân");
        }
    }
}
