package com.project.clinic.service;

import com.project.clinic.dto.RoomOptionDTO;
import java.util.List;

public interface RoomService {
    List<RoomOptionDTO> getAllRoomOptions();
}