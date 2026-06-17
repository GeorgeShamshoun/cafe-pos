import { useCallback, useRef, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import styles from "./styles/cafeSettingsStyles";
import { useToast } from "./hooks/useToast";
import useCafeSettings from "./hooks/useCafeSettings";

const FORM_FIELDS = {
  SERVICE_PERCENTAGE: "service_percentage",
  SERVICE_AR: "service_ar",
  SERVICE_EN: "service_en",
  FOOTER_AR: "footer_ar",
  FOOTER_EN: "footer_en",
};

const FIELD_GROUPS = {
  SERVICE: ["service_percentage", "service_ar", "service_en"],
  FOOTER: ["footer_ar", "footer_en"],
};

export default function CafeSettings({ user, onClose }) {
  const [focusedField, setFocusedField] = useState(null);
  const inputsRef = useRef({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const { toast, showToast } = useToast();
  const { settings, updateSetting, save, saveLoading, hasChanges } =
    useCafeSettings({
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

  const isServiceFocused = FIELD_GROUPS.SERVICE.includes(focusedField);
  const isFooterFocused = FIELD_GROUPS.FOOTER.includes(focusedField);

  const renderInputField = (fieldKey, label, placeholder, nextField) => (
    <div key={fieldKey} style={styles.row}>
      <input
        ref={(el) => {
          inputsRef.current[fieldKey] = el;
        }}
        className="input-hint"
        placeholder={placeholder}
        disabled={saveLoading}
        value={settings[fieldKey] || ""}
        onChange={(e) => updateSetting(fieldKey, e.target.value)}
        onFocus={() => setFocusedField(fieldKey)}
        onBlur={() => setFocusedField(null)}
        onKeyDown={(e) => handleEnter(e, nextField)}
        style={styles.input}
      />

      <div
        onClick={() => inputsRef.current[fieldKey]?.focus()}
        onMouseEnter={() => setHoveredBtn(fieldKey)}
        onMouseLeave={() => setHoveredBtn(null)}
        style={{
          ...styles.Btn,
          flex: 1,
          maxWidth: "225px",
          marginLeft: "auto",
          cursor: "pointer",
          background:
            focusedField === fieldKey
              ? "#2563eb"
              : hoveredBtn === fieldKey
              ? "#dbe3ee"
              : "#e5e7eb",
          color: focusedField === fieldKey ? "white" : "black",
          transform:
            hoveredBtn === fieldKey ? "translateY(-1px)" : "translateY(0)",
          transition: "all 0.15s ease",
        }}
      >
        {label}
      </div>
    </div>
  );

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
              inputsRef.current[FORM_FIELDS.SERVICE_PERCENTAGE] = el;
            }}
            placeholder="% نسبة الخدمة أو الضريبه"
            className="input-hint"
            type="number"
            disabled={saveLoading}
            value={settings.service_percentage || ""}
            onChange={(e) =>
              updateSetting(
                FORM_FIELDS.SERVICE_PERCENTAGE,
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            onFocus={() => setFocusedField(FORM_FIELDS.SERVICE_PERCENTAGE)}
            onBlur={() => setFocusedField(null)}
            onKeyDown={(e) =>
              handleEnter(e, FORM_FIELDS.SERVICE_AR)
            }
            style={{
              ...styles.input,
              flex: 1,
            }}
          />
        </div>
      </div>

      {renderInputField(
        FORM_FIELDS.SERVICE_AR,
        "AR",
        "أسم الخدمة او الضريبة عربى",
        FORM_FIELDS.SERVICE_EN
      )}

      {renderInputField(
        FORM_FIELDS.SERVICE_EN,
        "EN",
        "أسم الخدمة او الضريبة أنجليزى",
        FORM_FIELDS.FOOTER_AR
      )}

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

      {renderInputField(
        FORM_FIELDS.FOOTER_AR,
        "AR",
        "نهاية الفاتورة عربى",
        FORM_FIELDS.FOOTER_EN
      )}

      {renderInputField(
        FORM_FIELDS.FOOTER_EN,
        "EN",
        "نهاية الفاتورة أنجليزى",
        null
      )}

      <div style={styles.saveWrapper}>
        <button
          disabled={saveLoading || !hasChanges}
          onClick={() => setShowSaveModal(true)}
          style={{
            ...styles.saveBtn,
            opacity: saveLoading || !hasChanges ? 0.6 : 1,
            cursor: saveLoading || !hasChanges ? "not-allowed" : "pointer",
            background: saveLoading || !hasChanges ? "#94a3b8" : "#2563eb",
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
