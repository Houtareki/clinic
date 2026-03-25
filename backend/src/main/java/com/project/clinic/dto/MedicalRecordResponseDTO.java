package com.project.clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordResponseDTO {
    private int recordId;

    private int patientId;
    private String patientName;
    private int doctorId;
    private String doctorName;
    private int shiftId;

    private String symptoms;
    private String diagnosis;
    private String note;
    private String status;
    private String examinedAt;
    private String createdAt;
}
