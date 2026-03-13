package com.project.clinic.mapper;

import com.project.clinic.dto.EmployeeResponse;
import com.project.clinic.entity.Account;

import java.util.List;
import java.util.stream.Collectors;

public class EmployeeMapper {
    public static EmployeeResponse toEmployeeResponse(Account account) {
        return new EmployeeResponse(
                account.getId(),
                account.getUsername(),
                account.getFullName(),
                account.getEmail(),
                account.getPhone(),
                account.getRole().name(),
                account.getAvatarUrl(),
                account.isActive()
        );
    }

    public static List<EmployeeResponse> toEmployeeList(List<Account> accounts) {
        return accounts.stream()
                .map(EmployeeMapper::toEmployeeResponse)
                .collect(Collectors.toList());
    }
}
