package com.project.clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RoomResponseDTO {
    private int roomId;
    private String name;
    private String department;
    private String roomType;
    private int capacity;
    private boolean isActive;
    private String createdAt;
}
