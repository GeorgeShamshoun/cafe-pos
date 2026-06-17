const usersStyles = {
  container: {
    width: "100%",
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
  },

  row: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
 
  addCard: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    width: "100%",
    marginBottom: "10px",
  },

  input: {
    width: "100%",
    height: "34px",
    borderRadius: "7px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    textAlign: "center",
    fontSize: "15px",
    fontWeight: "550",
    boxSizing: "border-box",
    color: "#111827",
  },

  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  userBtn: {
    flex: 1,
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 9px",
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
  },

  left: {
    width: "270px",
    background: "#fff",
    borderRadius: "8px",
    padding: "8px 0px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    boxSizing: "border-box",
  },

  inputWrapper: {
    position: "relative",
    width: "100%",
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

  addInputWrapper: {
    flex: 1,
    position: "relative",
  },
};

export default usersStyles;
