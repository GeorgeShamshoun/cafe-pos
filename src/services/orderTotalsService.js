import { supabase } from "../supabase";

export async function recalculateOrderTotals(orderId) {
  if (!orderId) return { data: null, error: null };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, discount, is_take_away, order_service_percentage")
    .eq("id", orderId)
    .single();

  if (orderError) return { data: null, error: orderError };

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("quantity, unit_price, total, items(price)")
    .eq("order_id", orderId);

  if (itemsError) return { data: null, error: itemsError };

  const subtotal = (orderItems || []).reduce((sum, row) => {
    const quantity = Number(row.quantity || 0);
    const unitPrice = Number(row.unit_price ?? row.items?.price ?? 0);
    const lineTotal = quantity * unitPrice;

    return sum + lineTotal;
  }, 0);

  const discount = Math.min(Number(order.discount || 0), subtotal);
  const servicePercentage = Number(order.order_service_percentage || 0);
  const serviceAmount = order.is_take_away
    ? 0
    : (subtotal * servicePercentage) / 100;
  const totalAmount = Math.max(subtotal + serviceAmount - discount, 0);

  return supabase
    .from("orders")
    .update({
      subtotal,
      discount,
      service_amount: serviceAmount,
      total_amount: totalAmount,
    })
    .eq("id", orderId)
    .select("*, tables(table_name, sort_index)")
    .single();
}
