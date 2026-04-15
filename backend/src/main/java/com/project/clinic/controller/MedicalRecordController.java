package com.project.clinic.controller;

import com.project.clinic.dto.MedicalRecordResponseDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.entity.MedicalRecord;
import com.project.clinic.entity.Patient;
import com.project.clinic.entity.Shift;
import com.project.clinic.mapper.MedicalRecordMapper;
import com.project.clinic.service.AccountService;
import com.project.clinic.service.MedicalRecordService;
import com.project.clinic.service.PatientService;
import com.project.clinic.service.ShiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/records")
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;
    private final PatientService patientService;
    private final AccountService accountService;
    private final ShiftService shiftService;

    @Autowired
    public MedicalRecordController(MedicalRecordService medicalRecordService, PatientService patientService, AccountService accountService,  ShiftService shiftService) {
        this.medicalRecordService = medicalRecordService;
        this.patientService = patientService;
        this.accountService = accountService;
        this.shiftService = shiftService;
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecordResponseDTO>> getRecordsByPatient(@PathVariable int patientId) {
        List<MedicalRecord> records = medicalRecordService.findByPatientId(patientId);
        return ResponseEntity.ok(MedicalRecordMapper.toRecordList(records));
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<?> creatRecord(@PathVariable int patientId, @RequestBody MedicalRecord record) {
        try {
            Patient patient = patientService.findById(patientId);
            Account doctor = accountService.findById(record.getDoctor().getId());

            LocalDate today = LocalDate.now();
            List<Shift> todayShifts = shiftService.findShiftsByDoctorBetween(doctor.getId(), today, today);

            if (todayShifts.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Bác sĩ này hiện không có ca trực nào trong ngày hôm nay.");
            }

            record.setShift(todayShifts.getFirst());

            record.setPatient(patient);
            record.setDoctor(doctor);
            record.setStatus("Đang chờ");
            record.setCreatedAt(LocalDateTime.now());

            MedicalRecord savedRecord = medicalRecordService.save(record);
            return ResponseEntity.status(HttpStatus.CREATED).body(MedicalRecordMapper.toRecordResponse(savedRecord));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Thông tin không hợp lệ.");
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateRecord(@PathVariable int id, @RequestBody MedicalRecord record) {
        try {
            MedicalRecord existingRecord = medicalRecordService.findById(id);

            if (record.getDiagnosis() != null) {
                existingRecord.setDiagnosis(record.getDiagnosis());
            }

            if (record.getNote() != null) {
                existingRecord.setNote(record.getNote());
            }

            if (record.getSymptoms() != null) {
                existingRecord.setSymptoms(record.getSymptoms());
            }

            if (record.getStatus() != null) {
                existingRecord.setStatus(record.getStatus());

                if (record.getStatus().equalsIgnoreCase("Đã khám") && existingRecord.getExaminedAt() == null) {
                    existingRecord.setExaminedAt(LocalDateTime.now());
                }
            }

            MedicalRecord updatedRecord = medicalRecordService.save(existingRecord);
            return ResponseEntity.status(HttpStatus.OK).body(MedicalRecordMapper.toRecordResponse(updatedRecord));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy ca khám");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecord(@PathVariable int id) {
        try {
            MedicalRecord record = medicalRecordService.findById(id);

            record.setStatus("Hủy");
            medicalRecordService.save(record);
            return ResponseEntity.ok("Hủy thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy ca khám");
        }
    }
}
