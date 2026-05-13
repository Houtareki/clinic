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

        throw new RuntimeException("Không tìm thấy ca trực với ID: " + id);
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

        boolean isRecurring = Boolean.TRUE.equals(request.getIsRecurring());
        int loopCount = isRecurring && request.getRecurringWeeks() != null ? request.getRecurringWeeks() : 1;
        String groupId = isRecurring ? java.util.UUID.randomUUID().toString() : null;

        Shift firstShift = null;

        for (int i = 0; i < loopCount; i++) {
            LocalDate currentDate = request.getShiftDate().plusWeeks(i);

            ensureNoSlotConflict(currentDate, requestedPeriodKey, null);

            Shift shift = new Shift();
            shift.setShiftDate(currentDate);
            shift.setPeriod(toCanonicalPeriod(requestedPeriodKey));
            shift.setNote(request.getNote());
            shift.setCreatedAt(LocalDateTime.now());
            shift.setRecurringGroupId(groupId);

            Set<ShiftRoom> shiftRooms = new LinkedHashSet<>();

            for (ShiftRequestDTO.RoomAssignmentDTO assignmentDTO : request.getAssignments()) {
                Room room = roomRepository.findById(assignmentDTO.getRoomId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));

                ShiftRoom shiftRoom = new ShiftRoom();
                shiftRoom.setShift(shift);
                shiftRoom.setRoom(room);

                Set<ShiftRoomDoctor> shiftRoomDoctors = new LinkedHashSet<>();

                for (Integer doctorId : assignmentDTO.getDoctorIds()) {
                    Doctor doctor = doctorRepository.findByDoctorId(doctorId)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));

                    ShiftRoomDoctor shiftRoomDoctor = new ShiftRoomDoctor();
                    shiftRoomDoctor.setShiftRoom(shiftRoom);
                    shiftRoomDoctor.setDoctor(doctor);
                    shiftRoomDoctors.add(shiftRoomDoctor);
                }

                shiftRoom.setShiftRoomDoctors(shiftRoomDoctors);
                shiftRooms.add(shiftRoom);
            }

            shift.setShiftRooms(shiftRooms);
            Shift savedShift = shiftRepository.save(shift);
            if (i == 0) firstShift = savedShift;
        }
        return firstShift;
    }

    @Override
    @Transactional
    public Shift updateShift(int id, ShiftRequestDTO request) {
        Shift existingShift = shiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca trực với ID: " + id));

        boolean isRecurring = Boolean.TRUE.equals(request.getIsRecurring());
        // Nếu tích checkbox thì chạy theo số tuần, không thì chạy 1 lần
        int loopCount = isRecurring && request.getRecurringWeeks() != null ? request.getRecurringWeeks() : 1;
        String requestedPeriodKey = getPeriodKey(request.getPeriod());

        for (int i = 0; i < loopCount; i++) {
            LocalDate targetDate = request.getShiftDate().plusWeeks(i);

            if (i == 0) {
                // Tuần hiện tại
                applyUpdateToShift(existingShift, request, targetDate);
                shiftRepository.save(existingShift);
            } else {
                // Các tuần tương lai: Tìm xem ngày đó đã có ca trực chưa
                Shift futureShift = shiftRepository.findByShiftDate(targetDate).stream()
                        .filter(s -> Objects.equals(getPeriodKey(s.getPeriod()), requestedPeriodKey))
                        .findFirst()
                        .orElse(null);

                if (futureShift != null) { // Nếu có rồi thì cập nhật đè lên
                    applyUpdateToShift(futureShift, request, targetDate);
                    shiftRepository.save(futureShift);
                } else { // Nếu trống thì tự động tạo mới ca trực cho tương lai
                    Shift newShift = new Shift();
                    newShift.setShiftDate(targetDate);
                    newShift.setPeriod(toCanonicalPeriod(requestedPeriodKey));
                    newShift.setCreatedAt(LocalDateTime.now());
                    newShift.setRecurringGroupId(existingShift.getRecurringGroupId());
                    newShift.setShiftRooms(new LinkedHashSet<>());
                    applyUpdateToShift(newShift, request, targetDate);
                    shiftRepository.save(newShift);
                }
            }
        }
        return existingShift;
    }

    // HÀM XỬ LÝ LÕI
    private void applyUpdateToShift(Shift shiftToUpdate, ShiftRequestDTO request, LocalDate targetDate) {
        String requestedPeriodKey = getPeriodKey(request.getPeriod());
        boolean isSameLogicalSlot = Objects.equals(shiftToUpdate.getShiftDate(), targetDate) &&
                Objects.equals(getPeriodKey(shiftToUpdate.getPeriod()), requestedPeriodKey);

        if (!isSameLogicalSlot && hasSlotConflict(targetDate, requestedPeriodKey, shiftToUpdate.getShiftId())) {
            throw new RuntimeException("Trùng lịch: Ca trực ngày " + targetDate + " đã có người trực.");
        }

        shiftToUpdate.setShiftDate(targetDate);
        shiftToUpdate.setPeriod(toCanonicalPeriod(requestedPeriodKey));
        shiftToUpdate.setNote(request.getNote());

        Set<Integer> requestRoomIds = request.getAssignments().stream()
                .map(ShiftRequestDTO.RoomAssignmentDTO::getRoomId)
                .collect(Collectors.toSet());

        if (shiftToUpdate.getShiftRooms() != null) {
            shiftToUpdate.getShiftRooms().removeIf(
                    shiftRoom -> !requestRoomIds.contains(shiftRoom.getRoom().getRoomId())
            );
        } else {
            shiftToUpdate.setShiftRooms(new LinkedHashSet<>());
        }

        for (ShiftRequestDTO.RoomAssignmentDTO assignmentDTO : request.getAssignments()) {
            Room room = roomRepository.findById(assignmentDTO.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));

            ShiftRoom shiftRoom = shiftToUpdate.getShiftRooms().stream()
                    .filter(currentRoom -> currentRoom.getRoom().getRoomId() == assignmentDTO.getRoomId())
                    .findFirst()
                    .orElse(null);

            if (shiftRoom == null) {
                shiftRoom = new ShiftRoom();
                shiftRoom.setShift(shiftToUpdate);
                shiftRoom.setRoom(room);
                shiftRoom.setShiftRoomDoctors(new LinkedHashSet<>());
                shiftToUpdate.getShiftRooms().add(shiftRoom);
            }

            Set<Integer> requestDoctorIds = new HashSet<>(assignmentDTO.getDoctorIds());
            shiftRoom.getShiftRoomDoctors().removeIf(
                    shiftRoomDoctor -> !requestDoctorIds.contains(shiftRoomDoctor.getDoctor().getDoctorId())
            );

            Set<Integer> existingDoctorIds = shiftRoom.getShiftRoomDoctors().stream()
                    .map(shiftRoomDoctor -> shiftRoomDoctor.getDoctor().getDoctorId())
                    .collect(Collectors.toSet());

            for (Integer doctorId : requestDoctorIds) {
                if (existingDoctorIds.contains(doctorId)) continue;
                Doctor doctor = doctorRepository.findByDoctorId(doctorId).orElseThrow();
                ShiftRoomDoctor shiftRoomDoctor = new ShiftRoomDoctor();
                shiftRoomDoctor.setShiftRoom(shiftRoom);
                shiftRoomDoctor.setDoctor(doctor);
                shiftRoom.getShiftRoomDoctors().add(shiftRoomDoctor);
            }
        }
    }



    @Override
    @Transactional
    public void deleteShift(int id, boolean deleteFuture) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca trực với ID: " + id));

        if (deleteFuture && shift.getRecurringGroupId() != null) {
            shiftRepository.deleteByRecurringGroupIdAndShiftDateGreaterThanEqual(
                    shift.getRecurringGroupId(),
                    shift.getShiftDate()
            );
        } else {
            shiftRepository.delete(shift);
        }
    }

    private void ensureNoSlotConflict(LocalDate shiftDate, String periodKey, Integer excludedShiftId) {
        if (hasSlotConflict(shiftDate, periodKey, excludedShiftId)) {
            throw new RuntimeException("Ca trực này đã tồn tại cho ngày và buổi được chọn");
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
