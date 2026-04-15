import { STAFF_FILTER_OPTIONS } from "../staffUtils";

function StaffFilterTabs({ filterRole, onChange }) {
  const getFilterBtnClass = (role) =>
    `btn rounded-pill px-4 shadow-sm ${
      filterRole === role ? "btn-success" : "btn-outline-secondary"
    }`;

  return (
    <div
      className="d-flex gap-2 mb-4 overflow-auto pb-2"
      style={{ whiteSpace: "nowrap" }}
    >
      {STAFF_FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={getFilterBtnClass(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default StaffFilterTabs;