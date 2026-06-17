export default function MessageModal({
  open,
  title = "تنبيه",
  message,
  type = "info",
  onClose,
}) {
  if (!open) return null;

  const typeStyle = {
    success: {
      color: "#16a34a",
      icon: "✓",
    },
    error: {
      color: "#dc2626",
      icon: "!",
    },
    warning: {
      color: "#d97706",
      icon: "!",
    },
    info: {
      color: "#2563eb",
      icon: "i",
    },
  };

  const currentType = typeStyle[type] || typeStyle.info;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div
          style={{
            ...styles.icon,
            background: currentType.color,
          }}
        >
          {currentType.icon}
        </div>

        <h3 style={styles.title}>{title}</h3>

        <div style={styles.message}>{message}</div>

        <button onClick={onClose} style={styles.button}>
          تمام
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  modal: {
    width: "320px",
    background: "white",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  icon: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px",
    fontSize: "22px",
    fontWeight: "bold",
  },

  title: {
    margin: "8px 0",
    fontSize: "20px",
    fontWeight: "800",
  },

  message: {
    fontSize: "16px",
    color: "#374151",
    marginBottom: "18px",
    lineHeight: "1.6",
  },

  button: {
    width: "100%",
    height: "38px",
    borderRadius: "6px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
};
