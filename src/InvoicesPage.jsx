import { useState, useEffect, useRef } from "react";
import useGroups from "./hooks/useGroups";
import useTables from "./hooks/useTables";
import InvoiceItemsSection from "./components/InvoiceItemsSection";
import { supabase } from "./supabase";
import { tafqeetArabic } from "./utils/tafqeetArabic";
import ConfirmModal from "./ConfirmModal";
import MessageModal from "./MessageModal";
import InvoiceOrderItemsCard from "./components/InvoiceOrderItemsCard";
import { recalculateOrderTotals } from "./services/orderTotalsService";
import { useInvoiceStore } from "./features/invoices/store/invoiceStore";
import { printOrder } from "./utils/printOrder";
import InvoiceGroupsSection from "./components/InvoiceGroupsSection";

export default function InvoicesPage({user, onBack, currentShiftDate, currentShiftType, permissions = [],}) {
  const [discountFocused, setDiscountFocused] = useState(false);
  const dateInputRef = useRef(null);
  const [pendingShiftDate, setPendingShiftDate] = useState("");

  const [pendingShiftType, setPendingShiftType] = useState("");
  const [printLang, setPrintLang] = useState("ar");
  const pendingDiscountRef = useRef(null);
  const hasPermission = (key) => permissions?.includes(key);
  const canCloseShift = currentShiftType === "AM" ? hasPermission("Invoices.am.open") : 
                                                    hasPermission("Invoices.pm.open");
  const formatMoney = (value) => Number(value || 0).toFixed(2);
  const [cafeInfo, setCafeInfo] = useState(null);
  const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });
  const showMessage = ({ title, message, type = "info" }) =>setMessageModal({ open: true, title, message, type });

  const ordersChannelRef = useRef(null);
  const selectedOrderRef = useRef(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [deletePressed, setDeletePressed] = useState(false);
  const [printPressed, setPrintPressed] = useState(false);
  const [closePressed, setClosetPressed] = useState(false);
  const [cashierName, setCashierName] = useState("");

  // ── كارت الطاولة ──
  const [servicePercentage, setServicePercentage] = useState(0);
  const [showTables, setShowTables] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [sn, setSn] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [tableAction, setTableAction] = useState(null);
  const boxRef = useRef(null);
  const { tables, fetchTables } = useTables(user?.cafe_id);

  const groups = useGroups(user?.cafe_id);
  const { selectedOrder, setSelectedOrder, openOrders, selectedGroup, setSelectedGroup } = useInvoiceStore();
  const fetchOpenOrders = useInvoiceStore((s) => s.fetchOpenOrders);
  const refreshSelectedOrder = useInvoiceStore((s) => s.refreshSelectedOrder);
  const cancelDiscount = () => {
    setSelectedOrder({
      ...selectedOrder,
      discount: selectedOrder?.discount_before_edit ?? 0,
    });

    pendingDiscountRef.current = null;
    setConfirmOpen(false);
  };
  useEffect(() => { selectedOrderRef.current = selectedOrder; }, [selectedOrder]);

  // ── reset كارت الطاولة لما selectedOrder يتمسح ──
  useEffect(() => {
    if (!selectedOrder) {
      setSn("");
      setSelectedTable("");
      setCaptainName("");
    } else {
      setSn(selectedOrder.order_no || "");
      setSelectedTable(selectedOrder.tables?.table_name || "");
    }
  }, [selectedOrder]);

  // ── جيب اسم الكابتن من captain_id ──
  useEffect(() => {
    const loadCaptain = async () => {
      if (!selectedOrder?.captain_id) { setCaptainName(""); return; }
      const { data } = await supabase.from("users").select("name").eq("id", selectedOrder.captain_id).single();
      setCaptainName(data?.name || "");
    };
    loadCaptain();
  }, [selectedOrder?.captain_id]);

  useEffect(() => {
    const fetchCafe = async () => {
      const { data, error } = await supabase
        .from("cafes")
        .select("service_name_ar, service_percentage, service_name_en, receipt_footer_ar, receipt_footer_en, name")
        .eq("id", user?.cafe_id).single();
      if (!error) {
        setCafeInfo(data);
        setServicePercentage(data.service_percentage || 0);
      }
    };
    if (user?.cafe_id) fetchCafe();
  }, [user?.cafe_id]);

  useEffect(() => { fetchOpenOrders(); }, []);

  useEffect(() => {
    if (!currentShiftType) return;
    if (ordersChannelRef.current) { supabase.removeChannel(ordersChannelRef.current); ordersChannelRef.current = null; }

    const channel = supabase
      .channel(`orders-live-${currentShiftType}-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" },
        async (payload) => {
          const record = payload?.new || payload?.old || {};
          if (user?.cafe_id && record.cafe_id && record.cafe_id !== user.cafe_id) return;
          await fetchOpenOrders();
          const changedId = payload?.new?.id || payload?.old?.id;
          const current = selectedOrderRef.current;
          if (current?.id && current.id === changedId) await refreshSelectedOrder(current.id);
        }
      ).subscribe();

    ordersChannelRef.current = channel;
    return () => { if (ordersChannelRef.current) { supabase.removeChannel(ordersChannelRef.current); ordersChannelRef.current = null; } };
  }, [currentShiftType]);

  useEffect(() => {
    if (!groups || groups.length === 0) return;
    const firstValidGroup = groups.find((g) => g.is_active && g.name?.trim());
    if (firstValidGroup && !selectedGroup) setSelectedGroup(firstValidGroup);
  }, [groups, selectedGroup]);

  useEffect(() => {
    const loadCashier = async () => {
      if (!selectedOrder?.cashier_id) { setCashierName(""); return; }
      const { data } = await supabase.from("users").select("name").eq("id", selectedOrder.cashier_id).single();
      setCashierName(data?.name || "");
    };
    loadCashier();
  }, [selectedOrder?.cashier_id]);

  // ── إغلاق القائمة لما تضغط برة ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowTables(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortedGroups = [...groups]
    .map((g) => ({ ...g, name: g?.name ?? "", is_active: g?.is_active === true, sort_index: g?.sort_index ?? 0 }))
    .sort((a, b) => a.sort_index - b.sort_index)
    .slice(0, 30);

  const formattedDate = currentShiftDate
    ? new Date(currentShiftDate).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "";

  const saveDiscount = async () => {
    if (!selectedOrder?.id) return;
    const nextDiscount = Number(pendingDiscountRef.current ?? selectedOrder.discount ?? 0);
    const { error: discountError } = await supabase.from("orders").update({ discount: nextDiscount }).eq("id", selectedOrder.id);
    if (discountError) { console.error(discountError); return; }
    const { data, error } = await recalculateOrderTotals(selectedOrder.id);
    if (error) { console.error(error); return; }
    setSelectedOrder(data);
    pendingDiscountRef.current = null;
    await fetchOpenOrders();
  };

  return (
    <div style={{ width: "100%", height: "100vh", background: "#99CCFF", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{
        direction: "rtl", height: "48px",
        background: "linear-gradient(180deg, #f8fbff 0%, #99CCFF 70%, #f8fbff 100%)",
        borderBottom: "1px solid #cbd5e1",
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", padding: "0 18px",
        boxShadow: "0 8px 18px rgba(37, 99, 235, 0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-start" }}>
          <button onClick={onBack} title="خروج" style={{
            height: "32px", width: "48px", borderRadius: "10px", background: "#7fc2f0",
            color: currentShiftType === "AM" ? "#ffffff" : "#1a5591",
            fontSize: "18px", fontWeight: "900", cursor: "pointer", padding: "0",
            border: currentShiftType === "AM" ? "1px solid rgba(255,255,255,0.4)" : "1px solid #1a5591",
            boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>❮❮❮</button>
          <div style={{ fontSize: "24px", fontWeight: "800", color: currentShiftType === "AM" ? "#ffffff" : "#1a5591" }}>
            {user?.cafe_name || "GO CAFE"}
          </div>
        </div>
        <div style={{ display: "flex", gap: "40px", justifyContent: "center", color: currentShiftType === "AM" ? "#ffffff" : "#1a5591" }}>
          <div style={{ fontSize: "24px", fontWeight: "700" }}>{currentShiftType === "AM" ? "فواتير صباحية مفتوحة" : "فواتير مسائية مفتوحة"}</div>
          <div style={{ fontSize: "22px", fontWeight: "700" }}>{formattedDate}</div>
        </div>
        <div style={{ textAlign: "left", fontSize: "24px", fontWeight: "700", color: currentShiftType === "AM" ? "#ffffff" : "#1a5591" }}>
          {user?.name}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "row", background: "#99CCFF", overflow: "hidden" }}>

        {/* LEFT */}
        <div style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column" }}>

          {/* كارت العنوان */}
          <div style={{
            background: "#abd2f9", borderRadius: "12px", marginTop: "10px", marginLeft: "10px",
            padding: "8px", display: "flex", flexDirection: "row-reverse", alignItems: "center",
            gap: "10px", boxShadow: "0 8px 18px rgba(37, 99, 235, 0.2)",
          }}>
     
              <div style={{
                display: "flex", flexDirection: "row", alignItems: "center",
                width: "100%", justifyContent: "space-between",padding: "0 12px",
                fontSize: "24px", fontWeight: "900", color: "#306ead", marginRight: "80px",marginLeft: "80px",
                textShadow: `
                  0 0 8px rgba(255,255,255,1),
                  0 0 16px rgba(255,255,255,0.95),
                  0 0 28px rgba(255,255,255,0.9),
                  0 0 40px rgba(255,255,255,0.85)
                `
              }}>
              <>
              <div
                title="دبل كليك لتغيير تاريخ الشيفت"
                onDoubleClick={() => {
                  dateInputRef.current?.showPicker?.();
                }}
                style={{
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {selectedOrder?.order_shift_date || ""}
              </div>

              <input
                ref={dateInputRef}
                type="date"
                value={selectedOrder?.order_shift_date || ""}
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                  width: 1,
                  height: 1,
                }}
                onChange={(e) => {
                  const newDate = e.target.value;

                  if (newDate === selectedOrder?.order_shift_date) return;

                  setPendingShiftDate(newDate);
                  setConfirmType("change_shift_date");
                  setConfirmOpen(true);
                }}
              />
            </>

              <div
                title="دبل كليك لتغيير الشيفت"
                onDoubleClick={() => {
                  setPendingShiftType(selectedOrder?.order_shift_type === "AM" ? "PM" : "AM");
                  setConfirmType("change_shift_type");
                  setConfirmOpen(true);
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                style={{
                  cursor: "pointer",
                  userSelect: "none",
                  fontSize: "24px",
                  fontWeight: "900",
                  color: "#306ead",
                  textShadow: `
                    0 0 8px rgba(255,255,255,1),
                    0 0 16px rgba(255,255,255,0.95),
                    0 0 28px rgba(255,255,255,0.9),
                    0 0 40px rgba(255,255,255,0.85)
                  `,
                }}
              >
                {selectedOrder?.order_shift_type}
              </div>

              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                 title="حذف الفاتورة"
                  disabled={!selectedOrder || !hasPermission("order.delete")}
                  onClick={() => { setConfirmType("delete"); setConfirmOpen(true); }}
                  onMouseDown={() => setDeletePressed(true)}
                  onMouseUp={() => setDeletePressed(false)}
                  onMouseLeave={(e) => { setDeletePressed(false); e.currentTarget.style.transform = "translateY(0px) scale(1)"; }}
                  onMouseEnter={(e) => { if (!deletePressed) e.currentTarget.style.transform = "translateY(-2px) scale(1.03)"; }}
                  style={{
                    height: "48px", width: "48px",
                    background: deletePressed ? "linear-gradient(135deg, #b91c1c, #ef4444)" : "linear-gradient(135deg, #ef4444, #b91c1c)",
                    color: "#fff", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "28px",
                    boxShadow: deletePressed ? "0 3px 10px #f05c5c" : "0 8px 20px #ed6774",
                    transform: deletePressed ? "translateY(2px) scale(0.98)" : "translateY(0px) scale(1)",
                    transition: "0.15s ease", marginLeft: "20px",
                    cursor: selectedOrder && hasPermission("order.delete") ? "pointer" : "not-allowed",
                    opacity: selectedOrder && hasPermission("order.delete") ? 1 : 0.4,
                  }}
                >X</button>

                <button
                  disabled={!canCloseShift}
                  onMouseDown={() => setClosetPressed(true)}
                  onMouseUp={() => setClosetPressed(false)}
                  onMouseLeave={(e) => { setClosetPressed(false); e.currentTarget.style.transform = "translateY(0px) scale(1)"; }}
                  onMouseEnter={(e) => { if (!closePressed) e.currentTarget.style.transform = "translateY(-2px) scale(1.03)"; }}
                  style={{
                    flex: 1, height: "38px", width: "100px", color: "white", border: "none",
                    padding: "8px 10px", borderRadius: "10px", fontWeight: "600", fontSize: "12px",
                    cursor: canCloseShift ? "pointer" : "not-allowed",
                    boxShadow: closePressed ? "0 3px 10px #5383eb" : "0 8px 20px #5c8aeb",
                    background: closePressed ? "linear-gradient(135deg, #1e40af, #2563eb)" : "linear-gradient(135deg, #2563eb, #1e40af)",
                    transform: closePressed ? "scale(0.96)" : "scale(1)",
                    transition: "0.15s ease", opacity: canCloseShift ? 1 : 0.5,
                  }}
                >
                  {currentShiftType === "AM" ? "فواتير صباحية مغلقة" : "فواتير مسائية مغلقة"}
                </button>
              </div>
          
          </div>

          {/* كارت الأصناف */}
          <div style={{
            flex: 1, margin: "10px", marginRight: "0px", padding: 0, border: "none",
            height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "10px",
          }}>
            <InvoiceOrderItemsCard
              selectedOrder={selectedOrder}
              fetchOpenOrders={fetchOpenOrders}
              hasPermission={hasPermission}
              refreshSelectedOrder={refreshSelectedOrder}
            />
          </div>

          {/* كارت المجموع */}
          <div style={{
            height: "140px", background: "#abd2f9", borderRadius: "12px 12px 0px 0px",
            marginLeft: "10px", padding: "0px 8px", display: "flex", flexDirection: "row-reverse",
            alignItems: "center", boxShadow: "0 4px 10px rgba(37, 99, 235, 0.15)",
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <button
                title="طباعة و أغلاق الفاتورة"
                disabled={!selectedOrder || !hasPermission("order.print")}
                onClick={() => { setConfirmType("print"); setConfirmOpen(true); }}
                onMouseDown={() => setPrintPressed(true)}
                onMouseUp={() => setPrintPressed(false)}
                onMouseLeave={(e) => { setPrintPressed(false); e.currentTarget.style.transform = "translateY(0px) scale(1)"; }}
                onMouseEnter={(e) => { if (!printPressed) e.currentTarget.style.transform = "translateY(-2px) scale(1.03)"; }}
                style={{
                  width: "60px", height: "98px", borderRadius: "14px", border: "none",
                  color: "white", fontSize: "34px", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: printPressed ? "0 3px 10px #5383eb" : "0 8px 20px #5c8aeb",
                  background: printPressed ? "linear-gradient(135deg, #1e40af, #2563eb)" : "linear-gradient(135deg, #2563eb, #1e40af)",
                  transform: printPressed ? "scale(0.96)" : "scale(1)", transition: "0.15s ease",
                  cursor: selectedOrder && hasPermission("order.print") ? "pointer" : "not-allowed",
                  opacity: selectedOrder && hasPermission("order.print") ? 1 : 0.4,
                }}
              >🖨️</button>
              <div style={{ display: "flex", gap: "3px" }}>
                {["ar", "en"].map((lang) => (
                  <button 
                   disabled={!selectedOrder || !hasPermission("order.print")}
                   key={lang} 
                   title={`طباعة الفاتورة  ${lang === "ar" ? "عربى" : "إنجليزى"}`}
                   onClick={() => setPrintLang(lang)} 
                   style={{
                    width: "28px", height: "22px", borderRadius: "5px", border: "none",
                    fontSize: "10px", fontWeight: "700", cursor: "pointer",
                    background: printLang === lang ? "#2563eb" : "#cbd5e1",
                    color: printLang === lang ? "#fff" : "#374151",
                    transition: "0.15s ease",
                    cursor: selectedOrder && hasPermission("order.print") ? "pointer" : "not-allowed",
                   opacity: selectedOrder && hasPermission("order.print") ? 1 : 0.4,
                  }}>
                    {lang === "ar" ? "AR" : "EN"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Digital", fontSize: "68px", fontWeight: "900",
              filter: "drop-shadow(0 0 6px rgba(56,189,248,0.6))", letterSpacing: "4px",
              color: "#ffffff", background: "transparent", padding: "8px 18px", borderRadius: "10px",
              textShadow: "0 0 6px rgba(79,91,96,0.9), 0 0 14px rgba(56,189,248,0.7), 0 0 24px rgba(56,189,248,0.5)",
            }}>
              {Math.ceil(selectedOrder?.total_amount || 0).toFixed(2)}
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px", justifyContent: "center" }}>
              <div style={rowStyle}>
                <span style={labelStyle}>المجموع</span>
                <span style={valueBox}>{formatMoney(selectedOrder?.subtotal)}</span>
              </div>
              <div style={rowStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={styles.switch}>
                    <input
                      type="checkbox"
                      checked={selectedOrder?.is_take_away || false}
                      disabled={!selectedOrder || !hasPermission("order.service")}
                      onChange={async (e) => {
                        if (!hasPermission("order.service")) return;
                        const value = e.target.checked;
                        setSelectedOrder({ ...selectedOrder, is_take_away: value });
                        const { error } = await supabase.from("orders").update({ is_take_away: value }).eq("id", selectedOrder.id);
                        if (error) { console.error(error); return; }
                        const { data: updatedOrder, error: totalsError } = await recalculateOrderTotals(selectedOrder.id);
                        if (totalsError) { console.error(totalsError); return; }
                        setSelectedOrder(updatedOrder);
                        await fetchOpenOrders();
                      }}
                    />
                    <span 
                    title={selectedOrder?.is_take_away ? `تفعيل ${cafeInfo?.service_name_ar}` : `إلغاء ${cafeInfo?.service_name_ar}`}
                    style={{
                      ...styles.slider,
                      background: selectedOrder?.is_take_away ? "#ef4444" : "#22c55e",
                      cursor: selectedOrder && hasPermission("order.service") ? "pointer" : "not-allowed",
                      opacity: selectedOrder && hasPermission("order.service") ? 1 : 0.4,
                    }}>
                      <span style={{ ...styles.switchCircle, transform: selectedOrder?.is_take_away ? "translateX(16px)" : "translateX(0px)" }} />
                    </span>
                  </label>
                  <span style={labelStyle}>
                    {selectedOrder?.is_take_away
                      ? "تيك أواي"
                      : `%${
                          selectedOrder?.order_service_percentage ??
                          cafeInfo?.service_percentage
                        } ${cafeInfo?.service_name_ar}`
                    }
                  </span>
                </div>
                <span style={{ ...valueBox, color: selectedOrder?.is_take_away ? "#ef4444" : valueBox.color }}>
                  {formatMoney(selectedOrder?.service_amount)}
                </span>
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}> الخصم</span>
                <input
                  title="إدخل قيمة الخصم"
                  disabled={!selectedOrder || !hasPermission("order.discount")}
                  type="number" 
                  placeholder="00.00"
                  value={
                    discountFocused
                      ? (selectedOrder?.discount ?? "")
                      : (!selectedOrder?.discount || Number(selectedOrder.discount) === 0
                          ? ""
                          : Number(selectedOrder.discount).toFixed(2))
                  }
                  onFocus={(e) => {
                    setDiscountFocused(true);
                    const target = e.target;
                    setTimeout(() => target.select(), 0);
                  }}
                  onBlur={() => setDiscountFocused(false)}
                  onChange={(e) =>setSelectedOrder({...selectedOrder,discount: e.target.value,})}

                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    if (!hasPermission("order.discount") || !selectedOrder?.id) return;
                    const newDiscount = Number(selectedOrder?.discount || 0);
                    const subtotal = Number(selectedOrder?.subtotal || 0);
                    if (newDiscount < 0) return;
                    if (newDiscount > subtotal) {
                      showMessage({ title: "خطأ في الخصم", message: "الخصم لا يمكن أن يكون أكبر من إجمالي الفاتورة", type: "error" });
                      return;
                    }
                    const oldDiscount = Number(selectedOrder?.discount_before_edit ?? selectedOrder?.discount);
                    if (newDiscount === oldDiscount) return;
                    pendingDiscountRef.current = newDiscount;
                    setConfirmType("discount");
                    setConfirmOpen(true);
                  }}
                  style={{
                    ...discountBox,
                    cursor: selectedOrder && hasPermission("order.discount") ? "text" : "not-allowed",
                    opacity: selectedOrder && hasPermission("order.discount") ? 1 : 0.4,
                  }}
                />
              </div>
              <div style={rowStyle}>
                <span style={{ ...labelStyle, fontWeight: "900", color: "#1d4ed8" }}>الإجمالي</span>
                <span style={{ ...valueBox, background: "#1d4ed8", color: "white" }}>
                  {formatMoney(selectedOrder?.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* كارت التفقيط */}
          <div style={{
            height: "24px", background: "#abd2f9", borderRadius: "0px 0px 12px 12px",
            marginLeft: "10px", padding: "0px 12px", display: "flex", flexDirection: "row-reverse",
            alignItems: "center", boxShadow: "0 4px 10px rgba(37, 99, 235, 0.15)",
          }}>
            <div style={{ fontSize: "15px", fontWeight: "800", color: "#4791dc" }}>{cashierName || ""}</div>
            <div style={{
              flex: 1, fontSize: "14px", fontWeight: "700", color: "#1d4ed8",
              textAlign: "left", paddingLeft: "10px",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {tafqeetArabic(selectedOrder?.total_amount)}
            </div>
          </div>
        </div>


        {/* CENTER - قائمة الفواتير */}


<div
  style={{
    width: "100px",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box",
          alignItems: "center",
      justifyContent: "center",
  }}
>
  {/* رقم الطاولة */}

    <div
      style={{
        ...styles.item,
        height: "50px",
        fontWeight: "900",
        fontSize: "48px",
        fontFamily: "Digital",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: "drop-shadow(0 0 6px rgba(56,189,248,0.6))",
        letterSpacing: "1px",
        color: "#ffffff",
        background: "transparent",
        padding: "2px 4px",
        borderRadius: "10px",
        textShadow:
          "0 0 6px rgba(79,91,96,0.9), 0 0 14px rgba(56,189,248,0.7), 0 0 24px rgba(56,189,248,0.5)",
      }}
    >
      {selectedOrder?.tables?.table_name || "\u00A0"}
    </div>

  {/* قائمة الفواتير */}
  <div
    style={{
      background: "#6ab5ff",
      borderRadius: "12px",
      padding: "8px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      boxShadow: "0 8px 18px rgba(37, 99, 235, 0.2)",
      width: "100%",
    }}
  >
{openOrders.map((order) => {
  const isDifferentShift =
    order.order_shift_date !== currentShiftDate ||
    order.order_shift_type !== currentShiftType;

  return (
    <button
      title={isDifferentShift
        ? `  ${order.order_shift_type} - ${order.order_shift_date} طاولة من الشيفت`
        : "طاولات الشيفت"}
      key={order.id}
      onClick={async () => {
        const freshOrder = await refreshSelectedOrder(order.id);
        setSelectedOrder({
          ...(freshOrder || order),
          discount_before_edit: (freshOrder || order).discount,
        });
      }}
      style={{
        width: "100%",
        height: "30px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        background:
          selectedOrder?.id === order.id
            ? isDifferentShift
              ? "#dc2626"
              : "#2563eb"
            : isDifferentShift
            ? "#fee2e2"
            : "#dbeafe",

        color:
          selectedOrder?.id === order.id
            ? "#fff"
            : isDifferentShift
            ? "#b91c1c"
            : "#000",

                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      {order.tables?.table_name}
    </button>
  );
})}


  </div>
</div>

        {/* RIGHT - كارت الطاولة + الأصناف */}
         <div style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column" }}>

          {/* ── كارت إنشاء/نقل الطاولة ── */}
          <div style={{
            background: "#abd2f9", borderRadius: "12px", marginTop: "10px", marginRight: "10px",
            padding: "8px", display: "flex", flexDirection: "row-reverse", alignItems: "center",
            gap: "10px", boxShadow: "0 8px 18px rgba(37, 99, 235, 0.2)",
          }}>

            
            {/* زر + */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>

            {/* قائمة الطاولات */}
            <div ref={boxRef} style={{ position: "relative", width: "100px" }}>
              <input
                title="الطاولات المتاحة"
                type="text" value={selectedTable} placeholder="طاولة" readOnly
                onClick={() => {
                  if (!selectedOrder?.id) return;
                  setTableAction("move");
                  setShowTables((prev) => !prev);
                }}
                style={{
                  width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #ccc",
                  textAlign: "center", fontWeight: "800", fontSize: "16px",
                  padding: "0 28px 0 6px", outline: "none", background: "#fff",
                  boxShadow: "0 8px 20px #5c8aeb",
                }}
              />
              <div
                onClick={() => { if (!selectedOrder?.id) return; setTableAction("move"); setShowTables((prev) => !prev); }}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#555", cursor: "pointer", userSelect: "none" }}
              >
                {showTables ? "▲" : "▼"}
              </div>

              {showTables && (
                <div style={{
                  position: "absolute", top: "42px", right: 0, width: "100%",
                  background: "#fff", border: "1px solid #ccc", zIndex: 1000,
                  maxHeight: "70vh", overflowY: "auto", display: "flex", flexDirection: "column",
                  borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", paddingBottom: "28px",
                }}>
                  {tables
                    .filter((t) => {
                      if (t.is_used) return false;
                      if (currentShiftType === "AM") return t.captain_id_am;
                      if (currentShiftType === "PM") return t.captain_id_pm;
                      return true;
                    })
                    .map((t) => (
                      <div
                        key={t.id}
                        onClick={async () => {
                          try {
                            // ── نقل الطاولة ──
                            if (tableAction === "move" && selectedOrder?.id) {
                              await supabase.from("tables").update({ is_used: true }).eq("id", t.id);
                              await supabase.from("orders").update({ table_id: t.id }).eq("id", selectedOrder.id);
                              await supabase.from("tables").update({ is_used: false }).eq("id", selectedOrder.table_id);
                              setSelectedOrder({ ...selectedOrder, table_id: t.id, tables: { table_name: t.table_name } });
                              setSelectedTable(t.table_name || "");
                              if (fetchTables) await fetchTables();
                              await fetchOpenOrders();
                              setShowTables(false); setTableAction(null);
                              return;
                            }

                            // ── إنشاء فاتورة جديدة ──
                            const captainId = currentShiftType === "AM" ? t.captain_id_am : t.captain_id_pm;
                            const { data: lastOrder } = await supabase
                              .from("orders").select("order_no")
                              .eq("cafe_id", user?.cafe_id).eq("order_shift_type", currentShiftType)
                              .eq("order_shift_date", currentShiftDate)
                              .order("order_no", { ascending: false }).limit(1).single();

                            const nextOrderNo = (lastOrder?.order_no || 0) + 1;

                            const { data, error } = await supabase.from("orders").insert([{
                              cafe_id: user?.cafe_id, order_no: nextOrderNo,
                              table_id: t.id, cashier_id: user?.id, captain_id: captainId,
                              order_shift_type: currentShiftType, order_shift_date: currentShiftDate,
                              start_time: new Date(), end_time: null, is_closed: false, is_take_away: false,
                              discount: 0, subtotal: 0, order_service_percentage: servicePercentage,
                              service_amount: 0, total_amount: 0, reopen_count: 0,
                            }]).select().single();

                            if (error) { console.error(error); return; }

                            await supabase.from("tables").update({ is_used: true }).eq("id", t.id);
                            if (fetchTables) fetchTables();
                            await fetchOpenOrders(currentShiftType);

                            setSelectedOrder({ ...data, tables: { table_name: t.table_name } });
                            setShowTables(false); setTableAction(null);
                          } catch (err) { console.error(err); }
                        }}
                        style={{
                          padding: "2px", margin: "2px", textAlign: "center", cursor: "pointer",
                          background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "10px",
                          fontWeight: "700", transition: "0.15s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.transform = "scale(1.02)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.transform = "scale(1)"; }}
                      >
                        {t.table_name}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <button
             title="أضافة الفاتورة"
              disabled={ !hasPermission("order.add")}
              onClick={() => {
                if (!hasPermission("order.add")) return;
                setTableAction("create");
                setSelectedOrder(null);
                setShowTables(true);
              }}
              style={{
                height: "48px",
                width: "48px",
                borderRadius: "8px",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                background: !hasPermission("order.add")
                  ? "#5988ee"
                  : "linear-gradient(135deg, #2563eb, #1e40af)",

                boxShadow: "0 8px 20px #5c8aeb",
                color: "#fff",
                fontWeight: "700",
                fontSize: "46px",

                lineHeight: 1,

                cursor: !hasPermission("order.add")
                  ? "not-allowed"
                  : "pointer",

                opacity: !hasPermission("order.add") ? 0.5 : 1,
                marginRight: "20px",
              }}
            >+</button>
   </div>
          

            {/* اسم الكابتن + SN */}
            <div style={{ 
                 display: "flex", flexDirection: "row", alignItems: "center",
                width: "100%", justifyContent: "space-between",padding: "0 12px",
                fontSize: "24px", fontWeight: "900", color: "#306ead", 
                textShadow: `
                  0 0 8px rgba(255,255,255,1),
                  0 0 16px rgba(255,255,255,0.95),
                  0 0 28px rgba(255,255,255,0.9),
                  0 0 40px rgba(255,255,255,0.85)
                `
               }}>
              <span  
               title="مسلسل الفاتورة"
               style={{ color: "#94c7fa" }}>{sn} </span>
        
              <span
              title="وقت فتح الفاتورة"
              >{selectedOrder?.start_time
              ? new Date(selectedOrder.start_time).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", hour12: true }).replace("AM","ص").replace("PM","م")
              : ""}
              </span>

              <span 
                title="اسم الكابتن"
                > {captainName}</span>
            </div>
          </div>

          {/* شبكة الأصناف */}
          <InvoiceItemsSection
            cafeId={user?.cafe_id}
            selectedGroup={selectedGroup}
            selectedOrder={selectedOrder}
            permissions={permissions}
          />
        </div>
      </div>

      {/* مجموعات الأصناف */}
      <div style={{ height: "110px", background: "#99CCFF", marginBottom: "8px", padding: "6px", direction: "rtl" }}>
<InvoiceGroupsSection
  sortedGroups={sortedGroups}
  selectedGroup={selectedGroup}
  setSelectedGroup={setSelectedGroup}
/>

        <MessageModal
          open={messageModal.open} title={messageModal.title}
          message={messageModal.message} type={messageModal.type}
          onClose={() => setMessageModal((prev) => ({ ...prev, open: false }))}
        />

        <ConfirmModal
          open={confirmOpen}
          title={
            confirmType === "delete"? "حذف الفاتورة"
            : confirmType === "print"? "طباعة و إغلاق الفاتورة"
            : confirmType === "discount"? "تأكيد الخصم"
            : confirmType === "change_shift_type"? "تغيير الشيفت"
            : confirmType === "change_shift_date"? "تغيير التاريخ "
            : ""
          }     
          message={
 ""
          }
          confirmText={
            confirmType === "delete"? "حذف"
              : confirmType === "print"? "طباعة"
              : confirmType === "discount"? "حفظ"
              : confirmType === "change_shift_type"? "تغيير"
              : confirmType === "change_shift_date"? "تغيير"
              : "موافق"
          }
          cancelText="إلغاء"
          onCancel={() => {
              if (confirmType === "discount" && selectedOrder) {
                setSelectedOrder({
                  ...selectedOrder,
                  discount: selectedOrder.discount_before_edit ?? 0,
                });
              }

              pendingDiscountRef.current = null;
              setConfirmOpen(false);
              setConfirmType(null);
            }}
            onConfirm={async () => {
            if (confirmType === "delete") {
              if (!selectedOrder?.id) return;
              const items = useInvoiceStore.getState().orderItems;
              if (items.length > 0) {
                showMessage({ title: "لا يمكن الحذف", message: "الفاتورة تحتوي على أصناف، قم بإزالة الأصناف أولاً", type: "error" });
                setConfirmOpen(false); setConfirmType(null); return;
              }
              const { error } = await supabase.from("orders").delete().eq("id", selectedOrder.id);
              if (error) { console.error(error); showMessage({ title: "خطأ", message: "حدث خطأ أثناء حذف الفاتورة", type: "error" }); return; }
              if (selectedOrder.table_id) await supabase.from("tables").update({ is_used: false }).eq("id", selectedOrder.table_id);
              setSelectedOrder(null);
              useInvoiceStore.setState({ orderItems: [] });
              await fetchOpenOrders(currentShiftType);
            }

            if (confirmType === "print") {
              await printOrder({
                selectedOrder,
                orderItems: useInvoiceStore.getState().orderItems,
                cafeInfo, cashierName, lang: printLang,
                onDone: async () => {
                  setSelectedOrder(null);
                  useInvoiceStore.setState({ orderItems: [] });
                  await fetchOpenOrders(currentShiftType);
                },
              });
            }

            if (confirmType === "discount") await saveDiscount();

            if (confirmType === "change_shift_type") {
              const { error } = await supabase
                .from("orders")
                .update({
                  order_shift_type: pendingShiftType,
                })
                .eq("id", selectedOrder.id);

              if (!error) {
                const freshOrder = await refreshSelectedOrder(selectedOrder.id);

                if (freshOrder) {
                  setSelectedOrder(freshOrder);
                }
              }
            }

            if (confirmType === "change_shift_date") {
                const { error } = await supabase
                  .from("orders")
                  .update({
                    order_shift_date: pendingShiftDate,
                  })
                  .eq("id", selectedOrder.id);

                if (!error) {
                  const freshOrder = await refreshSelectedOrder(selectedOrder.id);

                  if (freshOrder) {
                    setSelectedOrder(freshOrder);
                  }
                }
              }
                        setConfirmOpen(false); setConfirmType(null);
                      }}
                    />
                  </div>
                </div>
              );
            }

const styles = {
  row: { display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: "12px", width: "100%" },
  item: { padding: "6px 10px", background: "#f5f5f5", borderRadius: "6px", fontSize: "14px", whiteSpace: "nowrap" },
  switch: { position: "relative", display: "inline-block", width: "34px", height: "18px" },
  slider: { position: "absolute", inset: 0, cursor: "pointer", borderRadius: "999px", transition: "0.3s" },
  switchCircle: { position: "absolute", width: "14px", height: "14px", left: "2px", top: "2px", borderRadius: "50%", background: "#fff", transition: "0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" },
};

const rowStyle = { display: "flex", flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", lineHeight: "1", gap: "14px", padding: "1px 0" };
const labelStyle = { fontSize: "16px", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap" };
const valueBox = { width: "130px", height: "28px", background: "#e0f2fe", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900", color: "#1d4ed8", padding: "0 6px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" };
const discountBox = { width: "130px", height: "30px", textAlign: "center", background: "#fff7ed", border: "1px solid #1b23b5", borderRadius: "6px", fontSize: "17px", fontWeight: "600", color: "#0c2ac2", outline: "none", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)" };