package com.project.clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShiftResponseDTO {
    private int shiftId;
    private LocalDate shiftDate;
    private String period;
    private String note;
    private String periodDisplay;
    private List<RoomDetailDTO> rooms;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomDetailDTO {
        private int roomId;
        private String roomName;
        private List<DoctorBasicDTO> doctors;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorBasicDTO {
        private int doctorId;
        private String doctorName;
        private String avatarUrl;
    }
}
