import { useState, useEffect, useRef } from "react";
import { useInvoiceStore } from "./features/invoices/store/invoiceStore";
import { supabase } from "./supabase";
import ClosedInvoiceOrderItemsCard from "./components/ClosedInvoiceOrderItemsCard";
import ConfirmModal from "./ConfirmModal";
import { printOrder } from "./utils/printOrder";

export default function ClosedInvoicesPage({user,onBack,currentShiftDate,currentShiftType,permissions = [],
}) {
  
const formattedDate = currentShiftDate
  ? new Date(currentShiftDate).toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  : "";

const [selectedShift, setSelectedShift] = useState(currentShiftType);
const [fromDate, setFromDate] = useState(currentShiftDate);
const [toDate, setToDate] = useState(currentShiftDate);

const closedOrders = useInvoiceStore((s) => s.closedOrders);
const selectedOrder = useInvoiceStore((s) => s.selectedOrder);
const setSelectedOrder = useInvoiceStore((s) => s.setSelectedOrder);
const refreshSelectedOrder = useInvoiceStore((s) => s.refreshSelectedOrder);
const loadOrderItems = useInvoiceStore((s) => s.loadOrderItems);

const [tableSearch, setTableSearch] = useState("");
const [orderNoSearch, setOrderNoSearch] = useState("");

const fetchClosedOrders = useInvoiceStore((s) => s.fetchClosedOrders);
const ordersChannelRef = useRef(null);
const hasPermission = (key) => permissions?.includes(key);

const formatTime = (value) =>value? new Date(value)
        .toLocaleTimeString("ar-EG", { hour: "2-digit",minute: "2-digit",hour12: true,})
        .replace("AM", "ص")
        .replace("PM", "م")
    : "";

const serviceLabel =selectedOrder?.service_name_ar && selectedOrder?.order_service_percentage
    ? `${selectedOrder.service_name_ar} (${selectedOrder.order_service_percentage}%)`: "الخدمة";

const [captainName, setCaptainName] = useState("");
  useEffect(() => {
    const loadCaptain = async () => {
      if (!selectedOrder?.captain_id) { setCaptainName(""); return; }
      const { data } = await supabase.from("users").select("name").eq("id", selectedOrder.captain_id).single();
      setCaptainName(data?.name || "");
    };loadCaptain();
  }, [selectedOrder?.captain_id]);

const [cashierName, setCashierName] = useState("");
    useEffect(() => {
      const loadCashier = async () => {
        if (!selectedOrder?.cashier_id) { setCashierName(""); return; }
        const { data } = await supabase.from("users").select("name").eq("id", selectedOrder.cashier_id).single();
        setCashierName(data?.name || "");
      };
      loadCashier();
    }, [selectedOrder?.cashier_id]);

const [cafeInfo, setCafeInfo] = useState({});
      useEffect(() => {
        const fetchCafe = async () => {
          const { data, error } = await supabase
            .from("cafes")
            .select("service_name_ar")
            .eq("id", user?.cafe_id).single();
          if (!error) {
            setCafeInfo(data);
            
          }
        };
        if (user?.cafe_id) fetchCafe();
      }, [user?.cafe_id]);
 const fetchOpenOrders = useInvoiceStore((s) => s.fetchOpenOrders);    
useEffect(() => {
  if (!currentShiftDate || !currentShiftType) return;
  fetchClosedOrders(currentShiftDate, currentShiftType);
}, [currentShiftDate, currentShiftType]);

useEffect(() => {
  if (!currentShiftDate || !currentShiftType) return;
  if (ordersChannelRef.current) {
    supabase.removeChannel(ordersChannelRef.current);
    ordersChannelRef.current = null;
  }

  const channel = supabase
    .channel(`closed-orders-${currentShiftType}-${Date.now()}`)
    .on("postgres_changes",{event: "*",schema: "public",table: "orders",},
      async (payload) => {
        const record = payload?.new || payload?.old || {};
        if ( record.order_shift_date === currentShiftDate &&
             record.order_shift_type === currentShiftType ) {
          await fetchClosedOrders(currentShiftDate,currentShiftType);
        }
        const changedId =payload?.new?.id || payload?.old?.id;
        if (selectedOrder?.id && selectedOrder.id === changedId) {
          const fresh =await refreshSelectedOrder(changedId);setSelectedOrder(fresh);
        }
      }
    ).subscribe();
  ordersChannelRef.current = channel;

  return () => {
    if (ordersChannelRef.current) 
    {
      supabase.removeChannel(ordersChannelRef.current);ordersChannelRef.current = null;
    }
  };
}, [currentShiftDate, currentShiftType]);

const [confirmOpen, setConfirmOpen] = useState(false);
const [confirmType, setConfirmType] = useState("");

const [printLang, setPrintLang] = useState("ar");

const formatMoney = (v) => Number(v || 0).toFixed(2);


  return (
    <div style={{width: "100%",height: "100vh",background: "rgb(57, 106, 156)",}}>

  {/* الهيدر */}
      <div style={{
        direction: "rtl", height: "48px",
        background: "linear-gradient(180deg, #99CCFF 0%, #99CCFF 70%, #f8fbff 100%)",
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
          <div style={{ fontSize: "24px", fontWeight: "700" }}>{currentShiftType === "AM" ? "فواتير صباحية مغلقة" : "فواتير مسائية مغلقة"}</div>
          <div style={{ fontSize: "22px", fontWeight: "700" }}>{formattedDate}</div>
        </div>
        <div style={{ textAlign: "left", fontSize: "24px", fontWeight: "700", color: currentShiftType === "AM" ? "#ffffff" : "#1a5591" }}>
          {user?.name}
        </div>
      </div>


<div
  style={{
    height: "calc(100vh - 58px)",
    display: "flex",
    flexDirection: "row-reverse",
    gap: "10px",
    padding: "10px",
    overflow: "hidden",
  }}
>

{/* الطاولات - قائمة الفواتير */}
<div
  style={{
    width: "240px",   // 👈 هنا الحل الحقيقي
    height: "100%",
    background: "#6ab5ff",
    borderRadius: "12px",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    overflowY: "auto",
    boxShadow: "0 8px 18px #111314",
  }}
>
<div
  style={{
    display: "flex",
    gap: "6px",
    marginBottom: "8px",
    alignItems: "center",
    width: "100%",
  }}
>
  {/* Clear Button */}
  <button
    onClick={() => {
      setTableSearch("");
      setOrderNoSearch("");
    }}
    title="مسح البحث"
    style={{
      width: "30px",
      height: "30px",
      borderRadius: "8px",
      border: "none",
      background: "#ef4444",
      color: "#fff",
      fontWeight: "900",
      fontSize: "16px",
      cursor: "pointer",
      flexShrink: 0,
    }}
  >
    ✕
  </button>

  {/* Table Search */}
  <input
    placeholder="طاولة"
    value={tableSearch}
    onChange={(e) => setTableSearch(e.target.value)}
    style={{
      flex: 1,
      minWidth: 0,
      height: "30px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      padding: "0 6px",
      fontWeight: "700",
      fontSize: "13px",
      textAlign: "center",
    }}
  />

  {/* Order No Search */}
  <input
    placeholder="مسلسل"
    value={orderNoSearch}
    onChange={(e) => setOrderNoSearch(e.target.value)}
    style={{
      flex: 1,
      minWidth: 0,
      height: "30px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      padding: "0 10px",
      fontWeight: "700",
      fontSize: "13px",
      textAlign: "right",
    }}
  />
</div>

  {closedOrders
    ?.filter((order) => {
      const tableName = order.tables?.table_name || "";
      const orderNo = String(order.order_no || "");

      return (
        tableName.toLowerCase().includes(tableSearch.toLowerCase()) &&
        orderNo.includes(orderNoSearch)
      );
    })
    .map((order) => {
      const isSelected = selectedOrder?.id === order.id;

      return (
        <div
          key={order.id}
          onClick={async () => {
            const freshOrder = await refreshSelectedOrder(order.id);
            setSelectedOrder(freshOrder || order);
          }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "38px",
            padding: "2px 10px 2px 60px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: isSelected ? "#2563eb" : "#dbeafe",
            color: isSelected ? "#fff" : "#000",
            fontWeight: "800",
            cursor: "pointer",
            transition: "0.2s",
            width: "100% - 20px",
            
          }}
        >
          {/* Table Name */}
            <div style={{ flex: 1 }}>
            <span
                style={{
                fontSize: "22px",   // 👈 كبرناها
                fontWeight: "900",
                letterSpacing: "0.3px",
               
                }}
            >
                {order.tables?.table_name}
            </span>
            </div>

                    {/* Order No */}
            <div
            style={{
                width: "40px",
                textAlign: "right",
                fontSize: "15px",
                fontWeight: "800",
                opacity: 0.9,
            }}
            >
            {order.order_no}
            </div>
        </div>
      );
    })}
</div>



  {/* تفاصيل الفاتورة */}
  <div
    style={{
    width: "480px",
    height: "100%",
    background: "#6ab5ff",
    borderRadius: "12px",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
   
    overflowY: "auto",
    boxShadow: "0 8px 18px #111314",
    }}
  >
<div
  style={{
    height: "100%",
    display: "flex",
    flexDirection: "column",
    
  }}
>

{/* رقم الطاولة الكبير */}
<div
  style={{
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
    borderRadius: "10px",
    boxShadow: "0 8px 18px #111314",
    marginBottom: "12px",
    textShadow: "0 0 6px rgba(15, 73, 131, 0.9), 0 0 14px rgba(15, 73, 131, 0.9), 0 0 24px rgba(15, 73, 131, 0.9)",
    letterSpacing: "4px",

  }}
>
  {selectedOrder?.tables?.table_name || "\u00A0"}
</div>

{/* البيانات */}
<div
style={{
flex:1,
background:"#d9ebff",
borderRadius:"12px",
padding:"10px 14px",
display:"flex",
flexDirection:"column",
gap:"2px",
overflowY:"auto",
marginRight:"18px",
marginLeft:"18px",

}}
>

{[
[ selectedOrder?.tables?.table_name," : رقم الطاولة"],
[ selectedOrder?.order_no," : المسلسل"],
[ selectedOrder?.order_shift_type," : نوع الشيفت"  ],
[selectedOrder?.order_shift_date
   ? new Date(selectedOrder.order_shift_date).toLocaleDateString("ar-EG"): ""," : التاريخ"],

[captainName," : الكابتن"],
[formatTime(selectedOrder?.start_time)," : وقت الدخول"],
[formatTime(selectedOrder?.end_time)," : وقت الخروج",],
[cashierName," : الكاشير"],
[Number(selectedOrder?.subtotal||0).toFixed(2)," : المجموع"],
[
  Number(selectedOrder?.service_amount || 0).toFixed(2),
  selectedOrder?.is_take_away
    ? " : تيك أواي"
    : ` : %${
        selectedOrder?.order_service_percentage ??
        cafeInfo?.service_percentage
      } ${cafeInfo?.service_name_ar}`
],

[Number(selectedOrder?.discount||0).toFixed(2)," : الخصم"],

[Number(selectedOrder?.total_amount||0).toFixed(2)," : الإجمالى"],

[selectedOrder?.reopen_count ?? 0," : عدد مرات فتح الفاتورة",],
].map(([label,value], index)=>(
<div
key={`${value}-${index}`}
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"8px 4px",
borderBottom:"1px dashed rgba(0,0,0,.15)",
minHeight:"34px",
}}
>

<div
style={{
fontWeight:"900",
fontSize:"18px",
color:"#1a5591",
textAlign:"right",
}}
>
{label}
</div>

<div
style={{
fontWeight:"700",
fontSize:"18px",
color:"#111827",
textAlign:"left",
}}
>
{value || "—"}
</div>

</div>

))}

</div>

{/* الإجمالى الكبير */}
<div
style={{
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
    borderRadius: "10px",
    boxShadow: "0 8px 18px #111314",
    marginTop: "12px",
    textShadow: "0 0 6px rgba(15, 73, 131, 0.9), 0 0 14px rgba(15, 73, 131, 0.9), 0 0 24px rgba(15, 73, 131, 0.9)",
    letterSpacing: "4px",
}}
>
   {Math.ceil(selectedOrder?.total_amount || 0).toFixed(2)}
</div>

</div>
  </div>



  {/* العمود الكبير */}
  <div
    style={{
      flex: 1,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }}
  >

    {/* البحث */}

{/* البحث */}
<div
  style={{
    height: "70px",
    background: "#abd2f9",
    borderRadius: "12px",
    boxShadow: "0 8px 18px rgba(37,99,235,.2)",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    direction: "rtl",
  }}
>

<select
value={selectedShift}
onChange={(e)=>setSelectedShift(e.target.value)}
style={{
width:"120px",
height:"38px",
borderRadius:"8px",
fontWeight:"700",
}}
>
<option value="ALL">ALL</option>
<option value="AM">AM</option>
<option value="PM">PM</option>
</select>

<input
type="date"
value={fromDate || ""}
onChange={(e)=>setFromDate(e.target.value)}
style={{
height:"38px",
borderRadius:"8px",
padding:"0 10px",
}}
/>

<input
type="date"
value={toDate || ""}
onChange={(e)=>setToDate(e.target.value)}
style={{
height:"38px",
borderRadius:"8px",
padding:"0 10px",
}}
/>

<button
onClick={async()=>{

await fetchClosedOrders(
fromDate,
toDate,
selectedShift
);

}}
style={{
height:"38px",
padding:"0 16px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"8px",
fontWeight:"800",
cursor:"pointer",
}}
>
بحث
</button>

<button
onClick={async()=>{

setSelectedShift(currentShiftType);
setFromDate(currentShiftDate);
setToDate(currentShiftDate);

await fetchClosedOrders(
currentShiftDate,
currentShiftDate,
currentShiftType
);

}}
style={{
height:"38px",
padding:"0 16px",
background:"#ef4444",
color:"#fff",
border:"none",
borderRadius:"8px",
fontWeight:"800",
cursor:"pointer",
}}
>
حذف الفلتر
</button>

</div>


    {/* الأصناف */}
    <div
      style={{
        flex: 1,
        background: "#6ab5ff",
        borderRadius: "12px",
        boxShadow: "0 8px 18px #111314",
        padding: "8px",

      }}
    >
            <ClosedInvoiceOrderItemsCard
              selectedOrder={selectedOrder}
              fetchClosedOrders={fetchClosedOrders}
              hasPermission={hasPermission}
              refreshSelectedOrder={refreshSelectedOrder}

            />
    </div>


{/* الإجمالى */}

{/* كارت المجموع - الفواتير المغلقة */}

<div
  style={{
    height: "140px",
    background: "#6ab5ff",
    borderRadius: "12px 12px 0px 0px",
    padding: "8px",
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.15)",
  }}
>

  {/* أزرار */}
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "6px",
    }}
  >

    {/* طباعة */}
    <button
      title="طباعة الفاتورة"
      disabled={!selectedOrder || !hasPermission("closed.print")}
      onClick={() => {
        setConfirmType("print");
        setConfirmOpen(true);
      }}
      style={{
        width: "60px",
        height: "70px",
        borderRadius: "14px",
        border: "none",
        background:"linear-gradient(135deg,#2563eb,#1e40af)",
        color: "#fff",
        fontSize: "32px",
        cursor:selectedOrder &&hasPermission("closed.print")? "pointer": "not-allowed",
        opacity:selectedOrder &&hasPermission("closed.print")? 1: .4,
      }}
    >
      🖨️
    </button>

    {/* لغة الطباعة */}
    <div style={{ display: "flex", gap: 4 }}>
      {["ar", "en"].map((lang) => (
        <button
          key={lang}
          disabled={!selectedOrder}
          onClick={() => setPrintLang(lang)}
          style={{
          width: "28px", height: "22px", borderRadius: "5px", border: "none",
          fontSize: "10px", fontWeight: "700", cursor: "pointer",
          background: printLang === lang ? "#2563eb" : "#cbd5e1",
          color: printLang === lang ? "#fff" : "#374151",
          transition: "0.15s ease",
          cursor: selectedOrder && hasPermission("closed.print") ? "pointer" : "not-allowed",
          opacity: selectedOrder && hasPermission("closed.print") ? 1 : 0.4,
        }}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
    {/* إعادة فتح */}
    <button
      title="إعادة فتح الفاتورة"
      disabled={!selectedOrder ||!hasPermission("closed.reopen")}
      onClick={() => {setConfirmType("reopen");setConfirmOpen(true);}}
      style={{
        width: "60px",
        height: "28px",
        borderRadius: "8px",
        border: "none",
        background: "#f50b0b",
        color: "#fff",
        fontWeight: "800",
        cursor:selectedOrder &&hasPermission("closed.reopen")? "pointer": "not-allowed",
        opacity:selectedOrder &&hasPermission("closed.reopen")? 1: .4,
      }}
    >
      ↺ فتح
    </button>
  </div>

  {/* الإجمالي الكبير */}
  <div
    style={{
      flex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "68px",
      fontFamily: "Digital",
      color: "#fff",
      fontWeight: "900",
      textShadow: "0 0 6px rgba(15, 73, 131, 0.9), 0 0 14px rgba(15, 73, 131, 0.9), 0 0 24px rgba(15, 73, 131, 0.9)",
      letterSpacing: "4px",
    }}>
    {Math.ceil( selectedOrder?.total_amount || 0 ).toFixed(2)}
  </div>

  {/* البيانات */}
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    }}
  >

    <div style={rowStyle}>
      <span style={labelStyle}> المجموع </span>
      <span style={{...valueBox ,borderRadius: "10px 10px 0px 0px"}}> {formatMoney( selectedOrder?.subtotal )} </span>

    </div>

    <div style={rowStyle}>
      <span style={labelStyle}>{selectedOrder?.is_take_away? "تيك أواي": `%${
        selectedOrder?.order_service_percentage || 0} ${cafeInfo?.service_name_ar}`}
      </span>
      <span style={{...valueBox ,borderRadius: "0px", color:selectedOrder?.is_take_away? "#ef4444": valueBox.color,}}>
        {formatMoney(selectedOrder?.service_amount)}
      </span>
    </div>

    <div style={rowStyle}>
      <span style={labelStyle}> الخصم </span>
      <div style={{ ...valueBox ,borderRadius: "0px", display: "flex", justifyContent: "center",alignItems: "center", }} >
        {formatMoney( selectedOrder?.discount)}
      </div>
  
    </div>

    <div style={rowStyle}>
      <span style={{ ...labelStyle,color: "#1d4ed8",}}> الإجمالي </span>
      <span style={{...valueBox ,borderRadius: "0px 0px 10px 10px",background: "#1d4ed8", color: "#fff",}}>
        {formatMoney( selectedOrder?.total_amount)}
      </span>
    </div>

  </div>

</div>


          {/* كارت التفقيط */}

  </div>
</div>
<ConfirmModal
  open={confirmOpen}
  title={ confirmType === "reopen"? "إعادة فتح الفاتورة": "إعادة طباعة الفاتورة"}
  message={confirmType === "reopen"? "": ""}
  confirmText="تأكيد"
  cancelText="إلغاء"
  onCancel={() => setConfirmOpen(false)}
  onConfirm={async () => {
    if (confirmType === "reopen") {
      const { error } =
        await supabase
          .from("orders")
          .update({
            is_closed: false,
            end_time: null,
            reopen_count: Number(selectedOrder?.reopen_count || 0) + 1,
          }) .eq("id", selectedOrder.id);

      if (!error) {setConfirmOpen(false); onBack?.();}
      return;
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
    setConfirmOpen(false);

  }}
/>

    </div>
  );

}

const rowStyle = { display: "flex", flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", lineHeight: "1", gap: "14px", padding: "1px 0" };
const labelStyle = { fontSize: "16px", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap" };
const valueBox = { width: "130px", height: "28px", background: "#e0f2fe", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900", color: "#1d4ed8", padding: "0 6px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" };
