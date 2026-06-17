import { useEffect } from "react";
import { useInvoiceStore } from "../features/invoices/store/invoiceStore";

const GRID = "60px 1fr 40px 90px 90px 90px";

export default function ClosedInvoiceOrderItemsCard({ selectedOrder, hasPermission }) {

  const orderItems = useInvoiceStore((s) => s.orderItems);
  const loadOrderItems = useInvoiceStore((s) => s.loadOrderItems);
  const subscribeToOrderItems = useInvoiceStore((s) => s.subscribeToOrderItems);
  const unsubscribeFromOrderItems = useInvoiceStore((s) => s.unsubscribeFromOrderItems);

  useEffect(() => {
    if (!selectedOrder?.id) return;
    loadOrderItems(selectedOrder.id);
  }, [selectedOrder?.id]);



  useEffect(() => {
    if (!selectedOrder?.id) return;
    subscribeToOrderItems(selectedOrder.id);
    return () => unsubscribeFromOrderItems();
  }, [selectedOrder?.id]);


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
              gap: "8px",
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
              <div>كود</div>
              <div style={{ textAlign: "right" , marginRight: "10px"}}> الصنف</div>
              <div>عدد</div>
              <div>السعر</div>
              <div>الإجمالي</div>
              <div style={{ fontWeight: "800", fontSize: "16px" }}>
                {selectedOrder?.is_take_away? " + 0 % ": ` + ${selectedOrder?.order_service_percentage || 0} %`}
              </div>

            </div>

            {/* ROWS */}
            {orderItems.map((row) => (
              <div key={row.id} style={{
                display: "grid",
                gridTemplateColumns: GRID,
                gap: "2px 8px",
                padding: "0px 8px",
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

                <div style={{ fontWeight: "700", fontSize: "16px", textAlign: "center" }}>
                  {row.quantity}
                </div>

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

              </div>
            ))}
          </div>


        </>
      )}

    </div>
    
  );

}