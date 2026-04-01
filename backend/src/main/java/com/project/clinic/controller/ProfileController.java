package com.project.clinic.controller;

import com.project.clinic.dto.ChangePasswordDTO;
import com.project.clinic.dto.ProfileResponseDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.entity.Doctor;
import com.project.clinic.mapper.DoctorMapper;
import com.project.clinic.mapper.EmployeeMapper;
import com.project.clinic.service.AccountService;
import com.project.clinic.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final AccountService accountService;
    private final DoctorService doctorService;

    @Autowired
    public ProfileController(AccountService accountService, DoctorService doctorService) {
        this.accountService = accountService;
        this.doctorService = doctorService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@RequestHeader("X-User-Id") int userId) {
        Account account = accountService.findById(userId);
        if (account == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy người dùng");
        }

        if (account.getRole() == Account.Role.DOCTOR) {
            Doctor doctor = doctorService.findByAccountId(userId).orElse(null);
            return ResponseEntity.ok(DoctorMapper.toDoctorResponse(account, doctor));
        } else {
            return ResponseEntity.ok(EmployeeMapper.toEmployeeList(Collections.singletonList(account)).getFirst());
        }
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<?> updateProfile(@RequestHeader("X-User-Id") int userId,
                                           @RequestBody ProfileResponseDTO request) {
        Account account = accountService.findById(userId);
        if (account == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy người dùng");
        }

        if (request.getFullName() != null) account.setFullName(request.getFullName());
        if (request.getPhone() != null) account.setPhone(request.getPhone());
        if (request.getEmail() != null) account.setEmail(request.getEmail());
        if (request.getAvatarUrl() != null) account.setAvatarUrl(request.getAvatarUrl());

        accountService.save(account);

        if (account.getRole() == Account.Role.DOCTOR) {
            Doctor doctor = doctorService.findByAccountId(userId).orElse(new Doctor());

            doctor.setAccount(account);
            //doctor.setDoctorId(userId);

            if (request.getSpecialty() != null) doctor.setSpecialty(request.getSpecialty());
            if (request.getBio() != null) doctor.setBio(request.getBio());

            doctorService.save(doctor);
            return ResponseEntity.ok(DoctorMapper.toDoctorResponse(account, doctor));
        }

        return ResponseEntity.ok(EmployeeMapper.toEmployeeList(Collections.singletonList(account)).getFirst());
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("X-User-Id") int userId,
            @RequestBody ChangePasswordDTO request) {

        Account account = accountService.findById(userId);
        if (account == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy người dùng");
        }

        if (!account.getPassword().equals(request.getCurrentPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu hiện tại không chính xác!");
        }

        account.setPassword(request.getNewPassword());
        accountService.save(account);

        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestHeader("X-User-Id") int userId,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Vui lòng chọn file ảnh!");
        }

        String mockImageUrl = "https://ui-avatars.com/api/?name=Avatar&background=random";

        Account account = accountService.findById(userId);
        if (account != null) {
            account.setAvatarUrl(mockImageUrl);
            accountService.save(account);
        }

        return ResponseEntity.ok(mockImageUrl);
    }
}
