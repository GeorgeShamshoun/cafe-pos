import { useRef, useState } from "react";
import ActionButton from "./ActionButton";
import ConfirmModal from "./ConfirmModal";
import useItems from "./hooks/useItems";
import styles from "./styles/itemsStyles";
import {saveItemService,
  toggleItemService,checkItemNameExists,clearItemService,} from "./services/itemsService";

export default function Items({ user, group }) {
  const items = useItems(user?.cafe_id, group?.id);
  const [editValues, setEditValues] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const inputsRef = useRef({});
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success", action = null) => {
    setToast({ message, type, action });
    setTimeout(() => {setToast(null);}, 2000);};

  const updateEditValue = (item, values) => {
    setEditValues((prev) => ({...prev,[item.id]: {...(prev[item.id] || item),...values,},}));
  };

const saveItem = async (item) => {
  if (loadingId) return;

  const values = editValues[item.id] || item;
  const nameAr = (values.name_ar || "").trim();
  const price = Number(values.price);

  if (!nameAr || price <= 0) return;

  setLoadingId(item.id);

  const { exists, error: checkError } = await checkItemNameExists(user.cafe_id,group.id,nameAr,
    item.id);

  if (checkError) {showToast("Error", "error");setLoadingId(null);return;}

  if (exists) {
    showToast("أسم الصنف موجود بالفعل", "error");

    setEditValues((prev) => ({...prev,[item.id]: {...(prev[item.id] || item),
        name_ar: "",name_en: "", price: 0, is_active: false,},}));

    setLoadingId(null);
    return;
  }

  const { error } = await saveItemService(item.id, {
    name_ar: nameAr,
    name_en: values.name_en || "",
    price,
  });
  if (error) {
    showToast("Error", "error");
    setLoadingId(null);
    return;
  }
  showToast(item.name_ar?.trim()? "تم تعديل الصنف": "تم إنشاء الصنف","success");
  setLoadingId(null);
};

const deleteItem = async (id) => {
  if (loadingId) return;
  setLoadingId(id);
  const { error } = await clearItemService(id);
  if (error) {console.log(error);showToast("Error", "error");
    setLoadingId(null);return;}
    showToast("تم حذف الصنف");
    setEditValues((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  setLoadingId(null);
};

const toggleItem = async (item) => {
  if (loadingId) return;
  setLoadingId(item.id);
  const { error } = await toggleItemService(item);
  if (error) {showToast("Error", "error");} else {const newState = !item.is_active;
    showToast( newState ? "تم تفعيل الصنف" : "تم إيقاف الصنف",newState ? "success" : "warning");
  }
  setLoadingId(null);
};

  const focusNextItem = (item) => {
    const currentIndex = items.findIndex((x) => x.id === item.id);
    const next = items[currentIndex + 1];
    if (!next) return;
    setTimeout(() => {inputsRef.current[`ar-${next.id}`]?.focus();}, 100);};

  return (
    <div style={styles.container}>
      {items.map((item) => {
        const values = editValues[item.id] || item;
        const nameAr = (values.name_ar || "").trim();
        const price = Number(values.price);
        const isArEmpty = nameAr.length === 0;
        const isItemValid = nameAr.length > 0 && price > 0;
        const canDeleteOrToggle = !!item.name_ar?.trim();
        const isLoading = loadingId === item.id;

        return (
         <div key={item.id} className="item-row" style={styles.row}>

            <input
              className="input-hint"
              placeholder={`الصنف ${item.sort_index}`}
              value={values.name_ar || ""}
              disabled={isLoading}
              ref={(el) => {
                inputsRef.current[`ar-${item.id}`] = el;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  inputsRef.current[`en-${item.id}`]?.focus();
                }
              }}
              onChange={(e) => updateEditValue(item, { name_ar: e.target.value })}
              onBlur={() => {
                const current = (values.name_ar || "").trim();

                if (current === "") {
                  updateEditValue(item, { name_ar: item.name_ar });
                }
              }}
              style={{
                ...styles.input,
                opacity: isLoading ? 0.6 : 1,
              }}
            />

            <input
              disabled={isArEmpty || isLoading}
              className="input-hint"
              placeholder={`item ${item.sort_index}`}
              value={values.name_en || ""}
              ref={(el) => {
                inputsRef.current[`en-${item.id}`] = el;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  inputsRef.current[`price-${item.id}`]?.focus();
                }
              }}
              onChange={(e) => updateEditValue(item, { name_en: e.target.value })}
              style={{
                ...styles.input,
                opacity: isLoading ? 0.6 : 1,
              }}
            />

            <input
              disabled={isArEmpty || isLoading}
              className="input-hint"
              placeholder="0.00"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={values.price || ""}
              ref={(el) => {
                inputsRef.current[`price-${item.id}`] = el;
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;

                e.preventDefault();

                if (!isItemValid || isLoading) return;

                saveItem(item);
                focusNextItem(item);
              }}
              onChange={(e) => {
                const value = e.target.value;

                if (!/^\d*\.?\d*$/.test(value)) return;

                updateEditValue(item, { price: value });
              }}
              style={{
                ...styles.priceInput,
                opacity: isLoading ? 0.6 : 1,
              }}
            />

            <ActionButton
              loading={isLoading}
              disabled={!isItemValid}
              onClick={() => saveItem(item)}
            >
              💾
            </ActionButton>

            <ActionButton
              loading={isLoading}
              disabled={!canDeleteOrToggle}
              onClick={() => {
                setItemToDelete(item);
                setShowDeleteModal(true);
              }}
            >
              ❌
            </ActionButton>

            <ActionButton
              loading={isLoading}
              disabled={!canDeleteOrToggle}
              onClick={() => toggleItem(item)}
              style={{
                background: item.is_active ? "#22c55e" : "#ef4444",
                color: "white",
                fontSize: "10px",
              }}
            >
              {item.is_active ? "ON" : "OFF"}
            </ActionButton>
          </div>
        );
      })}

<ConfirmModal
  open={showDeleteModal}
  title="حذف الصنف"
  message={`هل تريد حذف ${itemToDelete?.name_ar} ؟`}
  loading={loadingId === itemToDelete?.id}
  onCancel={() => {
    if (loadingId) return;
    setShowDeleteModal(false);
    setItemToDelete(null);
  }}
  onConfirm={async () => {
    if (!itemToDelete?.id) return;

    await deleteItem(itemToDelete.id);

    setShowDeleteModal(false);
    setItemToDelete(null);
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
