// Shared button styles
export const buttonStyles = {
  primary: {
    background: "#2563eb",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.15s ease",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
  },
  secondary: {
    background: "#e5e7eb",
    color: "#111827",
    padding: "8px 16px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.15s ease",
  },
  danger: {
    background: "#ef4444",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.15s ease",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
  },
  success: {
    background: "#22c55e",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.15s ease",
    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
  },
};

export const getButtonStyle = (isActive, isHovered, type = "primary") => {
  const base = buttonStyles[type];
  return {
    ...base,
    opacity: isActive ? 1 : 0.6,
    transform: isHovered && isActive ? "translateY(-2px)" : "translateY(0)",
    boxShadow: isHovered && isActive ? `0 8px 20px ${type === "primary" ? "rgba(37, 99, 235, 0.3)" : "rgba(0,0,0,0.15)"}` : base.boxShadow,
  };
};
