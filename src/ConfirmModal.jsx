export default function ConfirmModal({
  open,
  title = "تأكيد",
  message = "هل أنت متأكد؟",
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const handleCancel = () => {
    if (loading) return;
    onCancel?.();
  };

  const handleConfirm = () => {
    if (loading) return;
    onConfirm?.();
  };

  return (
    <div style={styles.overlay} onClick={handleCancel}>
      <div style={styles.box} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>{title}</h3>
        <p style={{...styles.message, whiteSpace: "pre-line" }}>{message}</p>

        <div style={styles.actions}>
          <button
            onClick={handleCancel}
            disabled={loading}
            style={{
              ...styles.cancel,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              ...styles.ok,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "جاري التنفيذ..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  title: {
    margin: "0 0 10px",
    fontSize: "20px",
    fontWeight: "800",
    color: "#111827",
  },

  message: {
    margin: 0,
    fontSize: "16px",
    color: "#374151",
    lineHeight: "1.6",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },

  ok: {
    flex: 1,
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },

  cancel: {
    flex: 1,
    background: "#e5e7eb",
    border: "none",
    padding: "8px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },

  box: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    width: "320px",
    textAlign: "center",
    boxShadow: "0 18px 45px rgba(15,23,42,0.22)",
    animation: "modalIn 0.16s ease-out",
  },
};
