import { useCallback, useEffect, useRef, useState } from "react";
import { getCafeSettings, updateCafeSettings } from "../services/cafeService";
import { supabase } from "../supabase";

export default function useCafeSettings({ cafeId, onSaved, showToast }) {
  const [settings, setSettings] = useState({});
  const originalSettings = useRef({});
  const [saveLoading, setSaveLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!cafeId) return;

    const { data, error } = await getCafeSettings(cafeId);

    if (error) {
      console.log("Cafe settings load error:", error);
      return;
    }

    const loadedSettings = data || {};

    setSettings({ ...loadedSettings });
    originalSettings.current = { ...loadedSettings };
  }, [cafeId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (!cafeId) return;

    const channel = supabase
      .channel(`cafe-settings-live-${cafeId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "cafes",
          filter: `id=eq.${cafeId}`,
        },
        loadSettings
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cafeId, loadSettings]);

  const updateSetting = useCallback((field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }, []);

  const save = useCallback(async () => {
    if (!cafeId || saveLoading) return false;

    setSaveLoading(true);

    const { error } = await updateCafeSettings(cafeId, settings);

    if (error) {
      console.log("Cafe settings save error:", error);
      showToast("Error", "error");
      setSaveLoading(false);
      return false;
    }

    originalSettings.current = { ...settings };
    setSaveLoading(false);
    showToast("تم حفظ الإعدادات", "success");
    onSaved?.();
    return true;
  }, [cafeId, onSaved, saveLoading, settings, showToast]);

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(originalSettings.current);

  return {
    settings,
    updateSetting,
    save,
    saveLoading,
    hasChanges,
  };
}
