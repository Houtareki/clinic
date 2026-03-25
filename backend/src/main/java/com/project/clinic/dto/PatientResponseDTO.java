package com.project.clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponseDTO {
    private int patientId;
    private String fullName;
    private String dateOfBirth;
    private Integer age;
    private String gender;
    private String phone;
    private String address;
    private String medicalHistory;
    private boolean isActive;
    private String registeredAt;
}
