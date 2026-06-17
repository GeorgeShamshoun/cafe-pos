import { useCallback, useEffect, useState } from "react";
import ActionButton from "./ActionButton";
import ConfirmModal from "./ConfirmModal";
import { useVisibleUsers } from "./data/usersTable";
import styles from "./styles/usersStyles";
import { useToast } from "./hooks/useToast";
import {
  addUser,
  canAddUser,
  deleteUserPermissions,
  toggleUserActive,
  checkUserNameExists,
} from "./services/usersService";

export default function Users({
  user,
  users,
  setUsers,
  selectedUser,
  onSelectUser,
  setEditValues,
}) {
  const [newName, setNewName] = useState("");
  const [canAdd, setCanAdd] = useState(false);
  const [focusedAddUser, setFocusedAddUser] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [hoveredUserId, setHoveredUserId] = useState(null);
  const { toast, showToast } = useToast();
  const { rows: liveUsers, refresh: loadUsers } = useVisibleUsers(user?.cafe_id);

  const checkPermission = useCallback(async () => {
    const allowed = await canAddUser(user?.id);
    setCanAdd(allowed);
  }, [user?.id]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  useEffect(() => {
    setUsers(liveUsers || []);
  }, [liveUsers, setUsers]);

  const selectUser = (selected) => {
    onSelectUser(selected);

    if (!selected) {
      setEditValues({});
      return;
    }

    setEditValues({
      [selected.id]: {
        name: selected.name || "",
        username: selected.username || "",
        password: selected.password || "",
      },
    });
  };

  const handleAddUser = async () => {
    const name = newName.trim();

    if (!name || !user?.cafe_id || addLoading) return;

    setAddLoading(true);

    try {
      const { exists, error: checkError } = await checkUserNameExists(
        user.cafe_id,
        name
      );

      if (checkError) {
        showToast("حدث خطأ", "error");
        return;
      }

      if (exists) {
        showToast("اسم المستخدم موجود بالفعل", "error");
        setNewName("");
        selectUser(null);
        document.activeElement?.blur();
        return;
      }

      const { data, error } = await addUser(user.cafe_id, name);

      if (error) {
        showToast("حدث خطأ أثناء الإضافة", "error");
        return;
      }

      setUsers((prev) => [...prev, data]);
      selectUser(data);
      setNewName("");
      showToast("تم إضافة المستخدم", "success");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (loadingId) return;
    setLoadingId(id);

    try {
      const { error } = await deleteUserPermissions(id);
      if (error) {
        if (error.code === "23503") {
          showToast("لا يمكن حذف المستخدم لوجود فواتير", "error");
        } else {
          showToast("خطأ في الحذف", "error");
        }
        return;
      }

      await loadUsers();
      showToast("تم حذف المستخدم", "success");
      if (selectedUser?.id === id) {
        selectUser(null);
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleUser = async (selected) => {
    if (loadingId) return;
    setLoadingId(selected.id);

    try {
      const newValue = !selected.is_active;
      const { error } = await toggleUserActive(selected);

      if (error) {
        showToast("خطأ في تحديث الحالة", "error");
        return;
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === selected.id ? { ...item, is_active: newValue } : item
        )
      );

      if (selectedUser?.id === selected.id) {
        selectUser({
          ...selected,
          is_active: newValue,
        });
      }

      showToast(
        newValue ? "تم تفعيل المستخدم" : "تم إيقاف المستخدم",
        newValue ? "success" : "warning"
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        {canAdd && (
          <div style={styles.addCard}>
            <div style={styles.addInputWrapper}>
              {(focusedAddUser || newName) && (
                <div style={styles.inputLabel}>الأسم</div>
              )}

              <input
                value={newName}
                disabled={addLoading}
                onFocus={() => setFocusedAddUser(true)}
                onBlur={() => setFocusedAddUser(false)}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={focusedAddUser ? "" : "الأسم"}
                style={{
                  ...styles.input,
                  opacity: addLoading ? 0.6 : 1,
                }}
              />
            </div>

            <ActionButton
              loading={addLoading}
              disabled={!newName.trim()}
              onClick={() => setShowAddModal(true)}
              style={{
                background: "#2563eb",
                color: "white",
              }}
            >
              ➕
            </ActionButton>
          </div>
        )}

        <div style={styles.grid}>
          {users.map((mappedUser) => {
            const isSelected = selectedUser?.id === mappedUser.id;
            const isLoading = loadingId === mappedUser.id;

            return (
              <div key={mappedUser.id} style={styles.row}>
                <div
                  onMouseEnter={() => setHoveredUserId(mappedUser.id)}
                  onMouseLeave={() => setHoveredUserId(null)}
                  style={{
                    ...styles.userBtn,
                    background: isSelected
                      ? "#2563eb"
                      : hoveredUserId === mappedUser.id
                      ? "#e2e8f0"
                      : "#f1f5f9",
                    borderColor: isSelected
                      ? "#2563eb"
                      : hoveredUserId === mappedUser.id
                      ? "#cbd5e1"
                      : "#e2e8f0",
                    color: isSelected ? "white" : "#111827",
                    opacity: isLoading ? 0.6 : 1,
                    transform:
                      hoveredUserId === mappedUser.id
                        ? "translateY(-1px)"
                        : "translateY(0)",
                    transition: "all 0.15s ease",
                  }}
                  onClick={() => {
                    if (isLoading) return;
                    selectUser(mappedUser);
                  }}
                >
                  {mappedUser.name}
                </div>

                <ActionButton
                  loading={isLoading}
                  onClick={() => {
                    selectUser(mappedUser);
                    setUserToDelete(mappedUser);
                    setShowDeleteModal(true);
                  }}
                >
                  ❌
                </ActionButton>

                <ActionButton
                  loading={isLoading}
                  onClick={async () => {
                    selectUser(mappedUser);
                    await handleToggleUser(mappedUser);
                  }}
                  style={{
                    background: mappedUser.is_active ? "#22c55e" : "#ef4444",
                    color: "white",
                    fontSize: "10px",
                  }}
                >
                  {mappedUser.is_active ? "ON" : "OFF"}
                </ActionButton>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="حذف المستخدم"
        message={`هل تريد حذف ${userToDelete?.name} ؟`}
        loading={loadingId === userToDelete?.id}
        onCancel={() => {
          if (loadingId) return;
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={async () => {
          if (!userToDelete?.id) return;
          await handleDeleteUser(userToDelete.id);
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
      />

      <ConfirmModal
        open={showAddModal}
        title="إضافة مستخدم"
        message={`هل تريد إضافة ${newName} ؟`}
        loading={addLoading}
        onCancel={() => {
          if (addLoading) return;
          setShowAddModal(false);
        }}
        onConfirm={async () => {
          await handleAddUser();
          setShowAddModal(false);
        }}
      />

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background:
              toast.type === "error"
                ? "#ef4444"
                : toast.type === "warning"
                ? "#f59e0b"
                : "#22c55e",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            zIndex: 99999,
            fontWeight: "700",
            fontSize: "14px",
            minWidth: "200px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
            textAlign: "center",
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
