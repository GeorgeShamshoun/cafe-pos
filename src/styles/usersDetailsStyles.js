const usersDetailsStyles = {
  card: {
    flex: 1,
    background: "#fff",
    padding: "10px",
    borderRadius: "6px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  inputsRow: {
    display: "flex",
    gap: "6px",
  },

  inputWrapper: {
    flex: 1,
    position: "relative",
    display: "flex",
  },

  inputLabel: {
    position: "absolute",
    top: "-7px",
    left: "10px",
    background: "#fff",
    padding: "0 4px",
    fontSize: "11px",
    color: "#6b7280",
    zIndex: 2,
    fontWeight: "bold",
  },

  input: {
    flex: 1,
    height: "34px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    textAlign: "center",
    fontSize: "15px",
    fontWeight: "550",
  },

  passwordWrapper: {
    flex: 1,
    minWidth: 0,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  passwordInput: {
    width: "100%",
    height: "34px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    textAlign: "center",
    fontSize: "15px",
    fontWeight: "550",
    paddingRight: "35px",
    boxSizing: "border-box",
  },

  eyeBtn: {
    position: "absolute",
    right: "5px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "16px",
    color: "#9ca3af",
     boxShadow: "none",
  },

  permissionsWrapper: {
    display: "flex",
    gap: "70px",
    alignItems: "stretch",
  },

  permissionsCard: {
    flex: 1,
    background: "white",
    borderRadius: "6px",
    border: "1px solid #ddd",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  permissionsTitle: {
    background: "#e5e7eb",
    padding: "8px",
    textAlign: "center",
    fontWeight: "bold",
  },

  permissionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    padding: "8px",
    maxHeight: "420px",
    overflowY: "auto",
  },

  permissionBtn: {
    background: "#fee2e2",
    borderRadius: "6px",
    padding: "8px",
    cursor: "pointer",
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "550",
    transition: "0.5s",
  },

  saveBtn: {
  width: "180px",
  height: "30px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  alignSelf: "center",
  fontWeight: "bold",
  fontSize: "16px",
  boxShadow: "0 8px 18px rgba(37, 99, 235, 0.2)",

  },
};

export default usersDetailsStyles;
