// Toast notification component - Shared utility
export const createToastStyle = (type = "success") => ({
  position: "fixed",
  bottom: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  background: type === "error" ? "#ef4444" : type === "warning" ? "#f59e0b" : "#22c55e",
  color: "white",
  padding: "12px 20px",
  borderRadius: "8px",
  zIndex: 99999,
  fontWeight: "700",
  fontSize: "14px",
  minWidth: "200px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  textAlign: "center",
  animation: "slideUp 0.3s ease",
});

// Custom hook for toast notifications
export const useToast = () => {
  const [toast, setToast] = React.useState(null);

  const showToast = React.useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  return { toast, showToast, setToast };
};
