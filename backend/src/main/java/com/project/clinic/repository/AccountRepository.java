package com.project.clinic.repository;

import com.project.clinic.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Integer> {

    Optional<Account> findByUsername(String username);
    Optional<Account> findByEmail(String email);

    Optional<Account> findByUsernameOrEmail(String username, String email);
    List<Account> findByRole(Account.Role role);

    boolean existsByUsername(String username);

    Page<Account> findByRole(Account.Role role, Pageable pageable);
    Page<Account> findByFullNameContainingIgnoreCaseOrPhoneContainingIgnoreCase(String name, String phone, Pageable pageable);
    Page<Account> findByRoleAndFullNameContainingIgnoreCase(Account.Role role, String name, Pageable pageable);

    long countByRoleAndActiveTrue(Account.Role role);
}
