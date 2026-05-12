package com.project.clinic.service;

import com.project.clinic.dto.RoomOptionDTO;
import com.project.clinic.entity.Room;
import com.project.clinic.repository.RoomRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
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

    @Override
    public Room findById(int id) {
        Optional<Room> result = roomRepository.findById(id);
        Room theRoom;
        
        if (result.isPresent()){
            theRoom = result.get();
        }else{
            throw new RuntimeException("Room not found with id: " + id);
        }

        return theRoom;
    }

    @Override
    public Room save(Room room) {
        return roomRepository.save(room);
    }

    @Override
    public void delete(int id) {
        roomRepository.deleteById(id);
    }

    @Override
    public Page<Room> getRoomsWithPageAndSearch(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "roomId"));

        if (keyword != null && !keyword.trim().isEmpty()){
            return roomRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(keyword, pageable);
        }

        return roomRepository.findAll(pageable);
    }
}