import { useState, useRef, useEffect } from "react";
import useItems from "../hooks/useItems";
import { useInvoiceStore } from "../features/invoices/store/invoiceStore";

export default function InvoiceItemsSection({
  cafeId,
  selectedGroup,
  selectedOrder,
  permissions = [],
}) {
  const items = useItems(cafeId, selectedGroup?.id);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hoverTimerRef = useRef(null);
  const fixedItems = [...items];

  const addItemToOrder = useInvoiceStore((s) => s.addItemToOrder);

  while (fixedItems.length < 50) {
    fixedItems.push({ id: `empty-${fixedItems.length}`, name_ar: "", is_active: false });
  }

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      padding: "2px 10px 2px 2px", overflow: "hidden", minWidth: "260px",
    }}>

      {/* اسم المجموعة */}
      <div style={{
        display: "flex", flexDirection: "row-reverse",
        alignItems: "center", justifyContent: "center",
        width: "100%", padding: "4px 14px",
        textShadow: `
          0 0 6px rgba(255,255,255,0.9),
          0 0 14px rgba(255,255,255,0.7),
          0 0 24px rgba(255,255,255,0.5)
        `,
      }}>
        <div style={{ fontSize: "22px", fontWeight: "900" }}>
          {selectedGroup?.name}
        </div>
      </div>

      {/* شبكة الأصناف */}
      <div style={{
        flex: 1, display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gridTemplateRows: "repeat(10, 1fr)",
        gap: "6px", direction: "rtl",
      }}>
        {fixedItems.slice(0, 50).map((item) => {
          const disabled = !item.is_active || !item.name_ar?.trim();
          return (
            <button
              key={item.id}
              onClick={() => {
                if (!selectedOrder?.id || disabled) return;
                addItemToOrder(selectedOrder.id, item);
              }}
              onMouseEnter={(e) => {
                if (disabled) return;
                setMousePos({ x: e.clientX, y: e.clientY });
                hoverTimerRef.current = setTimeout(() => setHoveredItem(item), 1300);
                e.target.style.transform = "scale(1.06)";
                e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
                e.target.style.background = "#dbeafe";
              }}
              onMouseLeave={(e) => {
                clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = null;
                setHoveredItem(null);
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "none";
                e.target.style.background = disabled ? "#e5e7eb" : "#ffffff";
              }}
              onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
              disabled={disabled || !selectedOrder}
              style={{
                borderRadius: "8px", border: "1px solid #ccc",
                background: (disabled || !selectedOrder) ? "#e5e7eb" : "#ffffff",
                color: (disabled || !selectedOrder) ? "#9ca3af" : "#111827",
                fontSize: "16px", fontWeight: "700",
                cursor: (disabled || !selectedOrder) ? "not-allowed" : "pointer",
                opacity: (disabled || !selectedOrder) ? 0.6 : 1,
                transition: "all 0.15s ease", padding: "0px",
              }}
            >
              {item.name_ar || ""}
            </button>
          );
        })}
      </div>

      {hoveredItem && (
        <div style={{
          position: "fixed", top: mousePos.y + 15, left: mousePos.x + 15,
          background: "rgba(0,0,0,0.85)", color: "#fff",
          padding: "8px 10px", borderRadius: "6px", fontSize: "14px",
          pointerEvents: "none", zIndex: 9999, minWidth: "120px",
          textAlign: "center", direction: "rtl",
        }}>
          <div style={{ fontWeight: "500" }}>{hoveredItem.name_ar}</div>
          <div>{hoveredItem.price} جنيه</div>
        </div>
      )}
    </div>
  );
}