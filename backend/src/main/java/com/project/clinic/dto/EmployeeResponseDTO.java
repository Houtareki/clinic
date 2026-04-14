package com.project.clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponseDTO {
    private int id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String avatarUrl;
    private String createdAt;
    private boolean isActive;
}
