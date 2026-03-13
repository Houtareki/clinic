package com.project.clinic.controller;

import com.project.clinic.dto.EmployeeResponse;
import com.project.clinic.entity.Account;
import com.project.clinic.mapper.EmployeeMapper;
import com.project.clinic.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/receptionist")
public class ReceptionistController {

    private final AccountService accountService;

    public ReceptionistController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<EmployeeResponse>> getDoctorsList() {
        List<Account> accounts = accountService.getDoctors();

        return ResponseEntity.ok(EmployeeMapper.toEmployeeList(accounts));
    }



}
