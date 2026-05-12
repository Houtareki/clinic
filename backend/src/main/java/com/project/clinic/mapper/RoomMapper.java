package com.project.clinic.mapper;

import com.project.clinic.entity.Room;
import org.springframework.stereotype.Component;

import com.project.clinic.dto.RoomResponseDTO;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class RoomMapper {
    public static RoomResponseDTO toRoomResponseDTO(Room room){
        if (room == null)
            return null;

        RoomResponseDTO dto = new RoomResponseDTO();
        dto.setRoomId(room.getRoomId());
        dto.setName(room.getName());
        dto.setDepartment(room.getDepartment());

        if (room.getRoomType() != null)
            dto.setRoomType(room.getRoomType());
        else
            dto.setRoomType("N/A");

        dto.setCapacity(room.getCapacity());
        dto.setActive(room.isActive());

        if (room.getCreateAt() != null)
            dto.setCreatedAt(room.getCreateAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        else
            dto.setCreatedAt("N/A");
        
        return dto;
    }

    public static List<RoomResponseDTO> toRoomList(List<Room> rooms){
        return rooms.stream()
                .map(RoomMapper::toRoomResponseDTO)
                .collect(Collectors.toList());
    }
}
