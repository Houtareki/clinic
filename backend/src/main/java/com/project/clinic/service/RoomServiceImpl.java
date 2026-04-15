package com.project.clinic.service;

import com.project.clinic.dto.RoomOptionDTO;
import com.project.clinic.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;

    public RoomServiceImpl(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Override
    public List<RoomOptionDTO> getAllRoomOptions() {
        return roomRepository.findAll().stream()
                .map(room -> new RoomOptionDTO(room.getRoomId(), room.getName()))
                .collect(Collectors.toList());
    }
}