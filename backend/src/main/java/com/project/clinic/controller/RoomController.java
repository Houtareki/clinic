package com.project.clinic.controller;

import com.project.clinic.dto.RoomOptionDTO;
import com.project.clinic.dto.RoomResponseDTO;
import com.project.clinic.entity.Room;
import com.project.clinic.mapper.RoomMapper;
import com.project.clinic.service.RoomService;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ResponseEntity<List<RoomOptionDTO>> getRooms() {
        List<RoomOptionDTO> rooms = roomService.getAllRoomOptions();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/admin")
    public ResponseEntity<Page<RoomResponseDTO>> getRoomsList(
        @RequestParam(value="keyword", defaultValue="") String keyword,
        @RequestParam(value="page", defaultValue="0") int page,
        @RequestParam(value="size", defaultValue="10") int size)
    {
        Page<Room> rooms = roomService.getRoomsWithPageAndSearch(keyword, page, size);
        Page<RoomResponseDTO> responseDTOs = rooms.map(RoomMapper::toRoomResponseDTO);

        return ResponseEntity.ok(responseDTOs);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> addRoom(@RequestBody Room room){
        Room newRoom = new Room();
        newRoom.setName(room.getName());
        newRoom.setRoomType(room.getRoomType());
        newRoom.setCapacity(room.getCapacity());
        newRoom.setDepartment(room.getDepartment());
        newRoom.setActive(true);
        newRoom.setCreateAt(LocalDateTime.now());

        Room savedRoom = roomService.save(newRoom);
        return ResponseEntity.status(HttpStatus.CREATED).body(RoomMapper.toRoomResponseDTO(savedRoom));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateRoom(@PathVariable int id, @RequestBody Room room)
    {
        try {
            Room existingRoom = roomService.findById(id);

            if (room.getName() != null) existingRoom.setName(room.getName());
            if (room.getRoomType() != null) existingRoom.setRoomType(room.getRoomType());
            if (room.getCapacity() > 0) existingRoom.setCapacity(room.getCapacity());
            if (room.getDepartment() != null) existingRoom.setDepartment(room.getDepartment());

            existingRoom.setActive(room.isActive());

            Room updatedRoom = roomService.save(existingRoom);
            return ResponseEntity.ok(RoomMapper.toRoomResponseDTO(updatedRoom));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy phòng");
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public  ResponseEntity<?> deleteRoom(@PathVariable int id){
        try {
            Room existingRoom = roomService.findById(id);
            existingRoom.setActive(false);
            roomService.save(existingRoom);

            return ResponseEntity.ok("Xóa thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy phòng");
        }
    }
}