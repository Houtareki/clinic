package com.project.clinic.repository;

import com.project.clinic.entity.Shift;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Integer> {
    @EntityGraph(attributePaths = {
            "shiftRooms",
            "shiftRooms.room",
            "shiftRooms.shiftRoomDoctors",
            "shiftRooms.shiftRoomDoctors.doctor",
            "shiftRooms.shiftRoomDoctors.doctor.account"
    })
    List<Shift> findByShiftDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT DISTINCT s FROM Shift s " +
            "JOIN FETCH s.shiftRooms sr " +
            "JOIN FETCH sr.room " +
            "JOIN FETCH sr.shiftRoomDoctors srd " +
            "JOIN FETCH srd.doctor d " +
            "JOIN FETCH d.account a " +
            "WHERE a.id = :doctorId " +
            "AND s.shiftDate BETWEEN :startDate AND :endDate")
    List<Shift> findByDoctorIdAndDateBetween(int doctorId, LocalDate startDate, LocalDate endDate);

    List<Shift> findByShiftDate(LocalDate shiftDate);

    long countByShiftDateBetween(java.time.LocalDate startDate, java.time.LocalDate endDate);
}
