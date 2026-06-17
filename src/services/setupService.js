import { supabase } from "../supabase";

export async function ensureGroupsExist(cafeId) {
  if (!cafeId) return;

  const { data, error } = await supabase
    .from("item_groups")
    .select("sort_index")
    .eq("cafe_id", cafeId);

  if (error) return { error };

  const existingSet = new Set((data || []).map((group) => Number(group.sort_index)));
  const groupsToInsert = [];

  for (let i = 1; i <= 30; i++) {
    if (!existingSet.has(i)) {
      groupsToInsert.push({
        cafe_id: cafeId,
        sort_index: i,
        name: "",
        is_active: false,
      });
    }
  }

  if (!groupsToInsert.length) return { error: null };

  return supabase.from("item_groups").insert(groupsToInsert);
}

export async function ensureItemsExist(cafeId, groupId) {
  if (!cafeId || !groupId) return;

  // نجيب sort_index الخاص بالجروب
  const { data: groupData, error: groupError } = await supabase
    .from("item_groups")
    .select("sort_index")
    .eq("id", groupId)
    .single();

  if (groupError || !groupData) {
    return { error: groupError || "group not found" };
  }

  const groupSortIndex = Number(groupData.sort_index || 1);

  // range الخاص بالجروب
  const start = (groupSortIndex - 1) * 50 + 1;
  const end = start + 49;

  // الأصناف الموجودة
  const { data, error } = await supabase
    .from("items")
    .select("sort_index")
    .eq("cafe_id", cafeId)
    .eq("group_id", groupId);

  if (error) return { error };

  const existingSet = new Set(
    (data || []).map((item) => Number(item.sort_index))
  );

  const itemsToInsert = [];

  for (let i = start; i <= end; i++) {
    if (!existingSet.has(i)) {
      itemsToInsert.push({
        cafe_id: cafeId,
        group_id: groupId,
        sort_index: i,
        name_ar: "",
        name_en: "",
        price: 0,
        is_active: false,
      });
    }
  }

  if (!itemsToInsert.length) {
    return { error: null };
  }

  return supabase.from("items").insert(itemsToInsert);
}

export async function ensureTablesExist(cafeId) {
  if (!cafeId) return;

  const { data, error } = await supabase
    .from("tables")
    .select("sort_index")
    .eq("cafe_id", cafeId);

  if (error) return { error };

  const existingSet = new Set((data || []).map((table) => Number(table.sort_index)));
  const tablesToInsert = [];

  for (let i = 1; i <= 399; i++) {
    if (!existingSet.has(i)) {
      tablesToInsert.push({
        cafe_id: cafeId,
        sort_index: i,
        table_name: String(i).padStart(3, "0"),
        is_active: false,
      });
    }
  }

  if (!tablesToInsert.length) return { error: null };

  return supabase.from("tables").insert(tablesToInsert);
}

export const saveShiftData = async (cafeId, shiftDate, shiftType) => {
  if (!cafeId) return { error: "No cafe id" };

  return await supabase
    .from("cafes")
    .update({
      current_shift_date: shiftDate,
      current_shift_type: shiftType,
    })
    .eq("id", cafeId);
};

export const loadShiftData = async (cafeId) => {
  if (!cafeId) return null;

  const { data, error } = await supabase
    .from("cafes")
    .select("current_shift_date, current_shift_type")
    .eq("id", cafeId)
    .single();

  if (error) {
    console.log("Shift load error:", error);
    return null;
  }

  return {
    date: data?.current_shift_date || "",
    type: data?.current_shift_type || "AM",
  };
};