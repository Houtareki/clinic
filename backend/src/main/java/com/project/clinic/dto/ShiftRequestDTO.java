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
public class ShiftRequestDTO {

    private LocalDate shiftDate;
    private String period;
    private String note;
    private List<RoomAssignmentDTO> assignments;

    @Getter
    @Setter
    public static class RoomAssignmentDTO {
        private int roomId;
        private List<Integer> doctorIds;
    }
}
