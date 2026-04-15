package com.project.clinic.mapper;

import com.project.clinic.dto.ShiftResponseDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.entity.Shift;
import com.project.clinic.entity.ShiftRoom;
import com.project.clinic.entity.ShiftRoomDoctor;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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
        dto.setPeriodDisplay(
                "afternoon".equals(getPeriodKey(shift.getPeriod()))
                        ? "13:00 - 17:00"
                        : "08:00 - 12:00"
        );

        List<ShiftResponseDTO.RoomDetailDTO> roomDTOs = new ArrayList<>();

        for (ShiftRoom sr : shift.getShiftRooms()) {
            boolean isDoctorInRoom = false;
            List<ShiftResponseDTO.DoctorBasicDTO> doctorDTOs = new ArrayList<>();

            for (ShiftRoomDoctor srd : sr.getShiftRoomDoctors()) {
                var doctor = srd.getDoctor();
                Account doctorAccount = doctor.getAccount();
                doctorDTOs.add(new ShiftResponseDTO.DoctorBasicDTO(
                        doctor.getDoctorId(),
                        doctorAccount.getFullName(),
                        doctorAccount.getAvatarUrl()
                ));

                if (userRole == Account.Role.DOCTOR && doctorAccount.getId() == userId) {
                    isDoctorInRoom = true;
                }
            }

            if (userRole == Account.Role.RECEPTIONIST || (userRole == Account.Role.DOCTOR && isDoctorInRoom)) {
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
        if (shifts == null) return new ArrayList<>();

        return shifts.stream()
                .map(shift -> toShiftResponse(shift, userRole, userId))
                .filter(dto -> dto.getRooms() != null && !dto.getRooms().isEmpty())
                .collect(Collectors.toList());
    }

    private static String getPeriodKey(String period) {
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
