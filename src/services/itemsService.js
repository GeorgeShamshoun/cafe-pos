import { supabase } from "../supabase";
import { getItemsByGroup } from "../data/itemsTable";

export async function getItems(cafeId, groupId) {
  return getItemsByGroup(cafeId, groupId);
}

export async function updateItem(itemId, values) {
  return supabase.from("items").update(values).eq("id", itemId);
}

export async function clearItem(itemId) {
  return updateItem(itemId, {
    name_ar: "",
    name_en: "",
    price: 0,
    is_active: false,
  });
}

export async function saveItemData(itemId, values) {
  return updateItem(itemId, {
    name_ar: values.name_ar,
    name_en: values.name_en || "",
    price: values.price,
    is_active: true,
  });
}

export async function toggleItemAvailability(item) {
  return updateItem(item.id, {
    is_active: !item.is_active,
  });
}
export async function checkItemNameExists(cafeId, groupId, nameAr, ignoreId = null) {
  let query = supabase
    .from("items")
    .select("id")
    .eq("cafe_id", cafeId)
    .eq("group_id", groupId)
    .eq("name_ar", nameAr);

  if (ignoreId) {
    query = query.neq("id", ignoreId);
  }

  const { data, error } = await query;

  return {
    exists: data?.length > 0,
    error,
  };
}

export async function saveItemService(itemId, values) {
  return updateItem(itemId, {
    name_ar: values.name_ar,
    name_en: values.name_en || "",
    price: values.price,
    is_active: true,
  });
}

export async function clearItemService(itemId) {
  return updateItem(itemId, {
    name_ar: "",
    name_en: "",
    price: 0,
    is_active: false,
  });
}

export async function toggleItemService(item) {
  return updateItem(item.id, {
    is_active: !item.is_active,
  });
}
