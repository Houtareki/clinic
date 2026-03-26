package com.project.clinic.controller;

import com.project.clinic.dto.DoctorRequestDTO;
import com.project.clinic.dto.DoctorResponseDTO;
import com.project.clinic.dto.EmployeeResponseDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.entity.Doctor;
import com.project.clinic.mapper.DoctorMapper;
import com.project.clinic.mapper.EmployeeMapper;
import com.project.clinic.service.AccountService;
import com.project.clinic.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AccountService accountService;
    private final DoctorService doctorService;

    @Autowired
    public AdminController(AccountService accountService, DoctorService doctorService) {
        this.accountService = accountService;
        this.doctorService = doctorService;
    }

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeResponseDTO>> getAllEmployees(@RequestParam(required = false) String role) {
        List<Account> accounts;

        if (role != null && !role.trim().isEmpty()) {
            try {
                Account.Role enumRole = Account.Role.valueOf(role.toUpperCase());
                accounts = accountService.findByRole(enumRole);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            accounts = accountService.getAllAccounts();
        }

        return ResponseEntity.ok(EmployeeMapper.toEmployeeList(accounts));
    }

    @DeleteMapping("/employees/{id}")
    @Transactional
    public ResponseEntity<?> deleteEmployee(@PathVariable int id) {
        Account existingAccount = accountService.findById(id);
        if (existingAccount == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy nhân viên");
        }

        existingAccount.setActive(false);
        accountService.save(existingAccount);
        return ResponseEntity.ok("Xóa thành công");
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorResponseDTO>> getAllDoctors() {
        List<Account> accounts = accountService.getDoctors();
        List<Doctor> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(DoctorMapper.toDoctorList(accounts, doctors));
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable int id) {
        Account account = accountService.findById(id);

        if (account == null || account.getRole() != Account.Role.DOCTOR) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy bác sĩ");
        }

        Doctor doctor = doctorService.findByAccountId(id).orElse(null);

        return ResponseEntity.ok(DoctorMapper.toDoctorResponse(account, doctor));
    }

    @PostMapping("/doctors")
    @Transactional
    public ResponseEntity<?> createDoctor(@RequestBody DoctorRequestDTO request) {

        if (accountService.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username đã tồn tại");
        }

        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setPassword(request.getPassword());
        account.setFullName(request.getFullName());
        account.setEmail(request.getEmail());
        account.setPhone(request.getPhone());
        account.setAvatarUrl(request.getAvatarUrl());
        account.setRole(Account.Role.DOCTOR);
        account.setActive(true);
        account.setCreatedAt(LocalDateTime.now());

        Account savedAccount = accountService.save(account);

        Doctor doctor = new Doctor();
        doctor.setAccount(savedAccount);
        doctor.setDoctorId(savedAccount.getId());
        doctor.setSpecialty(request.getSpecialty());
        doctor.setDegree(request.getDegree());
        doctor.setBio(request.getBio());

        doctorService.save(doctor);

        return ResponseEntity.status(HttpStatus.CREATED).body(DoctorMapper.toDoctorResponse(savedAccount,doctor));
    }

    @PutMapping("/doctors/{id}")
    @Transactional
    public ResponseEntity<?> updateDoctor(@PathVariable int id, @RequestBody DoctorRequestDTO request) {
        Account existingAccount = accountService.findById(id);

        if (existingAccount == null || existingAccount.getRole() != Account.Role.DOCTOR) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy bác sĩ");
        }

        if (request.getFullName() != null) existingAccount.setFullName(request.getFullName());
        if (request.getPhone() != null) existingAccount.setPhone(request.getPhone());
        if (request.getEmail() != null) existingAccount.setEmail(request.getEmail());
        if (request.getAvatarUrl() != null) existingAccount.setAvatarUrl(request.getAvatarUrl());

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            existingAccount.setPassword(request.getPassword());
        }
        accountService.save(existingAccount);

        Doctor existingDoctor = doctorService.findByAccountId(id).orElse(new Doctor());
        existingDoctor.setAccount(existingAccount);
        //existingDoctor.setDoctorId(id);
        if (request.getSpecialty() != null) existingDoctor.setSpecialty(request.getSpecialty());
        if (request.getDegree() != null) existingDoctor.setDegree(request.getDegree());
        if (request.getBio() != null) existingDoctor.setBio(request.getBio());

        doctorService.save(existingDoctor);

        return ResponseEntity.ok(DoctorMapper.toDoctorResponse(existingAccount, existingDoctor));
    }


}
