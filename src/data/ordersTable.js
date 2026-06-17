import { useMemo } from "react";
import { supabase } from "../supabase";
import { useRealtimeRows } from "./useRealtimeRows";

const openOrdersSelect = `
  id,
  order_no,
  start_time,
  cashier_id,
  captain_id,
  table_id,
  order_shift_type,
  order_shift_date,
  subtotal,
  order_service_percentage,
  discount,
  service_amount,
  total_amount,
  is_take_away,
  is_closed,
  tables (table_name, sort_index)
`;

export async function getOpenOrdersByShift(choiceShiftPage) {
  if (!choiceShiftPage) return { data: [], error: null };

  const { data, error } = await supabase
    .from("orders")
    .select(openOrdersSelect)
    .eq("is_closed", false)
    .eq("order_shift_type", choiceShiftPage);

  const sorted = (data || []).sort(
    (a, b) => (a.tables?.sort_index || 0) - (b.tables?.sort_index || 0)
  );

  return { data: sorted, error };
}

export function getOrderById(orderId, select = "*") {
  if (!orderId) return { data: null, error: null };

  return supabase
    .from("orders")
    .select(select)
    .eq("id", orderId)
    .single();
}

export function useOpenOrdersByShift(choiceShiftPage) {
  const subscriptions = useMemo(
    () => [{ table: "orders" }],
    []
  );

  return useRealtimeRows({
    enabled: Boolean(choiceShiftPage),
    fetchRows: () => getOpenOrdersByShift(choiceShiftPage),
    channelName: choiceShiftPage ? `orders-open-${choiceShiftPage}` : null,
    subscriptions,
  });
}
