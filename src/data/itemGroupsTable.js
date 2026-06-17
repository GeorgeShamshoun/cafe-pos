import { useMemo } from "react";
import { supabase } from "../supabase";
import { useRealtimeRows } from "./useRealtimeRows";

export function getItemGroups(cafeId) {
  if (!cafeId) return { data: [], error: null };

  return supabase
    .from("item_groups")
    .select("*")
    .eq("cafe_id", cafeId)
    .order("sort_index", { ascending: true });
}

export function useItemGroups(cafeId) {
  const subscriptions = useMemo(
    () =>
      cafeId
        ? [{ table: "item_groups", filter: `cafe_id=eq.${cafeId}` }]
        : [],
    [cafeId]
  );

  return useRealtimeRows({
    enabled: Boolean(cafeId),
    fetchRows: () => getItemGroups(cafeId),
    channelName: cafeId ? `item-groups-${cafeId}` : null,
    subscriptions,
  });
}
