package com.project.clinic.controller;

import com.project.clinic.dto.DashboardStatsDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.repository.AccountRepository;
import com.project.clinic.repository.PatientRepository;
import com.project.clinic.repository.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final AccountRepository accountRepository;
    private final PatientRepository patientRepository;
    private final ShiftRepository shiftRepository;

    @Autowired
    public DashboardController(AccountRepository accountRepository,
                               PatientRepository patientRepository,
                               ShiftRepository shiftRepository) {
        this.accountRepository = accountRepository;
        this.patientRepository = patientRepository;
        this.shiftRepository = shiftRepository;
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

        long totalDoctors = accountRepository.findAll().stream()
                .filter(acc -> acc.getRole() == Account.Role.DOCTOR && acc.isActive())
                .count();
        stats.setTotalDoctors(totalDoctors);

        long totalPatients = patientRepository.count();
        stats.setPatientsToday(totalPatients);

        long shiftsToday = 0;
        if (role == Account.Role.RECEPTIONIST || role == Account.Role.ADMIN) {
            shiftsToday = shiftRepository.findByShiftDateBetween(today, today).size();
        } else if (role == Account.Role.DOCTOR) {
            shiftsToday = shiftRepository.findByDoctorIdAndDateBetween(userId, today, today).size();
        }
        stats.setShiftsToday(shiftsToday);

        return ResponseEntity.ok(stats);
    }
}
