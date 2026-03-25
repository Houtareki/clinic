package com.project.clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorRequestDTO {
    private String username;
    private String password;
    private String fullName;
    private String phone;
    private String email;
    private String avatarUrl;

    private String specialty;
    private String degree;
    private String bio;
}
