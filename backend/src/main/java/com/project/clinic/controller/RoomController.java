package com.project.clinic.controller;

import com.project.clinic.dto.RoomOptionDTO;
import com.project.clinic.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}