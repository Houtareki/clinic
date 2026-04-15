import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getDoctorOptionId,
  getDoctorOptionName,
  getDoctorSummary,
  normalizeShiftText,
} from "../../utils/shiftManagementUtils";

function DoctorMultiSelect({
  doctorOptions,
  doctorLookup,
  selectedDoctorIds,
  disabled = false,
  onToggleDoctor,
}) {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const doctorSummary = useMemo(
    () => getDoctorSummary(selectedDoctorIds, doctorLookup),
    [doctorLookup, selectedDoctorIds],
  );
  const filteredDoctorOptions = useMemo(() => {
    const normalizedQuery = normalizeShiftText(searchQuery);

    return doctorOptions.filter((doctor) => {
      if (!normalizedQuery) {
        return true;
      }

      return normalizeShiftText(
        `${getDoctorOptionName(doctor)} ${doctor?.specialty || ""}`,
      ).includes(normalizedQuery);
    });
  }, [doctorOptions, searchQuery]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  const toggleOpen = () => {
    if (disabled) {
      return;
    }

    setIsOpen((currentValue) => !currentValue);
    if (isOpen) {
      setSearchQuery("");
    }
  };

  return (
    <div ref={containerRef} className="doctor-select">
      <button
        type="button"
        className="doctor-select-trigger custom-input"
        onClick={toggleOpen}
        disabled={disabled}
        title={doctorSummary}
      >
        <span
          className={`doctor-select-trigger-text ${
            selectedDoctorIds.length > 0 ? "has-value" : ""
          }`}
        >
          {doctorSummary}
        </span>
        <i
          className={`fa-solid ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`}
        ></i>
      </button>

      {isOpen && !disabled && (
        <div className="doctor-select-menu shadow-sm">
          <div className="position-relative">
            <i
              className="fa-solid fa-magnifying-glass text-muted position-absolute top-50 translate-middle-y"
              style={{ left: "14px" }}
            ></i>
            <input
              type="text"
              className="form-control custom-input doctor-select-search-input"
              placeholder="Tìm bác sĩ theo tên..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              autoFocus
            />
          </div>

          <div className="doctor-select-options">
            {filteredDoctorOptions.length === 0 ? (
              <div className="doctor-select-empty">Không có bác sĩ phù hợp.</div>
            ) : (
              filteredDoctorOptions.map((doctor) => {
                const doctorId = getDoctorOptionId(doctor);

                if (!Number.isFinite(doctorId)) {
                  return null;
                }

                const isChecked = selectedDoctorIds.includes(doctorId);

                return (
                  <label key={doctorId} className="doctor-select-option">
                    <input
                      type="checkbox"
                      className="form-check-input m-0"
                      checked={isChecked}
                      onChange={() => onToggleDoctor(doctorId)}
                    />
                    <span className="doctor-select-option-text">
                      <span className="doctor-select-option-name">
                        {getDoctorOptionName(doctor) || `Bác sĩ #${doctorId}`}
                      </span>
                      {doctor.specialty ? (
                        <span className="doctor-select-option-meta">
                          {doctor.specialty}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorMultiSelect;
