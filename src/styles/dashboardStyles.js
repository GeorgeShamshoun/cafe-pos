export const subMenuBtn = (active) => ({
  ...subBtn,
  background: active ? "#2563eb" : "#eef2ff",
  border: active ? "1px solid #2563eb" : "1px solid #c7d2fe",
  color: active ? "white" : "#1e3a8a",
  boxShadow: active ? "0 8px 18px rgba(37, 99, 235, 0.2)" : "none",
});


export const styles = {
  container: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "Arial",
  },

sidebar: {
  width: "260px",
  background: "#111827",
  color: "white",
  padding: "18px",
  display: "flex",
  flexDirection: "column",
 fontSize: "24px",
},

cafeName: {
  fontSize: "20px",
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: "22px",
  padding: "12px 10px",
  borderBottom: "1px solid #374151",
  color: "#f9fafb",
  letterSpacing: "0px",
},

content: {
  flex: 1,
  background: "#f6f7f9",
  padding: "6px 22px 22px 22px", // قللنا الـ top padding
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  alignContent: "flex-start",
  overflow: "auto",
},

bottomSection: {
  marginTop: "auto",
},

footerCard: {
  width: "100%",
  background: "#0b1220",
  padding: "12px",
  borderRadius: "10px",
  textAlign: "center",
  border: "1px solid #1f2937",
  overflow: "hidden",
  boxSizing: "border-box",
    gap: "12px",
      flexDirection: "column",
        display: "flex",
},

shiftCard: {
  background: "#1e1e1e",
  borderRadius: "14px",
  padding: "14px",
  marginBottom: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
},

footerImageBox: {
  width: "100%",
  maxWidth: "205px",
  height: "100px",
  margin: "0 auto 8px",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "5px",
  marginBottom: "10px",
},

footerImage: {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "contain",
},


footerText: {
  fontSize: "12px",
  color: "#9ca3af",
  lineHeight: "1.4",
},


logoutBtn: {
  width: "100%",
  marginTop: "10px",
  padding: "11px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
  boxShadow: "0 8px 18px rgba(37, 99, 235, 0.2)",
},


shiftDateRow: {
  display: "flex",
},

shiftDateGroup: {
  display: "flex",
  alignItems: "center",
  borderRadius: "10px",
  overflow: "hidden",
  border: "1px solid #444",
  background: "#2b2b2b",
},

shiftDateInput: {
  flex: 1,
  height: "34px",
  borderRadius: "10px",
  border: "1px solid #444",
  background: "#2b2b2b",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "700",
  textAlign: "center",
  padding: "0 10px",
  boxSizing: "border-box",
},

shiftBtnsRow: {
  display: "flex",
  gap: "10px",
},

shiftBtn: {
  flex: 1,
  height: "30px",
  padding: "0",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  background: "#333",
  color: "#fff",
  fontWeight: "700",
  fontSize: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},

shiftBtnActive: {
  background: "#16a34a",
  color: "#fff",
},

shiftSaveBtn: {
  width: "100%",
  height: "30px",
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
  boxShadow: "0 8px 18px rgba(37, 99, 235, 0.2)",
},

shiftDateBtn: {
  width: "46px",
  height: "44px",
  border: "none",
  cursor: "pointer",
  background: "#374151",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
},

shiftHeader: {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
},

shiftTitle: {
  fontSize: "18px",
  fontWeight: "700",
  color: "#2563eb",
  marginBottom: "4px",
},

shiftDateText: {
  fontSize: "15px",
  fontWeight: "600",
  color: "#374151",
},

headerCard: {
  width: "100%",
  height: "40px",
  display: "flex",
  alignItems: "center",
  padding: "20px 40px ",
  margin: "0px",
  background: "linear-gradient(180deg, #111827 0%, #0b1220 100%)",
  border: "1px solid #111827",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  color: "#f3f4f6",
  borderB: "1px solid #1f2937",
},

left: {
  flex: 1,
  textAlign: "left",
  fontSize: "16px",
  fontWeight: "800",

},

center: {
  flex: 2,
  textAlign: "center",
  fontSize: "22px",
  fontWeight: "800",

},

right: {
  flex: 1,
  textAlign: "right",
  fontSize: "18px",
  fontWeight: "800",

},

fixedInfoBox: {
  cursor: "pointer",
  position: "fixed",
  bottom: "10px",
  left: "270px",
  background: "#fff",
  padding: "18px 20px",
  borderRadius: "14px",
  alignItems: "center",   // 👉 ده اللي بيوسط الكلام
  zIndex: 9999,
  minWidth: "180px",
  fontSize: "16px",
  lineHeight: "1.6",
  boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
},

shiftSaveBtnDisabled: {
  background: "#a8b4c5",
  color: "#ffffff",
  cursor: "not-allowed",
  opacity: 0.5,
}
};

export const btn = (active) => ({
  width: "100%",
  padding: "11px 12px",
  marginBottom: "10px",
  background: active ? "#2563eb" : "rgba(255,255,255,0.08)",
  color: "white",
  border: active ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.08)",
  cursor: "pointer",
  borderRadius: "8px",
  fontSize: "18px",
  fontWeight: active ? "700" : "600",
  textAlign: "right",
  boxShadow: active ? "0 8px 18px rgba(37, 99, 235, 0.22)" : "none",
});


export const card = {
  background: "white",
  padding: "12px",
  borderRadius: "10px",
  width: "240px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
  alignSelf: "flex-start",
  marginLeft: "10px",
};


export const groupsWrapper = {
  display: "flex",
  gap: "20px",
  alignItems: "flex-start",
  flexWrap: "nowrap",
};

export const groupsCard = {
  background: "white",
  padding: "15px",
  borderRadius: "10px",
  width: "340px",
  height: "89vh",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
};

export const itemsCard = {
  background: "white",
  padding: "15px",
  borderRadius: "10px",
  width: "480px",
  height: "89vh",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
};

export const tablesCard = {
  background: "white",
  padding: "15px",
  borderRadius: "10px",
  width: "520px",
  height: "89vh",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
};

export const usersCard = {
  background: "white",
  padding: "15px",
  borderRadius: "10px",
  width: "270px",
   height: "89vh",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
};

export const userDetailsCard = {
  background: "white",
  padding: "15px",
  borderRadius: "10px",
  width: "620px",
  height: "89vh",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
};

export const settingCard = {
  background: "white",
  padding: "15px",
  borderRadius: "10px",
  width: "520px",
  height: "60vh",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
};


export const emptyCard = {
  ...itemsCard,
  opacity: 0.4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const subBtn = {
  width: "100%",
  padding: "10px",
  marginTop: "8px",
  background: "#eef2ff",
  border: "1px solid #c7d2fe",
  color: "#1e3a8a",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "18px",
  fontWeight: "700",
};

export const cardTitle = {
  fontSize: "20px",
  fontWeight: "700",
  marginBottom: "10px",
};
