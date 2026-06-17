import { useEffect, useState, useRef ,useCallback, } from "react";
import { useInvoiceStore } from "../features/invoices/store/invoiceStore";
import ConfirmModal from "../ConfirmModal";

const GRID = "60px 1fr 30px 30px 30px 90px 90px 90px 60px 30px";

export default function InvoiceOrderItemsCard({ selectedOrder, hasPermission }) {
  const quickCodeRef = useRef(null);
  const [quickCode, setQuickCode] = useState("");
  const [moveSelects, setMoveSelects] = useState({});
  const [confirmDeleteRow, setConfirmDeleteRow] = useState(null);
  const orderItems = useInvoiceStore((s) => s.orderItems);
  const openOrders = useInvoiceStore((s) => s.openOrders);
  const loadOrderItems = useInvoiceStore((s) => s.loadOrderItems);
  const increaseQty = useInvoiceStore((s) => s.increaseQty);
  const decreaseQty = useInvoiceStore((s) => s.decreaseQty);
  const moveItemToOrder = useInvoiceStore((s) => s.moveItemToOrder);
  const deleteOrderItem = useInvoiceStore((s) => s.deleteOrderItem);
  const addItemByCode = useInvoiceStore((s) => s.addItemByCode);
  const fetchOpenOrders = useInvoiceStore((s) => s.fetchOpenOrders);
  const subscribeToOrderItems = useInvoiceStore((s) => s.subscribeToOrderItems);
  const unsubscribeFromOrderItems = useInvoiceStore((s) => s.unsubscribeFromOrderItems);
  
  const [toast, setToast] = useState(null);
    const showToast = useCallback((message, type = "success", action = null) => {
      setToast({ message, type, action });setTimeout(() => {setToast(null);}, 2000);}, []);

  useEffect(() => {
    if (!selectedOrder?.id) return;
    loadOrderItems(selectedOrder.id);
  }, [selectedOrder?.id]);

  useEffect(() => {
    if (!selectedOrder?.id) return;
    fetchOpenOrders(selectedOrder.order_shift_type);
  }, [selectedOrder?.id]);

  useEffect(() => {
    if (!selectedOrder?.id) return;
    subscribeToOrderItems(selectedOrder.id);
    return () => unsubscribeFromOrderItems();
  }, [selectedOrder?.id]);

  useEffect(() => {
    setMoveSelects({});
  }, [orderItems]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {!selectedOrder ? (
        <div style={{ textAlign: "center", padding: "20px" }}></div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>

            {/* HEADER */}
            <div style={{
              display: "grid",
              gridTemplateColumns: GRID,
              gap: "6px",
              padding: "0px 0px 0px 8px ",
              background: "#193f91",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "700",
              textAlign: "center",
              direction: "rtl",
              marginBottom: "8px",
              borderRadius: "10px 10px 0px 0px",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}>
             <div>
              <input
                title="أضف صنف بالكود"
                className="quick-code-input"
                placeholder="+ كود ."
                disabled={!selectedOrder }
                ref={quickCodeRef}
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key !== "Enter") return;
                  const success = await addItemByCode(
                    quickCode,
                    selectedOrder?.id,
                    selectedOrder?.order_shift_type
                  );
                  if (success) setQuickCode("");
                }}


                style={{
                  width: "100%",
                  height: "100%",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#000000",
                  border: "#193f91 solid 2px",
                  borderRadius: "0px 10px 0px 0px",
                  background: "#ffffff",
                }}
              />
            </div>
              <div style={{ textAlign: "right" , marginRight: "10px"}}
              > الصنف
              </div>
              <div>+</div>
              <div>عدد</div>
              <div>-</div>
              <div>السعر</div>
              <div>الإجمالي</div>
              <div style={{ fontWeight: "800", fontSize: "16px" }}>
                {selectedOrder?.is_take_away? " + 0 % ": ` + ${selectedOrder?.order_service_percentage || 0} %`}
              </div>
              <div>نقل</div>
              <div>حذف</div>
            </div>

            {/* ROWS */}
            {orderItems.map((row) => (

               
              <div key={row.id} style={{
                display: "grid",
                gridTemplateColumns: GRID,
                gap: "2px 6px",
                padding: "0px 6px",
                background: "#f8fafc",
                marginBottom: "4px",
                alignItems: "center",
                textAlign: "center",
                direction: "rtl",
                fontSize: "13px",
                height:"30px"
              }}>


                <div style={{ color: "#000", fontWeight: "700", fontSize: "16px" }}>
                  {row.sort_index ?? ""}
                </div>

                <div style={{ textAlign: "right", fontWeight: "700", fontSize: "14px", marginRight: "10px" }}>
                  {row.item?.name_ar || row.item_name_snapshot}
                </div>

                <button
                  onClick={() => increaseQty(row, selectedOrder?.order_shift_type)}
                  style={{
                    background: "#22c55e", color: "#fff", border: "none", borderRadius: "6px",
                    cursor: "pointer", opacity: "1" ,
                    height: "20px", fontSize: "14px", fontWeight: "700",
                  }}
                >+</button>

                <div style={{ fontWeight: "700", fontSize: "16px", textAlign: "center" }}>
                  {row.quantity}
                </div>

                <button
                  onClick={async () => {
                    if (Number(row.quantity) === 1) {
                      setConfirmDeleteRow(row);
                      return;
                    }

                    const success = await decreaseQty(row);
 
                    if (success) {
                      showToast("تم التسجيل فى محذوفات الشيفت","error");
                    }
                  }}
                  disabled={!hasPermission("item.min")}
                  style={{
                    background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px",
                    cursor: hasPermission("item.min") ? "pointer" : "not-allowed",
                    opacity: hasPermission("item.min") ? 1 : 0.4,
                    height: "20px", fontSize: "14px", fontWeight: "700",
                  }}
                >-</button>

                <div style={{ color: "#000", fontWeight: "700", fontSize: "16px" }}>
                  {Number(row.unit_price || 0).toFixed(2)}
                </div>

                <div style={{ color: "#000", fontWeight: "700", fontSize: "16px" }}>
                  {Number(row.total).toFixed(2)}
                </div>

                <div style={{ color: "#000", fontWeight: "700", fontSize: "16px" }}>
                  {(Number(row.total || 0) +
                    (Number(row.total || 0) /Number(selectedOrder?.subtotal || 1)) *
                    Number(selectedOrder?.service_amount || 0)).toFixed(2)}
                </div>

                <select
                 title="نقل إلى طاولة أخرى"
                  value={moveSelects[row.id] ?? ""}
                  disabled={!hasPermission("item.move")}
                  onChange={async (e) => {
                    const targetOrderId = e.target.value;
                    if (!targetOrderId) return;
                    setMoveSelects((prev) => ({ ...prev, [row.id]: targetOrderId }));
                    await moveItemToOrder(row, targetOrderId, selectedOrder?.order_shift_type);
                  }} 
                  style={{ 
                     borderRadius: "6px",
                     textAlign: "center",
                     fontWeight: "700",
                     fontSize: "16px", 
                     opacity: hasPermission("item.move") ? 1 : 0.4,
                     cursor: hasPermission("item.move")? "pointer": "not-allowed",
                     height:"20px"
                    }}
                >
                  <option value="">. . .</option>
                  {openOrders
                    .filter((o) => o.id !== selectedOrder.id)
                    .map((o) => (
                      <option key={o.id} value={o.id}>{o.tables?.table_name}</option>
                    ))}
                </select>

                <button
                 title="حذف الصنف"
                  onClick={() => setConfirmDeleteRow(row)}
                  disabled={!hasPermission("item.delete")}
                  style={{
                    background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px",
                    cursor: hasPermission("item.delete") ? "pointer" : "not-allowed",
                    opacity: hasPermission("item.delete") ? 1 : 0.4,
                    height: "20px", fontSize: "14px", fontWeight: "700", width: "100%",
                  }}
                >X</button>

              </div>
            ))}
            
          </div>


        </>
      )}
      <ConfirmModal
  open={!!confirmDeleteRow}
  title="حذف الصنف"
  message={"سيتم التسجيل في محذوفات الشيفت"}
  confirmText="حذف"
  cancelText="إلغاء"
  onCancel={() => setConfirmDeleteRow(null)}
  onConfirm={async () => {
    await deleteOrderItem(confirmDeleteRow);
    setConfirmDeleteRow(null);
  }}
/>

    {toast && (
        <div style={{
          cursor: "pointer",
          position: "fixed",
          top: 70,
          left: 270,
          background: toast.type === "error" ? "#ef4444" : "#22c55e",
          color: "white",
          padding: "4px 4px",
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