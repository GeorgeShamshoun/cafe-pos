const appStyles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#eef2ff,#f8fafc)",
  },

  loginCard: {
    width: "340px",
    background: "white",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  },

  logoWrapper: {
    marginBottom: "10px",
    marginTop: "20px",
  },

  logo: {
    borderRadius: "10%",
  },

  title: {
    fontSize: "22px",
    fontWeight: "800",
    marginBottom: "30px",
  },

  inputWrapper: {
    position: "relative",
    marginBottom: "15px",
  },

  passwordWrapper: {
    position: "relative",
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 40px 12px 12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    outline: "none",
  },

  clearBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#888",
  },

  eyeBtn: {
    position: "absolute",
    right: "35px",
    top: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    color: "#555",
  },

  loginBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },

  footerText: {
    fontSize: "12px",
    color: "#aaa",
    marginTop: "20px",
  },
};

export default appStyles;
