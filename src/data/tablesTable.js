import { useMemo } from "react";
import { supabase } from "../supabase";
import { useRealtimeRows } from "./useRealtimeRows";

export function getCafeTables(cafeId, options = {}) {
  if (!cafeId) return { data: [], error: null };

  let query = supabase
    .from("tables")
    .select("*")
    .eq("cafe_id", cafeId)
    .order("sort_index", { ascending: true });

  if (options.activeOnly) query = query.eq("is_active", true);
  if (options.availableOnly) query = query.eq("is_used", false);

  return query;
}

export function useCafeTables(cafeId, options = {}) {
  const subscriptions = useMemo(
    () =>
      cafeId
        ? [{ table: "tables", filter: `cafe_id=eq.${cafeId}` }]
        : [],
    [cafeId]
  );

  return useRealtimeRows({
    enabled: Boolean(cafeId),
    fetchRows: () => getCafeTables(cafeId, options),
    channelName: cafeId
      ? `tables-${cafeId}-${options.activeOnly ? "active" : "all"}-${
          options.availableOnly ? "available" : "any"
        }`
      : null,
    subscriptions,
  });
}
