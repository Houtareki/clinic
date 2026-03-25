package com.project.clinic.controller;

import com.project.clinic.dto.ShiftRequestDTO;
import com.project.clinic.dto.ShiftResponseDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.entity.Shift;
import com.project.clinic.mapper.ShiftMapper;
import com.project.clinic.service.ShiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/shifts")
public class ShiftController {
    private final ShiftService shiftService;

    @Autowired
    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @GetMapping
    public ResponseEntity<List<ShiftResponseDTO>> getShifts(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                                            @RequestHeader("X-User-Role") String roleStr,
                                                            @RequestHeader("X-User-Id") int userId) {
        Account.Role role;
        try {
            role = Account.Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        List<Shift> shifts;
        if (role == Account.Role.RECEPTIONIST) {
            shifts = shiftService.findShiftsBetween(startDate, endDate);
        } else if (role == Account.Role.DOCTOR) {
            shifts = shiftService.findShiftsByDoctorBetween(userId, startDate, endDate);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(ShiftMapper.toShiftResponseList(shifts, role, userId));
    }

    @PostMapping
    public ResponseEntity<?> createShift(
            @RequestBody ShiftRequestDTO request,
            @RequestHeader("X-User-Role") String roleStr) {

        Account.Role role;
        try {
            role = Account.Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        if (role != Account.Role.RECEPTIONIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Chỉ Lễ tân mới có quyền xếp lịch");
        }

        try {
            Shift createdShift = shiftService.createShift(request);
            return ResponseEntity.status(HttpStatus.CREATED).body("Tạo ca trực thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi tạo ca trực: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateShift(
            @PathVariable int id,
            @RequestBody ShiftRequestDTO request,
            @RequestHeader("X-User-Role") String roleStr) {

        Account.Role role;
        try {
            role = Account.Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        if (role != Account.Role.RECEPTIONIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Chỉ Lễ tân mới có quyền sửa lịch");
        }

        try {
            Shift updatedShift = shiftService.updateShift(id, request);
            return ResponseEntity.ok("Cập nhật ca trực thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
