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
    private static final String STATUS_PENDING = "Đang chờ";
    private static final String STATUS_COMPLETED = "Hoàn thành";
    private static final String STATUS_CANCELLED = "Hủy";

    private final MedicalRecordService medicalRecordService;
    private final PatientService patientService;
    private final AccountService accountService;
    private final ShiftService shiftService;

    @Autowired
    public MedicalRecordController(
            MedicalRecordService medicalRecordService,
            PatientService patientService,
            AccountService accountService,
            ShiftService shiftService
    ) {
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
    public ResponseEntity<?> createRecord(@PathVariable int patientId, @RequestBody MedicalRecord record) {
        try {
            if (record.getDoctor() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Vui lòng chọn bác sĩ phụ trách.");
            }

            Patient patient = patientService.findById(patientId);
            Account doctor = accountService.findById(record.getDoctor().getId());

            if (doctor.getRole() != Account.Role.DOCTOR) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Tài khoản được chọn không phải bác sĩ.");
            }

            LocalDate today = LocalDate.now();
            Shift assignedShift = findAvailableShift(doctor, today);

            if (assignedShift == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Bác sĩ này hiện không có ca trực nào trong ngày hôm nay.");
            }

            record.setShift(assignedShift);
            record.setPatient(patient);
            record.setDoctor(doctor);
            record.setStatus(STATUS_PENDING);
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

            if (record.getDoctor() != null && record.getDoctor().getId() > 0) {
                Account doctor = accountService.findById(record.getDoctor().getId());

                if (doctor.getRole() != Account.Role.DOCTOR) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Tài khoản được chọn không phải bác sĩ.");
                }

                LocalDate scheduledDate = resolveRecordDate(existingRecord);
                Shift assignedShift = findAvailableShift(doctor, scheduledDate);

                if (assignedShift == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Bác sĩ này hiện không có ca trực cho lịch khám đã chọn.");
                }

                existingRecord.setDoctor(doctor);
                existingRecord.setShift(assignedShift);
            }

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
                String normalizedStatus = normalizeStatus(record.getStatus());
                existingRecord.setStatus(normalizedStatus);

                if (STATUS_COMPLETED.equalsIgnoreCase(normalizedStatus) && existingRecord.getExaminedAt() == null) {
                    existingRecord.setExaminedAt(LocalDateTime.now());
                }
            }

            MedicalRecord updatedRecord = medicalRecordService.save(existingRecord);
            return ResponseEntity.ok(MedicalRecordMapper.toRecordResponse(updatedRecord));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy ca khám");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecord(@PathVariable int id) {
        try {
            MedicalRecord record = medicalRecordService.findById(id);

            record.setStatus(STATUS_CANCELLED);
            medicalRecordService.save(record);
            return ResponseEntity.ok("Hủy thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy ca khám");
        }
    }

    private Shift findAvailableShift(Account doctor, LocalDate shiftDate) {
        List<Shift> shifts = shiftService.findShiftsByDoctorBetween(doctor.getId(), shiftDate, shiftDate);
        if (shifts.isEmpty()) {
            return null;
        }
        return shifts.getFirst();
    }

    private LocalDate resolveRecordDate(MedicalRecord record) {
        if (record.getShift() != null && record.getShift().getShiftDate() != null) {
            return record.getShift().getShiftDate();
        }

        if (record.getCreatedAt() != null) {
            return record.getCreatedAt().toLocalDate();
        }

        return LocalDate.now();
    }

    private String normalizeStatus(String rawStatus) {
        String status = rawStatus == null ? "" : rawStatus.trim();

        if (STATUS_PENDING.equalsIgnoreCase(status)) {
            return STATUS_PENDING;
        }

        if ("Đã khám".equalsIgnoreCase(status) || STATUS_COMPLETED.equalsIgnoreCase(status)) {
            return STATUS_COMPLETED;
        }

        if ("Huỷ".equalsIgnoreCase(status) || STATUS_CANCELLED.equalsIgnoreCase(status)) {
            return STATUS_CANCELLED;
        }

        throw new IllegalArgumentException("Trạng thái ca khám không hợp lệ.");
    }
}
