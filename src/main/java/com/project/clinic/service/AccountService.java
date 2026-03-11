package com.project.clinic.service;

import com.project.clinic.entity.Account;

import java.util.List;

public interface AccountService {
    List<Account> findAll();

    Account findById(int id);
    Account findByUsername(String username);
    Account findByEmail(String email);

    Account findByUsernameOrEmail(String login);

    Account save(Account theAccount);
    void delete(Account theAccount);
}
