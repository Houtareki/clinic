package com.project.clinic.service;

import com.project.clinic.dto.RoomOptionDTO;
import com.project.clinic.entity.Room;

import java.util.List;

import org.springframework.data.domain.Page;

public interface RoomService {
    List<RoomOptionDTO> getAllRoomOptions();

    Room findById(int id);

    Room save(Room room);

    void delete(int id);

    Page<Room> getRoomsWithPageAndSearch(String keyword, int page, int size);
}