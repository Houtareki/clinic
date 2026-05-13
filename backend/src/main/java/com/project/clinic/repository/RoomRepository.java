package com.project.clinic.repository;

import com.project.clinic.entity.Room;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    Page<Room> findByNameContainingIgnoreCaseAndIsActiveTrue(String keyword, Pageable pageable);

    long countByIsActiveTrue();
}