package com.project.clinic.mapper;

import com.project.clinic.dto.MedicalRecordResponseDTO;
import com.project.clinic.entity.MedicalRecord;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class MedicalRecordMapper {
    public static MedicalRecordResponseDTO toRecordResponse(MedicalRecord record) {
        if (record == null) return null;

        MedicalRecordResponseDTO dto = new MedicalRecordResponseDTO();
        dto.setRecordId(record.getRecordId());

        if (record.getPatient() != null) {
            dto.setPatientId(record.getPatient().getPatientId());
            dto.setPatientName(record.getPatient().getFullName());
        }

        if (record.getDoctor() != null) {
            dto.setDoctorId(record.getDoctor().getId());
            dto.setDoctorName(record.getDoctor().getFullName());
        }

        if (record.getShift() != null) {
            dto.setShiftId(record.getShift().getShiftId());
        }

        dto.setSymptoms(record.getSymptoms());
        dto.setDiagnosis(record.getDiagnosis());
        dto.setNote(record.getNote());
        dto.setStatus(record.getStatus());

        if (record.getExaminedAt() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            dto.setExaminedAt(record.getExaminedAt().format(formatter));
        }


        if (record.getCreatedAt() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            dto.setCreatedAt(record.getCreatedAt().format(formatter));
        }

        return dto;
    }

    public static List<MedicalRecordResponseDTO> toRecordList(List<MedicalRecord> recordList) {
        return recordList.stream()
                .map(MedicalRecordMapper::toRecordResponse)
                .collect(Collectors.toList());
    }
}
