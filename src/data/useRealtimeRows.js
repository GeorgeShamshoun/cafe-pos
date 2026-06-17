import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";

const DEFAULT_ROWS = [];

export function useRealtimeRows({
  enabled = true,
  fetchRows,
  initialValue = DEFAULT_ROWS,
  channelName,
  subscriptions = [],
}) {
  const [rows, setRows] = useState(initialValue);
  const [loading, setLoading] = useState(Boolean(enabled));
  const fetchRowsRef = useRef(fetchRows);
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    fetchRowsRef.current = fetchRows;
  }, [fetchRows]);

  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  const refresh = useCallback(async () => {
    const currentInitialValue = initialValueRef.current;
    const currentFetchRows = fetchRowsRef.current;

    if (!enabled || !currentFetchRows) {
      setRows(currentInitialValue);
      setLoading(false);
      return { data: currentInitialValue, error: null };
    }

    setLoading(true);
    const { data, error } = await currentFetchRows();

    if (error) {
      console.log(`${channelName || "realtime"} load error:`, error);
      setLoading(false);
      return { data: currentInitialValue, error };
    }

    const nextRows = data ?? currentInitialValue;
    setRows(nextRows);
    setLoading(false);
    return { data: nextRows, error: null };
  }, [channelName, enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled || !channelName || !subscriptions.length) return;

    // ✅ channel name unique عشان منعملش تضارب لو اتعمل re-subscribe
    const uniqueChannelName = `${channelName}-${Date.now()}`;
    let channel = supabase.channel(uniqueChannelName);

    subscriptions.forEach((subscription) => {
      // ✅ بنحفظ الـ filter الأصلي عشان نستخدمه في الفلترة اليدوية
      const originalFilter = subscription.filter;

      // ✅ نشيل الـ filter من Supabase لأنه مش مضمون على non-primary keys
      // زي cafe_id, group_id, etc.
      // الـ filter على primary key زي id=eq.X ده شغال — نسيبه
      const isPrimaryKeyFilter =
        originalFilter &&
        /^id=eq\./.test(originalFilter);

      channel = channel.on(
        "postgres_changes",
        {
          event: subscription.event || "*",
          schema: subscription.schema || "public",
          table: subscription.table,
          // ✅ نبعت filter بس لو على primary key
          ...(isPrimaryKeyFilter ? { filter: originalFilter } : {}),
        },
        (payload) => {
          // ✅ فلترة manually لو مفيش filter أو filter على non-PK
          if (originalFilter && !isPrimaryKeyFilter) {
            const record = payload?.new || payload?.old || {};

            // بنحول الـ filter لـ key/value ونقارن
            // مثال: "cafe_id=eq.123" → { cafe_id: "123" }
            const match = originalFilter.match(/^(\w+)=eq\.(.+)$/);
            if (match) {
              const [, key, value] = match;
              const recordValue = String(record[key] ?? "");
              const filterValue = String(value);
              if (recordValue && recordValue !== filterValue) return;
            }
          }

          refresh();
        }
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, enabled, refresh, subscriptions]);

  return { rows, loading, refresh, setRows };
}