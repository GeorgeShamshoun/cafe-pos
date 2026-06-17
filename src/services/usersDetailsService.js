import { supabase } from "../supabase";
import { getVisiblePermissionsRows } from "../data/permissionsTable";
import { getActiveUserPermissionIds } from "../data/userPermissionsTable";

export async function getVisiblePermissions() {
  return getVisiblePermissionsRows();
}
 
export async function getUserPermissionIds(userId) {
  return getActiveUserPermissionIds(userId);
}

export async function addUserPermission(userId, permissionId) {
  return supabase.from("user_permissions")
  .insert({
    user_id: userId,
    permission_id: permissionId,
    is_active: true,
  });
}

export async function removeUserPermission(userId, permissionId) {
  return supabase
    .from("user_permissions")
    .delete()
    .eq("user_id", userId)
    .eq("permission_id", permissionId);
}

export async function updateUserDetails(userId, values) {
  return supabase
    .from("users")
    .update({
      name: values.name,
      username: values.username,
      password: values.password,
    })
    .eq("id", userId);
}
export async function checkDuplicateUser(
  cafeId,
  name,
  username,
  ignoreId = null
) {
  let query = supabase
    .from("users")
    .select("id,name,username")
    .eq("cafe_id", cafeId);

  if (ignoreId) {
    query = query.neq("id", ignoreId);
  }

  const { data, error } = await query;

  if (error) {
    return {
      nameExists: false,
      usernameExists: false,
      error,
    };
  }

  const normalizedName = name.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  const nameExists = data.some(
    (u) => (u.name || "").trim().toLowerCase() === normalizedName
  );

  const usernameExists =
    normalizedUsername &&
    data.some(
      (u) =>
        (u.username || "").trim().toLowerCase() === normalizedUsername
    );

  return {
    nameExists,
    usernameExists,
    error: null,
  };
}
