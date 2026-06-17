import { useMemo } from "react";
import { supabase } from "../supabase";
import { useRealtimeRows } from "./useRealtimeRows";

export async function getOrderItemsWithItems(orderId) {
  if (!orderId) return { data: [], error: null };

  const { data: orderItems, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (error || !orderItems?.length) {
    return { data: [], error };
  }

  const itemIds = orderItems.map((item) => item.item_id);
  const { data: itemsData, error: itemsError } = await supabase
    .from("items")
    .select("id, name_ar, sort_index")
    .in("id", itemIds);

  if (itemsError) return { data: [], error: itemsError };

  const itemsById = new Map((itemsData || []).map((item) => [item.id, item]));
  const merged = orderItems.map((row) => {
    const item = itemsById.get(row.item_id);

    const unitPrice = Number(row.unit_price || 0);
    const quantity = Number(row.quantity || 0);

    return {
      ...row,
      item,
      sort_index: item?.sort_index ?? null,
      total: quantity * unitPrice,
    };
  });

  merged.sort((a, b) => {
    const firstSort = a.sort_index ?? 999999;
    const secondSort = b.sort_index ?? 999999;
    return firstSort - secondSort;
  });

  return { data: merged, error: null };
}

export function useOrderItemsWithItems(orderId) {
  const subscriptions = useMemo(
    () =>
      orderId
        ? [{ table: "order_items" }]
        : [],
    [orderId]
  );

  return useRealtimeRows({
    enabled: Boolean(orderId),
    fetchRows: () => getOrderItemsWithItems(orderId),
    channelName: orderId ? `order-items-${orderId}` : null,
    subscriptions,
  });
}
