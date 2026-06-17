export default function InvoiceGroupsSection({
  sortedGroups,
  selectedGroup,
  setSelectedGroup,
}) {
  return (
    <div
      style={{
        height: "110px",
        background: "#99CCFF",
        marginBottom: "8px",
        padding: "6px",
        direction: "rtl",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          gap: "6px",
          height: "100%",
        }}
      >
        {sortedGroups.map((g) => {
          const disabled = !g.is_active || !g.name?.trim();

          return (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g)}
              disabled={disabled}
              onMouseEnter={(e) => {
                if (disabled) return;

                e.currentTarget.style.transform = "scale(1.06)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.25)";

                if (selectedGroup?.id !== g.id) {
                  e.currentTarget.style.background = "#dbeafe";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  selectedGroup?.id === g.id
                    ? "scale(1.05)"
                    : "scale(1)";

                e.currentTarget.style.boxShadow =
                  selectedGroup?.id === g.id
                    ? "0 4px 10px rgba(37,99,235,0.4)"
                    : "none";

                e.currentTarget.style.background =
                  selectedGroup?.id === g.id
                    ? "#2563eb"
                    : disabled
                    ? "#e5e7eb"
                    : "#ffffff";
              }}
              style={{
                height: "30px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "16px",
                fontWeight: "700",
                transition: "all 0.2s ease",
                cursor: disabled ? "not-allowed" : "pointer",
                background:
                  selectedGroup?.id === g.id
                    ? "#2563eb"
                    : disabled
                    ? "#e5e7eb"
                    : "#ffffff",
                color:
                  selectedGroup?.id === g.id
                    ? "#fff"
                    : disabled
                    ? "#9ca3af"
                    : "#111827",
                boxShadow:
                  selectedGroup?.id === g.id
                    ? "0 4px 10px rgba(37,99,235,0.4)"
                    : "none",
                transform:
                  selectedGroup?.id === g.id
                    ? "scale(1.05)"
                    : "scale(1)",
              }}
            >
              {g.name || ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}