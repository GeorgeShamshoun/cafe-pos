import { supabase } from "../supabase";
import { getItemGroups } from "../data/itemGroupsTable";

// جلب المجموعات
export async function getGroups(cafeId) {
  return getItemGroups(cafeId);
}

// تحديث عام
export async function updateGroup(groupId, values) {
  return supabase
    .from("item_groups")
    .update(values)
    .eq("id", groupId);
}

// toggle
export async function toggleGroupService(group) {
  return supabase
    .from("item_groups")
    .update({ is_active: !group.is_active })
    .eq("id", group.id);
}

// حذف المجموعة + تفريغ الأصناف
export async function deleteGroupService(groupId) {
  const itemsRes = await supabase
    .from("items")
    .update({
      name_ar: "",
      name_en: "",
      price: 0,
      is_active: false,
    })
    .eq("group_id", groupId);

  if (itemsRes.error) return itemsRes;

  return supabase
    .from("item_groups")
    .update({
      name: "",
      is_active: false,
    })
    .eq("id", groupId);
}


// حفظ تعديل الاسم
export async function saveGroupService(groupId, cafeId, name) {
  const { exists } = await checkGroupNameExists(cafeId, name, groupId);

  if (exists) {
    return {
      error: { message: "اسم المجموعة موجود بالفعل" },
    };
  }

  return supabase
    .from("item_groups")
    .update({
      name,
      is_active: true,
    })
    .eq("id", groupId);
}
export async function checkGroupNameExists(cafeId, name, ignoreId = null) {
  let query = supabase
    .from("item_groups")
    .select("id")
    .eq("cafe_id", cafeId)
    .eq("name", name);

  if (ignoreId) {
    query = query.neq("id", ignoreId);
  }

  const { data, error } = await query;

  return {
    exists: data?.length > 0,
    error,
  };
}
