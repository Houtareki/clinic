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
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

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

    // tìm kiếm + phân trang nhân viên
    @GetMapping("/employees")
    public ResponseEntity<Page<EmployeeResponseDTO>> getAllEmployees(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {

        try {
            Page<Account> accountPage = accountService.getEmployeesWithPageAndSearch(role, keyword, page, size);
            Page<EmployeeResponseDTO> responseDTOS = accountPage.map(EmployeeMapper::toEmployeeResponse);

            return ResponseEntity.ok(responseDTOS);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    //thêm nhân viên
    @PostMapping("/employees")
    @Transactional
    public ResponseEntity<?> createEmployee(@RequestBody Account request){
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
        account.setRole(request.getRole());
        account.setActive(true);
        account.setCreatedAt(LocalDateTime.now());

        Account createdAccount = accountService.save(account);

        return ResponseEntity.status(HttpStatus.CREATED).body(EmployeeMapper.toEmployeeResponse(createdAccount));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployee(@RequestBody Account request, @PathVariable int id){
        Account existingAccount = accountService.findById(id);
        if (existingAccount == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy tài khoản");
        }

        if (existingAccount.getRole() == Account.Role.DOCTOR) {
            return ResponseEntity.badRequest()
                    .body("Không thể chuyển thành bác sĩ bằng API này");
        }

        if (request.getFullName() != null) existingAccount.setFullName(request.getFullName());
        if (request.getEmail() != null) existingAccount.setEmail(request.getEmail());
        if (request.getPhone() != null) existingAccount.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) existingAccount.setAvatarUrl(request.getAvatarUrl());
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty())
            existingAccount.setPassword(request.getPassword());
        if (request.isActive() != existingAccount.isActive()) {
            existingAccount.setActive(request.isActive());
        }

        Account updatedAccount = accountService.save(existingAccount);
        return ResponseEntity.status(HttpStatus.OK).body(EmployeeMapper.toEmployeeResponse(updatedAccount));
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

    @PutMapping("/employees/{id}/unlock")
    @Transactional
    public ResponseEntity<?> unlockEmployee(@PathVariable int id) {
        Account existingAccount = accountService.findById(id);
        if (existingAccount == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy nhân viên");
        }

        existingAccount.setActive(true);
        accountService.save(existingAccount);
        return ResponseEntity.ok("Mở khóa thành công");
    }

    @GetMapping("/doctors")
    public ResponseEntity<Page<DoctorResponseDTO>> getAllDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        Page<Doctor> doctorPage = doctorService.getDoctorsWithPageAndSearch(keyword, page, size);

        Page<DoctorResponseDTO> responseDTOS = doctorPage.map(doctor -> DoctorMapper.toDoctorResponse(doctor.getAccount(), doctor));
        return ResponseEntity.ok(responseDTOS);
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
        if (request.getSpecialty() != null) existingDoctor.setSpecialty(request.getSpecialty());
        if (request.getDegree() != null) existingDoctor.setDegree(request.getDegree());
        if (request.getBio() != null) existingDoctor.setBio(request.getBio());

        doctorService.save(existingDoctor);

        return ResponseEntity.ok(DoctorMapper.toDoctorResponse(existingAccount, existingDoctor));
    }
}
