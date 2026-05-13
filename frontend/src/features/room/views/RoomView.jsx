import React, { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import "../../../styles/entity-list.css";
import { useAuth } from "../../../context/useAuth";

import RoomCard from "../components/RoomCard";
import RoomFormModal from "../components/RoomFormModal";
import RoomDeleteModal from "../components/RoomDeleteModal";

const RoomView = () => {
  const ROOM_API_BASE_URL = "http://localhost:8080/api/rooms";

  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const canManageRoom = isAdmin;

  const [roomList, setRoomList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("ADD");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    roomType: "",
    department: "",
    capacity: "",
  });

  const fetchRoom = async () => {
    try {
      if (isAdmin) {
        const response = await axios.get(`${ROOM_API_BASE_URL}/admin`, {
          params: { page: 0, size: 10 },
        });

        setRoomList(
          (response.data.content || []).map((room) => ({
            ...room,
            id: room.roomId || null,
            name: room.name || "",
            roomType: room.roomType || "",
            department: room.department || "",
            capacity: room.capacity || 0,
          })),
        );

        return;
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách phòng :", error);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [isAdmin]);

  const filterRoomList = useMemo(() => {
    const normalizedKeyword = keyword.toLowerCase().trim();

    if (!normalizedKeyword) return roomList;

    return roomList.filter((room) =>
      [room.name, room.roomType, room.department]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedKeyword),
        ),
    );
  }, [keyword, roomList]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseFormModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedRoom(null);
  };

  const openAddModal = useCallback(() => {
    if (!canManageRoom) return;

    setModalMode("ADD");
    setSelectedRoom(null);
    setFormData({ name: "", roomType: "", department: "", capacity: "" });
    setShowModal(true);
  }, [canManageRoom]);

  useEffect(() => {
    if (searchParams.get("quickAction") !== "add-room") return;

    const timeoutId = window.setTimeout(() => {
      openAddModal();

      setSearchParams(
        (currentParams) => {
          const newParams = new URLSearchParams(currentParams);
          newParams.delete("quickAction");
          return newParams;
        },
        { replace: true },
      );
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [canManageRoom, openAddModal, searchParams, setSearchParams]);

  const openEditModal = (room) => {
    if (!canManageRoom) return;

    setModalMode("EDIT");
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      roomType: room.roomType,
      department: room.department,
      capacity: room.capacity,
    });
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity, 10) || 0,
      };

      if (modalMode === "ADD") {
        await axios.post(ROOM_API_BASE_URL, payload);
        alert("Thêm phòng thành công");
      } else {
        await axios.put(`${ROOM_API_BASE_URL}/${selectedRoom.roomId}`, payload);
        alert("Cập nhật phòng thành công");
      }

      handleCloseFormModal();
      await fetchRoom();
    } catch (error) {
      console.error("Lỗi khi lưu thông tin phòng:", error);
      alert("Lỗi khi lưu thông tin phòng");
    }
  };

  const handleDelete = async () => {
    if (!canManageRoom) return;

    try {
      await axios.delete(`${ROOM_API_BASE_URL}/${selectedRoom.roomId}`);
      alert("Xóa phòng thành công");
      handleCloseDeleteModal();
      await fetchRoom();
    } catch (error) {
      console.error("Lỗi khi xóa phòng:", error);
      alert("Lỗi khi xóa phòng");
    }
  };

  const handleUnlock = async () => {
    if (!canManageRoom) return;

    try {
      await axios.put(`${ROOM_API_BASE_URL}/${selectedRoom.roomId}/unlock`);
      alert("Khôi phục phòng thành công");
      handleCloseDeleteModal();
      await fetchRoom();
    } catch (error) {
      console.error("Lỗi khi khôi phục phòng:", error);
      alert("Lỗi khi khôi phục phòng");
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="staff-view-header">
        <div className="staff-view-header-main">
          <h4 className="fw-bold staff-view-title">Quản lý phòng</h4>
        </div>

        <div className="staff-view-controls">
          <div className="position-relative staff-view-search">
            <i
              className="fa-solid fa-magnifying-glass text-muted position-absolute top-50 translate-middle-y"
              style={{ left: "14px" }}
            ></i>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Tìm theo tên phòng..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          {canManageRoom && (
            <button
              className="btn btn-success shadow-sm"
              onClick={() => openAddModal()}
            >
              <i className="fa-solid fa-plus me-1"></i> Thêm phòng
            </button>
          )}
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 staff-view-grid">
        {filterRoomList.map((room) => {
          const roomKey = room.id;

          return (
            <RoomCard
              key={roomKey}
              room={room}
              canManageRoom={canManageRoom}
              isDropdownOpen={openDropdownId === room.id}
              onToggleDropdown={() =>
                setOpenDropdownId((currentId) =>
                  currentId === room.id ? null : room.id,
                )
              }
              onEdit={() => {
                setOpenDropdownId(null);
                openEditModal(room);
              }}
              onDelete={() => {
                setOpenDropdownId(null);
                setSelectedRoom(room);
                setShowDeleteModal(true);
              }}
              onUnlock={() => {
                setOpenDropdownId(null);
                setSelectedRoom(room);
                setShowDeleteModal(true);
              }}
            />
          );
        })}
      </div>

      {filterRoomList.length === 0 && (
        <div className="text-center py-5 text-muted">
          Không có phòng phù hợp.
        </div>
      )}

      {canManageRoom && showModal && (
        <RoomFormModal
          mode={modalMode}
          formData={formData}
          onChange={handleInputChange}
          onClose={handleCloseFormModal}
          onSubmit={handleSubmit}
        />
      )}

      {canManageRoom && showDeleteModal && (
        <RoomDeleteModal
          room={selectedRoom}
          onClose={handleCloseDeleteModal}
          onConfirm={() => {
            if (selectedRoom.active) {
              handleDelete();
            } else {
              handleUnlock();
            }
          }}
        />
      )}
    </div>
  );
};

export default RoomView;
