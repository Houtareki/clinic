package com.project.clinic.service;

import com.project.clinic.dto.ShiftRequestDTO;
import com.project.clinic.entity.Doctor;
import com.project.clinic.entity.Room;
import com.project.clinic.entity.Shift;
import com.project.clinic.entity.ShiftRoom;
import com.project.clinic.entity.ShiftRoomDoctor;
import com.project.clinic.repository.DoctorRepository;
import com.project.clinic.repository.RoomRepository;
import com.project.clinic.repository.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ShiftServiceImpl implements ShiftService {
    private static final String MORNING_PERIOD = "Sáng";
    private static final String AFTERNOON_PERIOD = "Chiều";

    private final ShiftRepository shiftRepository;
    private final RoomRepository roomRepository;
    private final DoctorRepository doctorRepository;

    @Autowired
    public ShiftServiceImpl(
            ShiftRepository shiftRepository,
            RoomRepository roomRepository,
            DoctorRepository doctorRepository
    ) {
        this.shiftRepository = shiftRepository;
        this.roomRepository = roomRepository;
        this.doctorRepository = doctorRepository;
    }

    @Override
    public List<Shift> findAll() {
        return shiftRepository.findAll();
    }

    @Override
    public Shift findById(int id) {
        Optional<Shift> shift = shiftRepository.findById(id);

        if (shift.isPresent()) {
            return shift.get();
        }

        throw new RuntimeException("Khong tim thay ca truc");
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
        String requestedPeriodKey = getPeriodKey(request.getPeriod());
        ensureNoSlotConflict(request.getShiftDate(), requestedPeriodKey, null);

        Shift shift = new Shift();
        shift.setShiftDate(request.getShiftDate());
        shift.setPeriod(toCanonicalPeriod(requestedPeriodKey));
        shift.setNote(request.getNote());
        shift.setCreatedAt(LocalDateTime.now());

        Set<ShiftRoom> shiftRooms = new LinkedHashSet<>();

        for (ShiftRequestDTO.RoomAssignmentDTO assignmentDTO : request.getAssignments()) {
            Room room = roomRepository.findById(assignmentDTO.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Khong tim thay phong"));

            ShiftRoom shiftRoom = new ShiftRoom();
            shiftRoom.setShift(shift);
            shiftRoom.setRoom(room);

            Set<ShiftRoomDoctor> shiftRoomDoctors = new LinkedHashSet<>();

            for (Integer doctorId : assignmentDTO.getDoctorIds()) {
                Doctor doctor = doctorRepository.findByDoctorId(doctorId)
                        .orElseThrow(() -> new RuntimeException("Khong tim thay bac si"));

                ShiftRoomDoctor shiftRoomDoctor = new ShiftRoomDoctor();
                shiftRoomDoctor.setShiftRoom(shiftRoom);
                shiftRoomDoctor.setDoctor(doctor);
                shiftRoomDoctors.add(shiftRoomDoctor);
            }

            shiftRoom.setShiftRoomDoctors(shiftRoomDoctors);
            shiftRooms.add(shiftRoom);
        }

        shift.setShiftRooms(shiftRooms);
        return shiftRepository.save(shift);
    }

    @Override
    @Transactional
    public Shift updateShift(int id, ShiftRequestDTO request) {
        Shift existingShift = shiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay ca truc voi ID: " + id));

        String existingPeriodKey = getPeriodKey(existingShift.getPeriod());
        String requestedPeriodKey = getPeriodKey(request.getPeriod());
        boolean isSameLogicalSlot =
                Objects.equals(existingShift.getShiftDate(), request.getShiftDate()) &&
                Objects.equals(existingPeriodKey, requestedPeriodKey);
        boolean hasSlotConflict = hasSlotConflict(request.getShiftDate(), requestedPeriodKey, id);

        if (hasSlotConflict && !isSameLogicalSlot) {
            throw new RuntimeException("Ca truc nay da ton tai cho ngay va buoi duoc chon");
        }

        existingShift.setShiftDate(request.getShiftDate());
        existingShift.setPeriod(
                hasSlotConflict && isSameLogicalSlot
                        ? existingShift.getPeriod()
                        : toCanonicalPeriod(requestedPeriodKey)
        );
        existingShift.setNote(request.getNote());

        Set<Integer> requestRoomIds = request.getAssignments().stream()
                .map(ShiftRequestDTO.RoomAssignmentDTO::getRoomId)
                .collect(Collectors.toSet());

        existingShift.getShiftRooms().removeIf(
                shiftRoom -> !requestRoomIds.contains(shiftRoom.getRoom().getRoomId())
        );

        for (ShiftRequestDTO.RoomAssignmentDTO assignmentDTO : request.getAssignments()) {
            Room room = roomRepository.findById(assignmentDTO.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Khong tim thay phong"));

            ShiftRoom shiftRoom = existingShift.getShiftRooms().stream()
                    .filter(currentRoom -> currentRoom.getRoom().getRoomId() == assignmentDTO.getRoomId())
                    .findFirst()
                    .orElse(null);

            if (shiftRoom == null) {
                shiftRoom = new ShiftRoom();
                shiftRoom.setShift(existingShift);
                shiftRoom.setRoom(room);
                existingShift.getShiftRooms().add(shiftRoom);
            }

            Set<Integer> requestDoctorIds = new HashSet<>(assignmentDTO.getDoctorIds());

            shiftRoom.getShiftRoomDoctors().removeIf(
                    shiftRoomDoctor -> !requestDoctorIds.contains(
                            shiftRoomDoctor.getDoctor().getDoctorId()
                    )
            );

            Set<Integer> existingDoctorIds = shiftRoom.getShiftRoomDoctors().stream()
                    .map(shiftRoomDoctor -> shiftRoomDoctor.getDoctor().getDoctorId())
                    .collect(Collectors.toSet());

            for (Integer doctorId : requestDoctorIds) {
                if (existingDoctorIds.contains(doctorId)) {
                    continue;
                }

                Doctor doctor = doctorRepository.findByDoctorId(doctorId)
                        .orElseThrow(() -> new RuntimeException("Khong tim thay bac si"));

                ShiftRoomDoctor shiftRoomDoctor = new ShiftRoomDoctor();
                shiftRoomDoctor.setShiftRoom(shiftRoom);
                shiftRoomDoctor.setDoctor(doctor);
                shiftRoom.getShiftRoomDoctors().add(shiftRoomDoctor);
            }
        }

        return shiftRepository.save(existingShift);
    }

    @Override
    @Transactional
    public void deleteShift(int id) {
        if (!shiftRepository.existsById(id)) {
            throw new RuntimeException("Khong tim thay ca truc");
        }

        shiftRepository.deleteById(id);
    }

    private void ensureNoSlotConflict(LocalDate shiftDate, String periodKey, Integer excludedShiftId) {
        if (hasSlotConflict(shiftDate, periodKey, excludedShiftId)) {
            throw new RuntimeException("Ca truc nay da ton tai cho ngay va buoi duoc chon");
        }
    }

    private boolean hasSlotConflict(LocalDate shiftDate, String periodKey, Integer excludedShiftId) {
        return shiftRepository.findByShiftDate(shiftDate).stream()
                .filter(shift -> excludedShiftId == null || shift.getShiftId() != excludedShiftId)
                .anyMatch(shift -> Objects.equals(getPeriodKey(shift.getPeriod()), periodKey));
    }

    private String toCanonicalPeriod(String periodKey) {
        return "afternoon".equals(periodKey) ? AFTERNOON_PERIOD : MORNING_PERIOD;
    }

    private String getPeriodKey(String period) {
        String normalized = Normalizer.normalize(
                        String.valueOf(period == null ? "" : period),
                        Normalizer.Form.NFD
                )
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9:]+", "")
                .trim();

        if (
                normalized.contains("chieu") ||
                normalized.contains("afternoon") ||
                normalized.contains("1300")
        ) {
            return "afternoon";
        }

        return "morning";
    }
}
