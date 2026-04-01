package com.project.clinic.service;

import com.project.clinic.entity.Account;
import com.project.clinic.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;

    @Autowired
    public AccountServiceImpl(AccountRepository theAccountRepository) {
        accountRepository = theAccountRepository;
    }

    @Override
    public List<Account> findAll() {
        return accountRepository.findAll();
    }

    @Override
    public Account findById(int id) {
        Optional<Account> result = accountRepository.findById(id);

        Account theAccount;

        if (result.isPresent()) {
            theAccount = result.get();
        } else {
            throw new RuntimeException("Account not found");
        }
        return theAccount;
    }

    @Override
    public Account findByUsername(String username) {
        Optional<Account> result = accountRepository.findByUsername(username);

        Account theAccount;

        if (result.isPresent()) {
            theAccount = result.get();
        } else {
            throw new RuntimeException("Account not found");
        }
        return theAccount;
    }

    @Override
    public Account findByEmail(String email) {
        Optional<Account> result = accountRepository.findByEmail(email);
        Account theAccount;

        if (result.isPresent()) {
            theAccount = result.get();
        } else {
            throw new RuntimeException("Account not found");
        }
        return theAccount;
    }

    @Override
    public Account findByUsernameOrEmail(String login) {
        Optional<Account> result = accountRepository.findByUsernameOrEmail(login, login);
        Account theAccount;

        if (result.isPresent()) {
            theAccount = result.get();
        } else  {
            throw new RuntimeException("Account not found");
        }
        return theAccount;
    }

    @Override
    public Account save(Account theAccount) {
        return accountRepository.save(theAccount);
    }

    @Override
    public void delete(Account theAccount) {
        accountRepository.delete(theAccount);
    }

    @Override
    public List<Account> getAllAccounts() {

        return accountRepository.findAll();
    }

    @Override
    public List<Account> getDoctors() {
        return accountRepository.findByRole(Account.Role.DOCTOR);
    }

    @Override
    public List<Account> findByRole(Account.Role role) {
        return accountRepository.findByRole(role);
    }

    @Override
    public boolean existsByUsername(String username) {
        return accountRepository.existsByUsername(username);
    }

    @Override
    public Page<Account> getEmployeesWithPageAndSearch(String role, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        if (role != null && !role.trim().isEmpty()) {
            Account.Role theRole = Account.Role.valueOf(role.trim().toUpperCase());
            if (keyword != null && !keyword.trim().isEmpty()) {
                return accountRepository.findByRoleAndFullNameContainingIgnoreCase(theRole, keyword, pageable);
            }
            return accountRepository.findByRole(theRole, pageable);
        }

        if (keyword != null && !keyword.trim().isEmpty()) {
            return accountRepository.findByFullNameContainingIgnoreCaseOrPhoneContainingIgnoreCase(keyword, keyword, pageable);
        }

        return accountRepository.findAll(pageable);
    }
}
