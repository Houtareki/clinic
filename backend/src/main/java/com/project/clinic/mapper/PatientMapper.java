package com.project.clinic.mapper;

import com.project.clinic.dto.PatientResponseDTO;
import com.project.clinic.entity.Patient;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PatientMapper {
    public static PatientResponseDTO toPatientRespone(Patient patient) {
        if (patient == null)
            return null;

        PatientResponseDTO dto = new PatientResponseDTO();
        dto.setPatientId(patient.getPatientId());
        dto.setFullName(patient.getFullName());
        dto.setGender(patient.getGender());
        dto.setPhone(patient.getPhone());
        dto.setAddress(patient.getAddress());
        dto.setMedicalHistory(patient.getMedicalHistory());
        dto.setActive(patient.isActive());

        if (patient.getDateOfBirth() != null){
            int age = Period.between(patient.getDateOfBirth(), LocalDate.now()).getYears();
            dto.setAge(age);
        }

        if (patient.getRegisteredAt() != null){
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            dto.setRegisteredAt(patient.getRegisteredAt().format(formatter));
        }

        return dto;
    }

    public static List<PatientResponseDTO> toPatientList(List<Patient> patients) {
        return patients.stream()
                .map(PatientMapper::toPatientRespone)
                .collect(Collectors.toList());
    }
}
