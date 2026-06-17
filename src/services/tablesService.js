import { supabase } from "../supabase";
import { getPermissionByKey } from "../data/permissionsTable";
import { getCafeTables } from "../data/tablesTable";
import { getUserIdsByPermission } from "../data/userPermissionsTable";
import { getUsersByIds } from "../data/usersTable";

export async function getTables(cafeId) {
  return getCafeTables(cafeId);
}

export async function updateTable(tableId, values) {
  return supabase.from("tables").update(values).eq("id", tableId);
}

export async function getCaptainPermission() {
  return getPermissionByKey("captain");
}

export async function getCaptainUserPermissions(permissionId) {
  return getUserIdsByPermission(permissionId);
}

export async function getCaptains(cafeId, userIds) {
  return getUsersByIds(cafeId, userIds);
}
