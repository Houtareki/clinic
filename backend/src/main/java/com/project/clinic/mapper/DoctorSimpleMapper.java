package com.project.clinic.mapper;

import com.project.clinic.dto.DoctorResponseDTO;
import com.project.clinic.dto.DoctorSimpleResponseDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.entity.Doctor;

import java.util.List;

public class DoctorSimpleMapper {

    public static DoctorSimpleResponseDTO toSimple(Account acc, Doctor doc) {
        DoctorSimpleResponseDTO dto = new DoctorSimpleResponseDTO();

        dto.setId(acc.getId());
        dto.setAccountId(acc.getId());
        dto.setFullName(acc.getFullName());
        dto.setEmail(acc.getEmail());
        dto.setPhone(acc.getPhone());
        if (doc != null) {
            dto.setDoctorId(doc.getDoctorId());
            dto.setSpecialty(doc.getSpecialty());
            dto.setDegree(doc.getDegree());
        }

        return dto;
    }

    public static List<DoctorSimpleResponseDTO> toDoctorSimple(List<Account> accounts, List<Doctor> doctors) {
        return accounts.stream().map(acc -> {
            Doctor doc = doctors.stream()
                    .filter(d -> d.getAccount() != null && d.getAccount().getId() == acc.getId())
                    .findFirst()
                    .orElse(null);


            return toSimple(acc, doc);
        }).toList();
    }
}
