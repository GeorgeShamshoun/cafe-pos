import { useEffect, useRef, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { EyeClose, EyeOpen } from "./components/icons/PasswordVisibilityIcons";
import { useVisiblePermissionsRows } from "./data/permissionsTable";
import { useActiveUserPermissionIds } from "./data/userPermissionsTable";
import styles from "./styles/usersDetailsStyles";
import {addUserPermission,
  removeUserPermission,updateUserDetails,checkDuplicateUser} from "./services/usersDetailsService";


export default function UsersDetails({
  user,
  users,
  selectedUser,
  setSelectedUser,
  setUsers,
  editValues,
  setEditValues,
}) {
  const [allPermissions, setAllPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingPermissions, setPendingPermissions] = useState([]);
  const [hoveredPermissionId, setHoveredPermissionId] = useState(null);
  const { rows: livePermissions } = useVisiblePermissionsRows();
  const { rows: liveUserPermissions } = useActiveUserPermissionIds(selectedUser?.id);
const originalRef = useRef({
  name: "",
  username: "",
  password: "",
  permissions: []
});
  const values = editValues?.[selectedUser.id] ?? {
    name: selectedUser.name || "",
    username: selectedUser.username || "",
    password: selectedUser.password || "",
  };

const hasChanges =
  values.name !== originalRef.current.name ||
  values.username !== originalRef.current.username ||
  values.password !== originalRef.current.password ||
  JSON.stringify([...pendingPermissions].sort()) !==
    JSON.stringify([...originalRef.current.permissions].sort());

  
const togglePermission = (id) => {
  setPendingPermissions((prev) =>
    prev.includes(id)
      ? prev.filter((p) => p !== id)
      : [...prev, id]
  );
};

  const showToast = (message, type = "success", action = null) => {
  setToast({ message, type, action });
  setTimeout(() => {setToast(null);}, 2000);};

useEffect(() => {
  if (!selectedUser) return;

  originalRef.current = {
    name: selectedUser.name || "",
    username: selectedUser.username || "",
    password: selectedUser.password || "",
    permissions: [],
  };
}, [selectedUser]);

useEffect(() => {
  setAllPermissions(livePermissions || []);
}, [livePermissions]);

useEffect(() => {
  setUserPermissions(liveUserPermissions?.map((item) => item.permission_id) || []);
}, [liveUserPermissions]);

  useEffect(() => {setShowPassword(false);}, [selectedUser]);

useEffect(() => {
  setPendingPermissions(userPermissions);

  // تحديث الأصل بعد ما البيانات الحقيقية تيجي من السيرفر
  originalRef.current.permissions = userPermissions;
}, [userPermissions]);

  if (!selectedUser) return null;


  const updateField = (field, value) => {
    setEditValues((prev) => ({...prev,[selectedUser.id]: {...values,[field]: value,},}));
  };


const saveUser = async () => {
  if (saveLoading) return;

  const name = (values.name || "").trim();
  const username = (values.username || "").trim();
  const password = values.password || "";

  // 👇 الاسم فقط إجباري
  if (!name) return;

  // 👇 تحقق التكرار
  const {
    nameExists,
    usernameExists,
    error: checkError,
  } = await checkDuplicateUser(
    user.cafe_id,
    name,
    username,
    selectedUser.id
  );

  if (checkError) {
    console.log(checkError);
    showToast("Error", "error");
    return;
  }

  if (nameExists) {
    showToast("الأسم موجود بالفعل", "error");
    return;
  }

  // 👇 لا يتحقق إلا لو اليوزرنيم مش فاضي
  if (username && usernameExists) {
    showToast("أسم المستخدم موجود بالفعل", "error");
    return;
  }

  setSaveLoading(true);

  const cleanValues = {
    name,
    username,
    password,
  };

  const { error } = await updateUserDetails(
    selectedUser.id,
    cleanValues
  );

  if (error) {
    console.log(error);
    showToast("Error", "error");
    setSaveLoading(false);
    return;
  }

  setUsers((prev) =>
    prev.map((user) =>
      user.id === selectedUser.id
        ? {
            ...user,
            ...cleanValues,
          }
        : user
    )
  );

  setSelectedUser((prev) => ({
    ...prev,
    ...cleanValues,
  }));

  setEditValues((prev) => ({
    ...prev,
    [selectedUser.id]: cleanValues,
  }));

  // الصلاحيات الاصلية
const currentPermissions = userPermissions;

// الصلاحيات بعد التعديل
const newPermissions = pendingPermissions;

// الصلاحيات الجديدة
const permissionsToAdd = newPermissions.filter(
  (id) => !currentPermissions.includes(id)
);

// الصلاحيات المحذوفة
const permissionsToRemove = currentPermissions.filter(
  (id) => !newPermissions.includes(id)
);

// إضافة الصلاحيات
for (const permissionId of permissionsToAdd) {
  await addUserPermission(selectedUser.id, permissionId);
}

// حذف الصلاحيات
for (const permissionId of permissionsToRemove) {
  await removeUserPermission(selectedUser.id, permissionId);
}

// تحديث الحالة الحالية
setUserPermissions(pendingPermissions); 

  showToast("تم حفظ بيانات المستخدم");

  setSaveLoading(false);
};
const currentName = (values.name || "").trim().toLowerCase();

const isDuplicateName = users.some(
  (u) =>
    u.id !== selectedUser.id &&
    (u.name || "").trim().toLowerCase() === currentName
);
  return (
    <div style={styles.card}>
      <div style={styles.inputsRow}>
        <div style={styles.inputWrapper}>
          {(focusedField === "name" || values.name) && (
            <div style={styles.inputLabel}>Name</div>
          )}

          <input
            className="input-hint"
            placeholder={focusedField === "name" ? "" : "Name"}
            value={values.name || ""}
            disabled={saveLoading}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            onChange={(e) => updateField("name", e.target.value)}
            style={{
              ...styles.input,
              opacity: saveLoading ? 0.6 : 1,
            }}
          />
        </div>

        <div style={styles.inputWrapper}>
          {(focusedField === "username" || values.username) && (
            <div style={styles.inputLabel}>Username</div>
          )}

          <input
            className="input-hint"
            placeholder={focusedField === "username" ? "" : "User Name"}
            value={values.username || ""}
            disabled={saveLoading}
            onFocus={() => setFocusedField("username")}
            onBlur={() => setFocusedField(null)}
            onChange={(e) => updateField("username", e.target.value)}
            style={{
              ...styles.input,
              opacity: saveLoading ? 0.6 : 1,
            }}
          />
        </div>

        <div style={styles.passwordWrapper}>
          {(focusedField === "password" || values.password) && (
            <div style={styles.inputLabel}>Password</div>
          )}

          <input
            type={showPassword ? "text" : "password"}
            className="input-hint"
            placeholder={focusedField === "password" ? "" : "Password"}
            value={values.password || ""}
            disabled={saveLoading}
            onFocus={() => setFocusedField("password")}
            onBlur={() => {setFocusedField(null);setShowPassword(false);}}
            onChange={(e) => updateField("password", e.target.value)}
            style={{
              ...styles.passwordInput,
              opacity: saveLoading ? 0.6 : 1,
            }}
          />

          {values.password && (
            <button
              type="button"
              disabled={saveLoading}
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                ...styles.eyeBtn,
                opacity: saveLoading ? 0.5 : 1,
                cursor: saveLoading ? "not-allowed" : "pointer",
              }}
            >
              {showPassword ? <EyeClose size={18} /> : <EyeOpen size={18} />}
            </button>
          )}
        </div>
      </div>

      <div style={styles.permissionsWrapper}>
        <div style={styles.permissionsCard}>
          <div style={styles.permissionsTitle}>كل الصلاحيات</div>

          <div style={styles.permissionsList}>
            {allPermissions
              .filter((permission) => !pendingPermissions.includes(permission.id))
              .map((permission) => {
                return (
                <div
                  key={permission.id}
                  onMouseEnter={() => setHoveredPermissionId(permission.id)}
                  onMouseLeave={() => setHoveredPermissionId(null)}
                style={{
                  ...styles.permissionBtn,

                  background:
                    hoveredPermissionId === permission.id
                      ? "#fecaca"
                      : "#fee2e2",

                  transform:
                    hoveredPermissionId === permission.id
                      ? "translateY(-1px)"
                      : "translateY(0)",

                  transition: "all 0.15s ease",

                  cursor: "pointer",
                }}
                                   onClick={() => {
                     togglePermission(permission.id);
                    }}
                  >
                    {permission.description}
                  </div>
                );
              })}
          </div>
        </div>

        <div style={styles.permissionsCard}>
          <div style={styles.permissionsTitle}>صلاحيات {values.name}</div>

          <div style={styles.permissionsList}>
            {allPermissions
              .filter((permission) => pendingPermissions.includes(permission.id))
              .map((permission) => {
                return (
                  <div
                     key={permission.id}
                  onMouseEnter={() => setHoveredPermissionId(permission.id)}
                  onMouseLeave={() => setHoveredPermissionId(null)}
                  style={{
                    ...styles.permissionBtn,

                    background:
                      hoveredPermissionId === permission.id
                        ? "#bbf7d0"
                        : "#dcfce7",

                    transform:
                      hoveredPermissionId === permission.id
                        ? "translateY(-1px)"
                        : "translateY(0)",

                    transition: "all 0.15s ease",

                    cursor: "pointer",
                  }}
                    onClick={() => {
                     togglePermission(permission.id);
                    }}
                  >
                    {permission.description}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <button
        disabled={
          saveLoading ||
          !(values.name || "").trim() ||
          isDuplicateName ||
          !hasChanges
        }
        onClick={() => {
          if (saveLoading) return;
          setShowSaveModal(true);
        }}
      style={{
        ...styles.saveBtn,
        opacity:
          saveLoading ||
          !(values.name || "").trim() ||
          isDuplicateName ||
          !hasChanges
            ? 0.6
            : 1,

      cursor:
        saveLoading ||
        !(values.name || "").trim() ||
        isDuplicateName||
          !hasChanges
          ? "not-allowed"
          : "pointer",

      background:
        saveLoading ||
        !(values.name || "").trim() ||
        isDuplicateName||
          !hasChanges
          ? "#94a3b8"
          : "#2563eb",
      }}
      >
        {saveLoading ? "Saving..." : "Save"}
      </button>

      <ConfirmModal
        open={showSaveModal}
        title="حفظ التعديلات"
        message={`هل تريد حفظ بيانات ${values.name || selectedUser.name} ؟`}
        loading={saveLoading}
        onCancel={() => {
          if (saveLoading) return;
          setShowSaveModal(false);
        }}
        onConfirm={async () => {
          await saveUser();
          setShowSaveModal(false);
        }}
      />

      {toast && (
        <div style={{
          position: "fixed",
          bottom: 200,
          left: 270,
          background: toast.type === "error" ? "#ef4444" : "#22c55e",
          color: "white",
          padding: "10px 15px",
          borderRadius: 8,
          zIndex: 99999,
          fontWeight: "700",
          fontSize: "16px",
          minWidth: "180px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
