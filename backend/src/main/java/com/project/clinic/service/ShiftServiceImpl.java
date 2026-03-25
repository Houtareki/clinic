package com.project.clinic.service;

import com.project.clinic.entity.Shift;
import com.project.clinic.repository.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ShiftServiceImpl implements ShiftService {
    private final ShiftRepository shiftRepository;

    @Autowired
    public ShiftServiceImpl(ShiftRepository shiftRepository) {
        this.shiftRepository = shiftRepository;
    }

    @Override
    public List<Shift> findAll() {
        return shiftRepository.findAll();
    }

    @Override
    public Shift findById(int id) {
        Optional<Shift> shift = shiftRepository.findById(id);
        Shift theShift;

        if (shift.isPresent()) {
            theShift = shift.get();
        } else {
            throw new RuntimeException("Không tìm thấy ca trực");
        }
        return theShift;
    }

    @Override
    public Shift save(Shift shift) {
        return shiftRepository.save(shift);
    }
}
