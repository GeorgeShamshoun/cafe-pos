import { useCallback, useRef, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import styles from "./styles/cafeSettingsStyles";
import useCafeSettings from "./hooks/useCafeSettings";

export default function CafeSettings({ user, onClose }) {
  const [focusedField, setFocusedField] = useState(null);
  const inputsRef = useRef({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = "success", action = null) => {
  setToast({ message, type, action });
  setTimeout(() => {setToast(null);}, 2000);}, []);
  const { settings, updateSetting, save, saveLoading, hasChanges } = useCafeSettings({
    cafeId: user?.cafe_id,
    onSaved: onClose,
    showToast,
  });

const handleEnter = (e, nextField) => {
  if (e.key !== "Enter") return;

  e.preventDefault();

  if (nextField) {
    inputsRef.current[nextField]?.focus();
  }
};

  const isServiceFocused = ["service_percentage", "service_ar", "service_en"].includes(
    focusedField
  );
  const isFooterFocused = ["footer_ar", "footer_en"].includes(focusedField);
  return (
    <div
      style={{
        ...styles.modal,
        opacity: saveLoading ? 0.75 : 1,
      }}
    >
      <div
        style={{
          ...styles.sectionBtn,
          cursor: "pointer",
          background: isServiceFocused ? "#2563eb" : "#e5e7eb",
          color: isServiceFocused ? "white" : "black",
        }}
      >
        {saveLoading ? "جاري الحفظ..." : "الخدمة أو الضريبة"}
      </div>

      <div style={styles.row}>
        <div style={styles.percentWrapper}>
          <div style={styles.percentBox}>%</div>

          <input
            ref={(el) => {
              inputsRef.current.service_percentage = el;
            }}
            placeholder="% نسبة الخدمة أو الضريبه"
            className="input-hint"
            type="number"
            disabled={saveLoading}
            value={settings.service_percentage || ""}
            onChange={(e) =>
              updateSetting(
                "service_percentage",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }    
           onFocus={() => setFocusedField("service_percentage")}
            onBlur={() => setFocusedField(null)}
            onKeyDown={(e) => handleEnter(e, "service_ar")}
            style={{
              ...styles.input,
              flex: 1,
            }}
          />
        </div>

<div
  onClick={() => inputsRef.current.service_percentage?.focus()}
  onMouseEnter={() => setHoveredBtn("percent")}
  onMouseLeave={() => setHoveredBtn(null)}
  style={{
    ...styles.Btn,
    flex: 1,
    maxWidth: "225px",
    marginLeft: "auto",
cursor: "pointer",
    background:
      focusedField === "service_percentage"
        ? "#2563eb"
        : hoveredBtn === "percent"
        ? "#dbe3ee"
        : "#e5e7eb",

    color:
      focusedField === "service_percentage"
        ? "white"
        : "black",

    transform:
      hoveredBtn === "percent"
        ? "translateY(-1px)"
        : "translateY(0)",

    transition: "all 0.15s ease",
  }}
>
          النسبة
        </div>
      </div>

      <div style={styles.row}>
        <input
          ref={(el) => {
            inputsRef.current.service_ar = el;
          }}
          className="input-hint"
          placeholder="أسم الخدمة او الضريبة عربى"
          disabled={saveLoading}
          value={settings.service_name_ar || ""}
          onChange={(e) => updateSetting("service_name_ar", e.target.value)}
          onFocus={() => setFocusedField("service_ar")}
          onBlur={() => setFocusedField(null)}
          onKeyDown={(e) => handleEnter(e, "service_en")}
          style={styles.input}
        />

        <div
          onClick={() => inputsRef.current.service_ar?.focus()}
          onMouseEnter={() => setHoveredBtn("service_ar")}
          onMouseLeave={() => setHoveredBtn(null)}
  style={{
    ...styles.Btn,
    flex: 1,
    maxWidth: "225px",
    marginLeft: "auto",
cursor: "pointer",
    background:
      focusedField === "service_ar"
        ? "#2563eb"
        : hoveredBtn === "service_ar"
        ? "#dbe3ee"
        : "#e5e7eb",

    color:
      focusedField === "service_ar"
        ? "white"
        : "black",

    transform:
      hoveredBtn === "service_ar"
        ? "translateY(-1px)"
        : "translateY(0)",

    transition: "all 0.15s ease",
  }}
        >

          
          AR
        </div>
      </div>

      <div style={styles.row}>
        <input
          ref={(el) => {
            inputsRef.current.service_en = el;
          }}
          className="input-hint"
          placeholder="أسم الخدمة او الضريبة أنجليزى"
          disabled={saveLoading}
          value={settings.service_name_en || ""}
          onChange={(e) => updateSetting("service_name_en", e.target.value)}
          onFocus={() => setFocusedField("service_en")}
          onBlur={() => setFocusedField(null)}
          onKeyDown={(e) => handleEnter(e, "footer_ar")}
          style={styles.input}
        />

        <div
          onClick={() => inputsRef.current.service_en?.focus()}
            onMouseEnter={() => setHoveredBtn("service_en")}
            onMouseLeave={() => setHoveredBtn(null)}
  style={{
    ...styles.Btn,
    flex: 1,
    maxWidth: "225px",
    marginLeft: "auto",
cursor: "pointer",
    background:
      focusedField === "service_en"
        ? "#2563eb"
        : hoveredBtn === "service_en"
        ? "#dbe3ee"
        : "#e5e7eb",

    color:
      focusedField === "service_en"
        ? "white"
        : "black",

    transform:
      hoveredBtn === "service_en"
        ? "translateY(-1px)"
        : "translateY(0)",

    transition: "all 0.15s ease",
  }}
        >
          EN
        </div>
      </div>

      <div
        style={{
          ...styles.sectionBtn,
          cursor: "pointer",
          background: isFooterFocused ? "#2563eb" : "#e5e7eb",
          color: isFooterFocused ? "white" : "black",
        }}
      >
        نهاية الفاتورة
      </div>

      <div style={styles.row}>
        <input
          ref={(el) => {
            inputsRef.current.footer_ar = el;
          }}
          className="input-hint"
          placeholder="نهاية الفاتورة عربى"
          disabled={saveLoading}
          value={settings.receipt_footer_ar || ""}
          onChange={(e) => updateSetting("receipt_footer_ar", e.target.value)}
          onFocus={() => setFocusedField("footer_ar")}
          onBlur={() => setFocusedField(null)}
          onKeyDown={(e) => handleEnter(e, "footer_en")}
          style={styles.input}
        />

        <div
          onClick={() => inputsRef.current.footer_ar?.focus()}
            onMouseEnter={() => setHoveredBtn("footer_ar")}
            onMouseLeave={() => setHoveredBtn(null)}

  style={{
    ...styles.Btn,
    flex: 1,
    maxWidth: "225px",
    marginLeft: "auto",
cursor: "pointer",
    background:
      focusedField === "footer_ar"
        ? "#2563eb"
        : hoveredBtn === "footer_ar"
        ? "#dbe3ee"
        : "#e5e7eb",

    color:
      focusedField === "footer_ar"
        ? "white"
        : "black",

    transform:
      hoveredBtn === "footer_ar"
        ? "translateY(-1px)"
        : "translateY(0)",

    transition: "all 0.15s ease",
  }}
        >
          AR
        </div>
      </div>

      <div style={styles.row}>
        <input
          ref={(el) => {
            inputsRef.current.footer_en = el;
          }}
          className="input-hint"
          placeholder="نهاية الفاتورة أنجليزى"
          disabled={saveLoading}
          value={settings.receipt_footer_en || ""}
          onChange={(e) => updateSetting("receipt_footer_en", e.target.value)}
          onFocus={() => setFocusedField("footer_en")}
          onBlur={() => setFocusedField(null)}
          onKeyDown={(e) => handleEnter(e, null)}
          style={styles.input}
        />

        <div
          onClick={() => inputsRef.current.footer_en?.focus()}
            onMouseEnter={() => setHoveredBtn("footer_en")}
            onMouseLeave={() => setHoveredBtn(null)}
  style={{
    ...styles.Btn,
    flex: 1,
    maxWidth: "225px",
    marginLeft: "auto",
cursor: "pointer",
    background:
      focusedField === "footer_en"
        ? "#2563eb"
        : hoveredBtn === "footer_en"
        ? "#dbe3ee"
        : "#e5e7eb",

    color:
      focusedField === "footer_en"
        ? "white"
        : "black",

    transform:
      hoveredBtn === "footer_en"
        ? "translateY(-1px)"
        : "translateY(0)",

    transition: "all 0.15s ease",
  }}
        >
          EN
        </div>
      </div>
<div style={styles.saveWrapper}>
  <button
    disabled={saveLoading || !hasChanges}
      onClick={() => setShowSaveModal(true)}
style={{
  ...styles.saveBtn,

  opacity:
    saveLoading || !hasChanges
      ? 0.6
      : 1,

  cursor:
    saveLoading || !hasChanges
      ? "not-allowed"
      : "pointer",

  background:
    saveLoading || !hasChanges
      ? "#94a3b8"
      : "#2563eb",

  boxShadow:
    saveLoading || !hasChanges
      ? "none"
      : "0 8px 18px rgba(37, 99, 235, 0.2)",
}}
  >
     {saveLoading ? "Saving..." : "Save"}
  </button>
</div>
          <ConfirmModal
            open={showSaveModal}
            title="حفظ الإعدادات"
            message="هل تريد حفظ التعديلات؟"
            loading={saveLoading}
            onCancel={() => {
              if (saveLoading) return;
              setShowSaveModal(false);
            }}
            onConfirm={async () => {
              await save();
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
