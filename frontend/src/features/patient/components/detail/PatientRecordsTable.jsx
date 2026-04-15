import { getStatusClassName, splitDateTime } from "../../utils/patientDetailUtils";

function PatientRecordsTable({
  records,
  canManageRecords,
  canEditAppointments,
  openRecordDropdownId,
  onToggleDropdown,
  onEditAppointment,
  onEditRecord,
  onDeleteRecord,
}) {
  const canShowActions = canManageRecords || canEditAppointments;

  return (
    <div className="detail-card mb-4 p-0">
      <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
        <h5 className="fw-bold text-dark mb-0">Lịch sử khám bệnh</h5>
      </div>

      <div className="p-0 table-responsive" style={{ overflow: "visible" }}>
        <table className="table table-custom table-hover mb-0">
          <thead>
            <tr>
              <th style={{ width: "25%", paddingLeft: "24px" }}>Ngày khám</th>
              <th style={{ width: "25%" }}>Bác sĩ phụ trách</th>
              <th style={{ width: "30%" }}>Chẩn đoán</th>
              <th style={{ width: "15%", textAlign: "center" }}>Trạng thái</th>
              {canShowActions && <th style={{ width: "5%", textAlign: "center" }}></th>}
            </tr>
          </thead>

          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={canShowActions ? 5 : 4} className="text-center text-muted py-4">
                  Chưa có lịch sử khám bệnh.
                </td>
              </tr>
            )}

            {records.map((record) => {
              const { date, time } = splitDateTime(record.examinedAt || record.createdAt);

              return (
                <tr key={record.recordId}>
                  <td style={{ paddingLeft: "24px" }}>
                    <div className="fw-bold">{date}</div>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {time}
                    </div>
                  </td>

                  <td>
                    <div className="d-flex align-items-center">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          record.doctorName || "Doctor",
                        )}&background=random`}
                        className="rounded-circle me-2"
                        width="32"
                        height="32"
                        alt={record.doctorName}
                      />
                      <div>
                        <div className="fw-bold text-dark" style={{ fontSize: "0.85rem" }}>
                          {record.doctorName || "Chưa cập nhật"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="text-muted fst-italic">
                    {record.diagnosis || record.symptoms || "Chưa có chẩn đoán"}
                  </td>

                  <td className="text-center">
                    <span className={getStatusClassName(record.status)}>
                      {record.status || "Chưa cập nhật"}
                    </span>
                  </td>

                  {canShowActions && (
                    <td className="text-center">
                      <div className="dropdown" data-record-dropdown-root>
                        <button
                          className="action-btn dropdown-toggle dropdown-toggle-no-caret"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onToggleDropdown(record.recordId);
                          }}
                        >
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>

                        <ul
                          className={`dropdown-menu dropdown-menu-end shadow-sm border-0 ${
                            openRecordDropdownId === record.recordId ? "show" : ""
                          }`}
                        >
                          {canEditAppointments ? (
                            <li>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => onEditAppointment(record)}
                              >
                                <i className="fa-regular fa-pen-to-square me-2"></i>
                                Sửa
                              </button>
                            </li>
                          ) : (
                            <>
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item"
                                  onClick={() => onEditRecord(record)}
                                >
                                  <i className="fa-solid fa-stethoscope me-2"></i>
                                  Cập nhật
                                </button>
                              </li>
                              <li>
                                <hr className="dropdown-divider" />
                              </li>
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item text-danger"
                                  onClick={() => onDeleteRecord(record)}
                                >
                                  <i className="fa-regular fa-trash-can me-2"></i>
                                  Xóa
                                </button>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PatientRecordsTable;
