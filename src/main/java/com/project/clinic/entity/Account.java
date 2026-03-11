package com.project.clinic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "account")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private int id;

    private String username;
    private String email;
    private String password;

    @Column(name = "full_name")
    private String fullName;

    private String phone;

    @Column(name = "pin_code")
    private String pinCode;

    public enum Role {
        ADMIN,
        RECEPTIONIST,
        DOCTOR
    }
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "is_active")
    private boolean isActive;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Account(String username, String email, String password, String fullName, String phone, String pinCode, Role role, String avatarUrl, boolean isActive, LocalDateTime createdAt) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phone = phone;
        this.pinCode = pinCode;
        this.role = role;
        this.avatarUrl = avatarUrl;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }
}
