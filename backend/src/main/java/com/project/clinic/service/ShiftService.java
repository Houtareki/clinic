package com.project.clinic.service;

import com.project.clinic.entity.Shift;

import java.util.List;

public interface ShiftService {
    List<Shift> findAll();
    Shift findById(int id);
    Shift save(Shift shift);
}
