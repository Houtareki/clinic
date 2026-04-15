package com.project.clinic.mapper;

import com.project.clinic.dto.DoctorResponseDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.entity.Doctor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DoctorMapper {
    public static DoctorResponseDTO toDoctorResponse(Account account, Doctor doctor) {
        if (account == null) return null;

        DoctorResponseDTO dto = new DoctorResponseDTO();

        dto.setId(account.getId());
        dto.setAccountId(account.getId());
        dto.setUsername(account.getUsername());
        dto.setFullName(account.getFullName());
        dto.setEmail(account.getEmail());
        dto.setPhone(account.getPhone());
        dto.setRole(account.getRole().name());
        dto.setAvatarUrl(account.getAvatarUrl());
        dto.setActive(account.isActive());
        dto.setCreatedAt(account.getCreatedAt().toString());

        if (doctor != null) {
            dto.setDoctorId(doctor.getDoctorId());
            dto.setSpecialty(doctor.getSpecialty());
            dto.setDegree(doctor.getDegree());
            dto.setBio(doctor.getBio());
        }

        return dto;
    }

    public static List<DoctorResponseDTO> toDoctorList(List<Account> accounts, List<Doctor> doctors) {
        return accounts.stream().map(acc -> {
            Doctor doctor = doctors.stream()
                    .filter(d -> d.getAccount() != null && d.getAccount().getId() == acc.getId())
                    .findFirst()
                    .orElse(null);

            return toDoctorResponse(acc, doctor);
        }).collect(Collectors.toList());
    }
}
