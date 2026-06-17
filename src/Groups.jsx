import { useEffect, useRef, useState } from "react";
import ActionButton from "./ActionButton";
import ConfirmModal from "./ConfirmModal";
import useGroups from "./hooks/useGroups";
import styles from "./styles/groupsStyles";
import { updateGroup,toggleGroupService,
  deleteGroupService,checkGroupNameExists} from "./services/groupsService";

export default function Groups({ user, onSelectGroup }) {
  const groups = useGroups(user?.cafe_id);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const inputRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [hoveredGroupId, setHoveredGroupId] = useState(null);
  const showToast = (message, type = "success", action = null) => {
    setToast({ message, type, action });
    setTimeout(() => {setToast(null);}, 2000);};
  const clearSelection = () => {setSelectedGroupId(null);onSelectGroup(null);};
  useEffect(() => {if (editingId && inputRef.current) {inputRef.current.focus();}}, [editingId]);

const toggleGroup = async (group) => {
  if (loadingId) return;
  setLoadingId(group.id);
  const { error } = await toggleGroupService(group);
  if (error) {showToast("Error", "error");setLoadingId(null);return;}
  const newState = !group.is_active;
  showToast(
    newState ? "تم تفعيل المجموعة" : "تم إيقاف المجموعة",
    newState ? "success" : "warning"
  );
  setLoadingId(null);
};

const deleteGroup = async (id) => {
  if (loadingId) return;
  setLoadingId(id);
  const { error } = await deleteGroupService(id);
    if (error) {console.log(error);showToast("Error", "error");
  } 
  else {
    showToast("تم حذف المجموعة");
    clearSelection();
  }
  setLoadingId(null);
};

  const startEdit = (group) => {setEditingId(group.id);
    setEditValues((prev) => ({...prev,[group.id]: group.name || "",}));
  };
  const cancelEdit = () => {setEditingId(null);setEditValues({});};

  const saveEdit = async (id) => {
  if (loadingId) return;

  const value = (editValues[id] || "").trim();
  if (!value) return;

  setLoadingId(id);

  const oldGroup = groups.find((g) => g.id === id);
  const oldName = (oldGroup?.name || "").trim();
  const newName = value;

if (oldName === newName) {setEditingId(null);
  setEditValues((prev) => { const copy = { ...prev };delete copy[id];return copy;});

  setLoadingId(null);
  return;
}
  const isFirstTimeSetup = !oldName;
  const { exists, error: checkError } = await checkGroupNameExists(user.cafe_id, newName, id);
    if (checkError) {showToast("Error", "error");setLoadingId(null);return;}
    if (exists) {showToast("أسم المجموعة موجود بالفعل", "error");
      setEditValues((prev) => ({ ...prev,[id]: "",}));
      setLoadingId(null);
      return;
    }
  const { error } = await updateGroup(id, {name: newName, is_active: true,});
  if (error) { showToast("Error", "error"); setLoadingId(null); return;}

  showToast(isFirstTimeSetup ? "تم إنشاء المجموعة": "تم تعديل المجموعة","success");

  setEditingId(null);

  setEditValues((prev) => {const copy = { ...prev }; delete copy[id];return copy;});
  setLoadingId(null);
};

  return (
    <div style={styles.container}>
      {groups.map((group) => {
        const isEditing = editingId === group.id || group.name === "";
        const groupName = (editValues[group.id] ?? group.name ?? "").trim();
        const isGroupValid = groupName.length > 0;
        const isGroupEmpty = !group.name?.trim();
        const isSelected = selectedGroupId === group.id;
        const isLoading = loadingId === group.id;

        return (
          <div key={group.id} style={styles.groupRow}>
            {isEditing ? (
              <input
                ref={editingId === group.id ? inputRef : null}
                value={editValues[group.id] ?? group.name ?? ""}
                placeholder={`مجموعة الأصناف ${group.sort_index}`}
                className="input-hint"
                disabled={isLoading}
                onFocus={() => {
                  clearSelection();
                  setEditingId(group.id);
                }}
                onChange={(e) =>
                  setEditValues((prev) => ({
                    ...prev,
                    [group.id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveEdit(group.id);
                  }
                  if (e.key === "Escape") {
                    cancelEdit();
                  }
                }}
                style={styles.editInput}
              />
            ) : (
              <div
              onMouseEnter={() => setHoveredGroupId(group.id)}
onMouseLeave={() => setHoveredGroupId(null)}
style={{
  ...styles.groupItem,

  background: isSelected
    ? "#2563eb"
    : hoveredGroupId === group.id
    ? "#e2e8f0"
    : "#f1f5f9",

  color: isSelected ? "white" : "#111827",

  borderColor: isSelected
    ? "#2563eb"
    : hoveredGroupId === group.id
    ? "#cbd5e1"
    : "#e2e8f0",

  opacity: isLoading ? 0.6 : 1,

  transform:
    hoveredGroupId === group.id
      ? "translateY(-1px)"
      : "translateY(0)",

  transition: "all 0.15s ease",
}}
                onClick={() => {
                  if (isLoading) return;

                  setSelectedGroupId(group.id);
                  onSelectGroup(group);
                  setEditingId(null);
                  setEditValues({});
                }}
              >
                {group.name}
              </div>
            )}

            {isEditing ? (
              <ActionButton
                loading={isLoading}
                disabled={!isGroupValid}
                onClick={() => {
                  clearSelection();
                  saveEdit(group.id);
                }}
              >
                💾
              </ActionButton>
            ) : (
              <ActionButton
                loading={isLoading}
                onClick={() => {
                  clearSelection();
                  startEdit(group);
                }}
              >
                ✎
              </ActionButton>
            )}
            <ActionButton
              disabled={isGroupEmpty}
              loading={isLoading}
              onClick={() => {
                onSelectGroup(group);
                setEditingId(null);
                setEditValues({});
                setSelectedGroupId(group.id);
                setGroupToDelete(group);
                setShowDeleteModal(true);
              }}
            >
              ❌
            </ActionButton>

            <ActionButton
              disabled={isGroupEmpty}
              loading={isLoading}
              onClick={() => {
                setEditingId(null);
                setEditValues({});
                toggleGroup(group);
                setSelectedGroupId(group.id);
                onSelectGroup(group);
              }}
              style={{
                background: group.is_active ? "#22c55e" : "#ef4444",
                color: "white",
                fontSize: "10px",
                minWidth: "35px",
              }}
            >
              {group.is_active ? "ON" : "OFF"}
            </ActionButton>
          </div>
        );
      })}

      <ConfirmModal
        open={showDeleteModal}
        title="حذف مجموعة الأصناف "
        message={`هل تريد حذف ${groupToDelete?.name} ؟`}
        loading={loadingId === groupToDelete?.id}
        onCancel={() => {
          if (loadingId) return;
          setShowDeleteModal(false);
          setGroupToDelete(null);
        }}
        onConfirm={async () => {
          if (!groupToDelete?.id) return;

          await deleteGroup(groupToDelete.id);
          setShowDeleteModal(false);
          setGroupToDelete(null);
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
