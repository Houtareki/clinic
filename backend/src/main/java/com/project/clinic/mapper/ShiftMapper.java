package com.project.clinic.mapper;

import com.project.clinic.dto.ShiftResponseDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.entity.Shift;
import com.project.clinic.entity.ShiftRoom;
import com.project.clinic.entity.ShiftRoomDoctor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ShiftMapper {

    public static ShiftResponseDTO toShiftResponse(Shift shift, Account.Role userRole, int userId) {
        if (shift == null) return null;

        ShiftResponseDTO dto = new ShiftResponseDTO();
        dto.setShiftId(shift.getShiftId());
        dto.setShiftDate(shift.getShiftDate());
        dto.setPeriod(shift.getPeriod());
        dto.setNote(shift.getNote());

        if ("Sáng".equalsIgnoreCase(shift.getPeriod())) {
            dto.setPeriodDisplay("08:00 - 12:00");
        } else if ("Chiều".equalsIgnoreCase(shift.getPeriod())) {
            dto.setPeriodDisplay("13:00 - 17:00");
        } else {
            dto.setPeriodDisplay(shift.getPeriod());
        }

        List<ShiftResponseDTO.RoomDetailDTO> roomDTOs = new ArrayList<>();

        for (ShiftRoom sr : shift.getShiftRooms()) {
            boolean isDoctorInRoom = false;
            List<ShiftResponseDTO.DoctorBasicDTO> doctorDTOs = new ArrayList<>();

            for (ShiftRoomDoctor srd : sr.getShiftRoomDoctors()) {
                Account doctor = srd.getDoctorAccount();
                doctorDTOs.add(new ShiftResponseDTO.DoctorBasicDTO(
                        doctor.getId(),
                        doctor.getFullName(),
                        doctor.getAvatarUrl()
                ));

                if (userRole == Account.Role.DOCTOR && doctor.getId() == userId) {
                    isDoctorInRoom = true;
                }
            }
            if (userRole == Account.Role.DOCTOR && isDoctorInRoom) {
                ShiftResponseDTO.RoomDetailDTO roomDto = new ShiftResponseDTO.RoomDetailDTO();
                roomDto.setRoomId(sr.getRoom().getRoomId());
                roomDto.setRoomName(sr.getRoom().getName());
                roomDto.setDoctors(doctorDTOs);
                roomDTOs.add(roomDto);
            }
        }
        dto.setRooms(roomDTOs);
        return dto;
    }

    public static List<ShiftResponseDTO> toShiftResponseList(List<Shift> shifts, Account.Role userRole, int userId) {
        return shifts.stream()
                .map(shift -> toShiftResponse(shift, userRole, userId))
                // Bỏ qua các ca trực mà sau khi lọc xong không còn phòng nào
                .filter(dto -> dto.getRooms() != null && !dto.getRooms().isEmpty())
                .collect(Collectors.toList());
    }
}
