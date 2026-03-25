package com.project.clinic.service;

import com.project.clinic.dto.ShiftRequestDTO;
import com.project.clinic.entity.Shift;

import java.time.LocalDate;
import java.util.List;

public interface ShiftService {
    List<Shift> findAll();
    Shift findById(int id);
    Shift save(Shift shift);

    List<Shift> findShiftsBetween(LocalDate startDate, LocalDate endDate);

    List<Shift> findShiftsByDoctorBetween(int doctorId, LocalDate startDate, LocalDate endDate);

    Shift createShift(ShiftRequestDTO request);

    Shift updateShift(int id, ShiftRequestDTO request);
    void deleteShift(int id);
}
