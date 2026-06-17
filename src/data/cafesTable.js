import { useMemo } from "react";
import { supabase } from "../supabase";
import { useRealtimeRows } from "./useRealtimeRows";

export function getActiveCafes() {
  return supabase
    .from("cafes")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
}

export function getCafeById(cafeId, select = "*") {
  if (!cafeId) return { data: null, error: null };
  return supabase
    .from("cafes")
    .select(select)
    .eq("id", cafeId)
    .single();
}

export function useActiveCafes() {
  const subscriptions = useMemo(
    () => [{ table: "cafes" }],
    []
  );

  return useRealtimeRows({
    fetchRows: getActiveCafes,
    channelName: "cafes-active",
    subscriptions,
  });
}

export function useCafeRow(cafeId, select = "*") {
  const subscriptions = useMemo(
    () =>
      cafeId
        ? [{ table: "cafes", filter: `id=eq.${cafeId}` }]
        : [],
    [cafeId]
  );

  return useRealtimeRows({
    enabled: Boolean(cafeId),
    initialValue: null,
    fetchRows: () => getCafeById(cafeId, select),
    channelName: cafeId ? `cafes-${cafeId}` : null,
    subscriptions,
  });
}
