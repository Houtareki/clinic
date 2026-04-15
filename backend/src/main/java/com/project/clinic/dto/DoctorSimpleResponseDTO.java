package com.project.clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorSimpleResponseDTO {
    private int id;
    private Integer accountId;
    private Integer doctorId;
    private String fullName;
    private String phone;
    private String email;
    private String specialty;
    private String degree;
}
