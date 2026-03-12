package com.project.clinic.controller;

import com.project.clinic.entity.Account;
import com.project.clinic.exception.AuthExceptionHandler;
import com.project.clinic.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private final AccountService accountService;

    public AuthController(AccountService accountService) {
        this.accountService = accountService;
    }

    public record LoginRequest(String login, String password) { }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        Account account = accountService.findByUsernameOrEmail(loginRequest.login());

        if (!account.isActive()) {
            throw new AuthExceptionHandler("Locked User");
        }

        if (!account.getPassword().equals(loginRequest.password)) {
            throw new AuthExceptionHandler("Wrong Password");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("accountId", account.getId());
        response.put("username", account.getUsername());
        response.put("fullName", account.getFullName());
        response.put("email", account.getEmail());
        response.put("role", account.getRole());

        return ResponseEntity.ok(response);
    }
}
