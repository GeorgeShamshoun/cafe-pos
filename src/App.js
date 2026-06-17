import { useCallback, useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import MessageModal from "./MessageModal";
import { EyeClose, EyeOpen } from "./components/icons/PasswordVisibilityIcons";
import { useActiveCafes } from "./data/cafesTable";
import useLoginRealtimeGuards from "./hooks/useLoginRealtimeGuards";
import {getActiveUserByLogin,getAllowedPermissionKeys,getCafeById,} from "./services/authService";
import styles from "./styles/appStyles";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [cafes, setCafes] = useState([]);
  const { rows: liveCafes } = useActiveCafes();
  const [selectedCafeId, setSelectedCafeId] = useState("");
  const [messageModal, setMessageModal] = useState({open: false,title: "",message: "",type: "info",});
  const showMessage = useCallback(({ title = "تنبيه", message, type = "info" }) => {
    setMessageModal({open: true,title,message,type,});}, []);
  const closeMessage = () => {setMessageModal((prev) => ({...prev,open: false,}));};
  const isLoginDisabled =loginLoading ||!selectedCafeId ||!username.trim() ||!password.trim();
  const handleLogout = useCallback(() => {setUser(null);setPermissions([]);setIsLoggedIn(false);
    setPassword("");setUsername("");setShowPassword(false);}, []);

  useLoginRealtimeGuards({ user, handleLogout, showMessage, setPermissions });

  useEffect(() => {
  setCafes(liveCafes || []);
}, [liveCafes]);

useEffect(() => {
  document.querySelector("select")?.focus();
}, []);

useEffect(() => {
  const savedCafe = localStorage.getItem("selectedCafeId");
  if (savedCafe) {
    setSelectedCafeId(savedCafe);
  }
}, []);

  const handleLogin = async () => {
    if (loginLoading) return;

    if (!username.trim() || !password.trim()) {
      showMessage({
        title: "بيانات ناقصة",
        message: "اكتب اسم المستخدم وكلمة المرور.",
        type: "warning",
      });
      return;
    }

    setLoginLoading(true);

    try {
      const { data: userData, error } = await getActiveUserByLogin(selectedCafeId, username.trim(), password)
      if (error || !userData) {
        showMessage({
          title: "فشل تسجيل الدخول",
          message: "بيانات الدخول غير صحيحة.",
          type: "error",
        });
        return;
      }

      if (userData.status !== "active") {
        showMessage({
          title: "المستخدم غير مفعل",
          message: "لا يمكن دخول المستخدم حاليًا.",
          type: "error",
        });
        return;
      }

      const { data: cafe, error: cafeError } = await getCafeById(userData.cafe_id);

      if (cafeError || !cafe?.is_active) {
        showMessage({
          title: "الكافيه موقوف",
          message: "لا يمكن الدخول الكافيه غير مفعل.",
          type: "error",
        });
        return;
      }

      const { data: permissionKeys, error: permissionsError } =
        await getAllowedPermissionKeys(userData.id);

      if (permissionsError) {
        showMessage({
          title: "خطأ في الصلاحيات",
          message: "تعذر تحميل صلاحيات المستخدم.",
          type: "error",
        });
        return;
      }

      if (!permissionKeys.includes("login.web")) {
        showMessage({
          title: "غير مسموح بالدخول",
          message: "المستخدم لا يملك صلاحية الدخول",
          type: "warning",
        });
        return;
      }

      setUser({
        ...userData,
        cafe_name: cafe?.name || "Cafe",
      });
      if (selectedCafeId) { localStorage.setItem("selectedCafeId", selectedCafeId);}

      setPermissions(permissionKeys);
      setIsLoggedIn(true);
    } catch (err) {
      console.log(err);
      showMessage({
        title: "خطأ في السيرفر",
        message: "حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.",
        type: "error",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <>
        <Dashboard 
          user={user} 
          permissions={permissions} 
          onLogout={handleLogout} />

        <MessageModal
          open={messageModal.open}
          title={messageModal.title}
          message={messageModal.message}
          type={messageModal.type}
          onClose={closeMessage}
        />
      </>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.loginCard}>
        <div style={styles.logoWrapper}>
          <img src="/logo.png" style={styles.logo} alt="logo" />
        </div>

        <h2 style={styles.title}>GO CAFE</h2>
<select
  value={selectedCafeId}
  onChange={(e) => {
    setSelectedCafeId(e.target.value);

    setUsername("");
    setPassword("");

    setTimeout(() => {
      document.getElementById("usernameInput")?.focus();
    }, 0);
  }}
  style={{
  ...styles.input,
  marginBottom: "18px",
  background: "#f9fafb",
}}
>
  <option value="">اختر الكافيه</option>
  {cafes.map((c) => (
    <option key={c.id} value={c.id}>
      {c.name}
    </option>
  ))}
</select>

        <div style={styles.inputWrapper}>
          <input
            id="usernameInput"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (!selectedCafeId) return;
                document.getElementById("passwordInput")?.focus();
              }
            }}
            style={styles.input}
          />

          {username && (
            <span onClick={() => setUsername("")} style={styles.clearBtn}>
              ✕
            </span>
          )}
        </div>

        <div style={styles.passwordWrapper}>
          <input
            id="passwordInput"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (!isLoginDisabled) handleLogin();
              }
            }}
            style={styles.input}
          />

          {password && (
            <span onClick={() => setPassword("")} style={styles.clearBtn}>
              ✕
            </span>
          )}

          {password && (
            <span onClick={() => setShowPassword((prev) => !prev)} style={styles.eyeBtn}>
              {showPassword ? <EyeClose /> : <EyeOpen />}
            </span>
          )}
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoginDisabled}
          style={{
            ...styles.loginBtn,
            background: isLoginDisabled ? "#d1d5db" : "#2563eb",
            color: isLoginDisabled ? "#ffffff" : "white",
            cursor: isLoginDisabled ? "not-allowed" : "pointer",
            boxShadow: "none",
          }}
        >
          {loginLoading ? "Login ..." : "Login"}
        </button>

        <p style={styles.footerText}>Powered by Go Cafe System</p>
      </div>

      <MessageModal
        open={messageModal.open}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        onClose={closeMessage}
      />
    </div>
  );
}
