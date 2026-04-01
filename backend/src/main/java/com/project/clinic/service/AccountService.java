package com.project.clinic.service;

import com.project.clinic.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AccountService {
    List<Account> findAll();

    Account findById(int id);
    Account findByUsername(String username);
    Account findByEmail(String email);

    Account findByUsernameOrEmail(String login);

    Account save(Account theAccount);
    void delete(Account theAccount);

    List<Account> getAllAccounts();
    List<Account> getDoctors();

    List<Account> findByRole(Account.Role role);

    boolean existsByUsername(String username);

    Page<Account> getEmployeesWithPageAndSearch(String role, String keyword, int page, int size);
}
