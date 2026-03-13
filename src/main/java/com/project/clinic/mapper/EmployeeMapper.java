package com.project.clinic.mapper;

import com.project.clinic.dto.EmployeeResponseDTO;
import com.project.clinic.entity.Account;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EmployeeMapper {
    public static EmployeeResponseDTO toEmployeeResponse(Account account) {
        if (account == null) {
            return null;
        }

        EmployeeResponseDTO dto = new EmployeeResponseDTO();
        dto.setId(account.getId());
        dto.setUsername(account.getUsername());
        dto.setFullName(account.getFullName());
        dto.setEmail(account.getEmail());
        dto.setPhone(account.getPhone());
        dto.setRole(account.getRole().name());
        dto.setAvatarUrl(account.getAvatarUrl());
        dto.setActive(account.isActive());

        return dto;
    }

    public static List<EmployeeResponseDTO> toEmployeeList(List<Account> accounts) {
        return accounts.stream()
                .map(EmployeeMapper::toEmployeeResponse)
                .collect(Collectors.toList());
    }
}
