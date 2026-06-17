import { supabase } from "../supabase";
import { getActiveCafes } from "../data/cafesTable";

export async function getActiveUserByLogin(cafeId, username, password) {
  if (!cafeId || !username || !password) {
    return { data: null, error: "missing params" };
  }

  return supabase
    .from("users")
    .select("*")
    .eq("cafe_id", cafeId)
    .eq("username", username)
    .eq("password", password)
    .eq("is_active", true)
    .single();
}

export async function getCafeById(cafeId) {
  return supabase
    .from("cafes")
    .select("*")
    .eq("id", cafeId)
    .eq("is_active", true)
    .single();
}

export async function getAllowedPermissionKeys(userId) {
  const { data, error } = await supabase
    .from("user_permissions")
    .select("permissions(permission_key)")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error) return { data: [], error };

  const permissionKeys =
    data?.map((item) => item.permissions?.permission_key).filter(Boolean) || [];

  return { data: permissionKeys, error: null };
}

export async function getCurrentPermissionKeys(userId) {
  const { data, error } = await supabase
    .from("user_permissions")
    .select("permissions(permission_key), is_active")
    .eq("user_id", userId);

  if (error) return { data: [], error };

  const permissionKeys =
    data
      ?.filter((item) => item.is_active)
      .map((item) => item.permissions?.permission_key)
      .filter(Boolean) || [];

  return { data: permissionKeys, error: null };
}
export async function getAllCafes() {
  return getActiveCafes();
}
