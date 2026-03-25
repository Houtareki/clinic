package com.project.clinic.mapper;

import com.project.clinic.dto.DoctorResponseDTO;
import com.project.clinic.dto.DoctorSimpleResponseDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.entity.Doctor;

import java.util.List;
import java.util.stream.Collectors;

public class DoctorSimpleMapper {

    public static DoctorSimpleResponseDTO toSimple(Account acc, Doctor doc) {
        DoctorSimpleResponseDTO dto = new DoctorSimpleResponseDTO();

        dto.setId(acc.getId());
        dto.setFullName(acc.getFullName());

        if (doc != null) {
            dto.setSpecialty(doc.getSpecialty());
            dto.setDegree(doc.getDegree());
        }

        return dto;
    }

    public static List<DoctorSimpleResponseDTO> toDoctorSimple(List<Account> accounts, List<Doctor> doctors) {
        return accounts.stream().map(acc -> {
            Doctor doc = doctors.stream()
                    .filter(d -> d.getDoctorId() == acc.getId())
                    .findFirst()
                    .orElse(null);


            return toSimple(acc, doc);
        }).toList();
    }
}
