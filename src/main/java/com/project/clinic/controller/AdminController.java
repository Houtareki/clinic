package com.project.clinic.controller;

import com.project.clinic.dto.EmployeeResponse;
import com.project.clinic.entity.Account;
import com.project.clinic.mapper.EmployeeMapper;
import com.project.clinic.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AccountService accountService;

    @Autowired
    public AdminController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeResponse>> getAllEmployees() {
        List<Account> accounts = accountService.getAllAccounts();

        return ResponseEntity.ok(EmployeeMapper.toEmployeeList(accounts));
    }
}
