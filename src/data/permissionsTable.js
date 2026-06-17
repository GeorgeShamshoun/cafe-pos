import { useMemo } from "react";
import { supabase } from "../supabase";
import { useRealtimeRows } from "./useRealtimeRows";

export function getVisiblePermissionsRows() {
  return supabase
    .from("permissions")
    .select("*")
    .eq("is_visible", true)
    .order("permission_key");
}

export function getPermissionByKey(permissionKey) {
  return supabase
    .from("permissions")
    .select("id")
    .eq("permission_key", permissionKey)
    .single();
}

export function useVisiblePermissionsRows() {
  const subscriptions = useMemo(
    () => [{ table: "permissions" }],
    []
  );

  return useRealtimeRows({
    fetchRows: getVisiblePermissionsRows,
    channelName: "permissions-visible",
    subscriptions,
  });
}
