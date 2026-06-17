import { useMemo } from "react";
import { supabase } from "../supabase";
import { useRealtimeRows } from "./useRealtimeRows";

export function getItemsByGroup(cafeId, groupId) {
  if (!cafeId || !groupId) return { data: [], error: null };

  return supabase
    .from("items")
    .select("*")
    .eq("cafe_id", cafeId)
    .eq("group_id", groupId)
    .order("sort_index", { ascending: true });
}

export function useItemsByGroup(cafeId, groupId) {
  const subscriptions = useMemo(
    () =>
      cafeId
        ? [{ table: "items", filter: `cafe_id=eq.${cafeId}` }]
        : [],
    [cafeId]
  );

  return useRealtimeRows({
    enabled: Boolean(cafeId && groupId),
    fetchRows: () => getItemsByGroup(cafeId, groupId),
    channelName: cafeId && groupId ? `items-${cafeId}-${groupId}` : null,
    subscriptions,
  });
}
