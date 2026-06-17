import { supabase } from "../supabase";

async function getCurrentItemSnapshot(itemId) {
  if (!itemId) return { data: null, error: null };

  return supabase
    .from("items")
    .select("id, name_ar, name_en, price")
    .eq("id", itemId)
    .eq("is_active", true)
    .single();
}

export async function updateOrderItemQuantity(orderItemId, quantity) {
  const { data: row, error: rowError } = await supabase
    .from("order_items")
    .select("id, item_id, unit_price")
    .eq("id", orderItemId)
    .single();

  if (rowError) return { error: rowError };

  const { data: item, error: itemError } = await getCurrentItemSnapshot(row.item_id);
  if (itemError) return { error: itemError };

  const unitPrice = Number(item?.price ?? row.unit_price ?? 0);

  return supabase
    .from("order_items")
    .update({
      quantity,
      unit_price: unitPrice,
      item_name_snapshot: item?.name_ar || "",
    })
    .eq("id", orderItemId);
}

export async function addOrMergeOrderItem(orderId, itemId, quantityToAdd = 1) {
  if (!orderId || !itemId) return { error: null };

  const { data: item, error: itemError } = await getCurrentItemSnapshot(itemId);
  if (itemError) return { error: itemError };

  const unitPrice = Number(item?.price || 0);

  const { data: existingItems, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .eq("item_id", itemId);

  if (error) return { error };

  if (!existingItems?.length) {
    return supabase
      .from("order_items")
      .insert({
        order_id: orderId,
        item_id: itemId,
        quantity: quantityToAdd,
        unit_price: unitPrice,
        item_name_snapshot: item?.name_ar || "",
      });
  }

  const [mainItem, ...duplicateItems] = existingItems;
  const nextQuantity =
    existingItems.reduce((sum, row) => sum + Number(row.quantity || 0), 0) +
    Number(quantityToAdd || 0);

  const updateResult = await updateOrderItemQuantity(mainItem.id, nextQuantity);
  if (updateResult.error) return updateResult;

  if (duplicateItems.length) {
    const deleteResult = await supabase
      .from("order_items")
      .delete()
      .in("id", duplicateItems.map((row) => row.id));

    if (deleteResult.error) return deleteResult;
  }

  return { error: null };
}

export async function moveOrMergeOrderItem(row, targetOrderId) {
  if (!row?.id || !targetOrderId) return { error: null };

  const { data: targetItems, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", targetOrderId)
    .eq("item_id", row.item_id);

  if (error) return { error };

  if (!targetItems?.length) {
    return supabase
      .from("order_items")
      .update({ order_id: targetOrderId })
      .eq("id", row.id);
  }

  const [mainTargetItem, ...duplicateTargetItems] = targetItems;
  const nextQuantity =
    targetItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0) +
    Number(row.quantity || 0);

  const updateResult = await updateOrderItemQuantity(
    mainTargetItem.id,
    nextQuantity
  );

  if (updateResult.error) return updateResult;

  const idsToDelete = [row.id, ...duplicateTargetItems.map((item) => item.id)];
  const deleteResult = await supabase
    .from("order_items")
    .delete()
    .in("id", idsToDelete);

  if (deleteResult.error) return deleteResult;

  return { error: null };
}
