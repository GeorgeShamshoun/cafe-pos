import { supabase } from "../supabase";
import { getVisibleUsers } from "../data/usersTable";

export async function getUsers(cafeId) {
  return getVisibleUsers(cafeId);
}

export async function addUser(cafeId, name) {
  return supabase
    .from("users")
    .insert({
      name,
      username: null,
      password: null,
      is_active: true,
      cafe_id: cafeId,
    })
    .select()
    .single();
}

export async function deleteUser(userId) {
  return supabase.from("users").delete().eq("id", userId);
}

export async function updateUser(userId, values) {
  return supabase.from("users").update(values).eq("id", userId);
}

export async function toggleUserActive(user) {
  return updateUser(user.id, {
    is_active: !user.is_active,
  });
}

export async function canAddUser(currentUserId) {
  if (!currentUserId) return false;
  const { data: perm } = await supabase
    .from("permissions")
    .select("id")
    .eq("permission_key", "add.user")
    .single();
  if (!perm) return false;
  const { data: userPerm } = await supabase
    .from("user_permissions")
    .select("*")
    .eq("user_id", currentUserId)
    .eq("permission_id", perm.id)
    .maybeSingle();
  return !!userPerm;
}

export async function checkUserNameExists(cafeId, name) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("cafe_id", cafeId)
    .eq("name", name)
    .maybeSingle();

  return {
    exists: !!data,
    error,
  };
}

export async function deleteUserPermissions(userId) {
  // 🧹 حذف صلاحيات المستخدم
  const { error: permissionsError } = await supabase
    .from("user_permissions")
    .delete()
    .eq("user_id", userId);

  if (permissionsError) {
    return { error: permissionsError };
  }

  // 👇 حذف المستخدم
  return supabase
    .from("users")
    .delete()
    .eq("id", userId);
}
