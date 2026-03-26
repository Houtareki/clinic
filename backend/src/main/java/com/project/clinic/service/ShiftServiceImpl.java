package com.project.clinic.service;

import com.project.clinic.dto.ShiftRequestDTO;
import com.project.clinic.entity.*;
import com.project.clinic.repository.AccountRepository;
import com.project.clinic.repository.RoomRepository;
import com.project.clinic.repository.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ShiftServiceImpl implements ShiftService {
    private final ShiftRepository shiftRepository;
    private final RoomRepository roomRepository;
    private final AccountRepository accountRepository;

    @Autowired
    public ShiftServiceImpl(ShiftRepository shiftRepository,  RoomRepository roomRepository, AccountRepository accountRepository) {
        this.shiftRepository = shiftRepository;
        this.roomRepository = roomRepository;
        this.accountRepository = accountRepository;
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

    @Override
    public List<Shift> findShiftsBetween(LocalDate startDate, LocalDate endDate) {
        return shiftRepository.findByShiftDateBetween(startDate, endDate);
    }

    @Override
    public List<Shift> findShiftsByDoctorBetween(int doctorId, LocalDate startDate, LocalDate endDate) {
        return shiftRepository.findByDoctorIdAndDateBetween(doctorId, startDate, endDate);
    }

    @Override
    @Transactional
    public Shift createShift(ShiftRequestDTO request) {
        Shift shift = new Shift();
        shift.setShiftDate(request.getShiftDate());
        shift.setPeriod(request.getPeriod());
        shift.setNote(request.getNote());
        shift.setCreatedAt(LocalDateTime.now());

        Set<ShiftRoom> shiftRooms = new LinkedHashSet<>();

        for (ShiftRequestDTO.RoomAssignmentDTO assignmentDTO : request.getAssignments()) {
            Room room = roomRepository.findById(assignmentDTO.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng!"));

            ShiftRoom shiftRoom = new ShiftRoom();
            shiftRoom.setShift(shift);
            shiftRoom.setRoom(room);

            Set<ShiftRoomDoctor> shiftRoomDoctors = new LinkedHashSet<>();

            for (Integer doctorId : assignmentDTO.getDoctorIds()) {
                Account doctor = accountRepository.findById(doctorId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ!"));

                ShiftRoomDoctor shiftRoomDoctor = new ShiftRoomDoctor();
                shiftRoomDoctor.setShiftRoom(shiftRoom);
                shiftRoomDoctor.setDoctorAccount(doctor);

                shiftRoomDoctors.add(shiftRoomDoctor);
            }
            shiftRoom.setShiftRoomDoctors(shiftRoomDoctors);
            shiftRooms.add(shiftRoom);
        }
        shift.setShiftRooms(shiftRooms);

        shiftRepository.save(shift);
        return shift;
    }

    @Override
    @Transactional
    public Shift updateShift(int id, ShiftRequestDTO request) {
        Shift existingShift = shiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca trực với ID: " + id));

        existingShift.setShiftDate(request.getShiftDate());
        existingShift.setPeriod(request.getPeriod());
        existingShift.setNote(request.getNote());

        existingShift.getShiftRooms().clear();

        for (ShiftRequestDTO.RoomAssignmentDTO assignmentDTO : request.getAssignments()) {
            Room room = roomRepository.findById(assignmentDTO.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng!"));

            ShiftRoom shiftRoom = new ShiftRoom();
            shiftRoom.setShift(existingShift);
            shiftRoom.setRoom(room);

            Set<ShiftRoomDoctor> shiftRoomDoctors = new LinkedHashSet<>();

            for (Integer doctorId : assignmentDTO.getDoctorIds()) {
                Account doctor = accountRepository.findById(doctorId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ!"));

                ShiftRoomDoctor shiftRoomDoctor = new ShiftRoomDoctor();
                shiftRoomDoctor.setShiftRoom(shiftRoom);
                shiftRoomDoctor.setDoctorAccount(doctor);

                shiftRoomDoctors.add(shiftRoomDoctor);
            }
            shiftRoom.setShiftRoomDoctors(shiftRoomDoctors);
            existingShift.getShiftRooms().add(shiftRoom);
        }

        return shiftRepository.save(existingShift);
    }

    @Override
    @Transactional
    public void deleteShift(int id) {
        if (!shiftRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy ca trực!");
        }
        shiftRepository.deleteById(id);
    }
}
