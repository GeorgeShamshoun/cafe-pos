const groupsStyles = {
  container: {
    width: "95%",
    background: "#ffffff",
    padding: "6px",
    borderRight: "1px solid #e5e7eb",
    maxHeight: "90vh",
    overflowY: "auto",
    overflowX: "hidden",
  },

groupRow: {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  marginBottom: "7px",
  width: "100%",
},

  groupItem: {
    flex: 1,
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "16px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    
    border: "1px solid transparent",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  },

  editInput: {
    flex: 1,
    height: "34px",
    padding: "6px",
    borderRadius: "7px",
    border: "1px solid #cbd5e1",
    textAlign: "center",
    boxSizing: "border-box",
    minWidth: 0,
    fontSize: "16px",
    fontWeight: "550",
    background: "#ffffff",
  },
};

export default groupsStyles;
