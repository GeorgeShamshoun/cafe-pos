import { useMemo } from "react";
import { supabase } from "../supabase";
import { useRealtimeRows } from "./useRealtimeRows";

export function getVisibleUsers(cafeId) {
  if (!cafeId) return { data: [], error: null };

  return supabase
    .from("users")
    .select("*")
    .eq("cafe_id", cafeId)
    .eq("is_visible", true)
    .order("id");
}

export function getUsersByIds(cafeId, userIds, select = "id, name") {
  if (!cafeId || !userIds?.length) return { data: [], error: null };

  return supabase
    .from("users")
    .select(select)
    .in("id", userIds)
    .eq("cafe_id", cafeId);
}

export function useVisibleUsers(cafeId) {
  const subscriptions = useMemo(
    () =>
      cafeId
        ? [{ table: "users", filter: `cafe_id=eq.${cafeId}` }]
        : [],
    [cafeId]
  );

  return useRealtimeRows({
    enabled: Boolean(cafeId),
    fetchRows: () => getVisibleUsers(cafeId),
    channelName: cafeId ? `users-${cafeId}` : null,
    subscriptions,
  });
}
