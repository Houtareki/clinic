package com.project.clinic.controller;

import com.project.clinic.dto.DashboardStatsDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.repository.AccountRepository;
import com.project.clinic.repository.MedicalRecordRepository;
import com.project.clinic.repository.PatientRepository;
import com.project.clinic.repository.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final AccountRepository accountRepository;
    private final PatientRepository patientRepository;
    private final ShiftRepository shiftRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    @Autowired
    public DashboardController(AccountRepository accountRepository,
                               PatientRepository patientRepository,
                               ShiftRepository shiftRepository,
                               MedicalRecordRepository medicalRecordRepository) {
        this.accountRepository = accountRepository;
        this.patientRepository = patientRepository;
        this.shiftRepository = shiftRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(
            @RequestHeader("X-User-Role") String roleStr,
            @RequestHeader(value = "X-User-Id", defaultValue = "0") int userId) {

        Account.Role role;
        try {
            role = Account.Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Role không hợp lệ");
        }

        DashboardStatsDTO stats = new DashboardStatsDTO();

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        if (role == Account.Role.RECEPTIONIST || role == Account.Role.ADMIN) {
            stats.setTotalDoctors(accountRepository.countByRoleAndActiveTrue(Account.Role.DOCTOR));
            stats.setNewPatientsToday(patientRepository.countByRegisteredAtBetween(startOfDay, endOfDay));
            stats.setTotalShiftsToday(shiftRepository.countByShiftDateBetween(today, today));
            stats.setTotalAppointmentsToday(medicalRecordRepository.countByCreatedAtBetween(startOfDay, endOfDay));
        } else if (role == Account.Role.DOCTOR) {
            long myShifts = shiftRepository.findByDoctorIdAndDateBetween(userId, today, today).size();
            stats.setMyShiftsToday(myShifts);
            stats.setMyAppointmentsToday(
                    medicalRecordRepository.countByDoctor_IdAndCreatedAtBetween(userId, startOfDay, endOfDay)
            );
            stats.setMyPendingAppointments(
                    medicalRecordRepository.countByDoctor_IdAndStatusAndCreatedAtBetween(
                            userId,
                            "Đang chờ",
                            startOfDay,
                            endOfDay
                    )
            );
            stats.setMyCompletedAppointments(
                    medicalRecordRepository.countByDoctor_IdAndStatusInAndCreatedAtBetween(
                            userId,
                            List.of("Hoàn thành", "Đã khám"),
                            startOfDay,
                            endOfDay
                    )
            );
        }
        return ResponseEntity.ok(stats);
    }
}
