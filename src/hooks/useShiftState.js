import { useCallback, useEffect, useState } from "react";
import { loadShiftData, saveShiftData } from "../services/setupService";
import { useCafeRow } from "../data/cafesTable";

export default function useShiftState({ cafeId, showToast }) {
  const [shiftDate, setShiftDate] = useState("");
  const [shiftType, setShiftType] = useState("AM");
  const [savingShift, setSavingShift] = useState(false);
  const [savedShiftDate, setSavedShiftDate] = useState("");
  const [savedShiftType, setSavedShiftType] = useState("AM");
  const { rows: liveCafe } = useCafeRow(
    cafeId,
    "current_shift_date, current_shift_type"
  );

  const isShiftChanged = shiftDate !== savedShiftDate || shiftType !== savedShiftType;

  const resetShiftToOriginal = useCallback(() => {
    setShiftDate(savedShiftDate);
    setShiftType(savedShiftType);
  }, [savedShiftDate, savedShiftType]);

  const fetchShiftData = useCallback(async (targetCafeId = cafeId) => {
    if (!targetCafeId) return;
    const data = await loadShiftData(targetCafeId);
    if (!data) return;
    setShiftDate(data.date);
    setShiftType(data.type);
    setSavedShiftDate(data.date);
    setSavedShiftType(data.type);
  }, [cafeId]);

  const saveShift = useCallback(async () => {
    if (!cafeId) return;
    setSavingShift(true);
    const result = await saveShiftData(cafeId, shiftDate, shiftType);
    setSavingShift(false);
    if (result?.error) {
      console.log("Shift save error:", result.error);
      return;
    }
    setSavedShiftDate(shiftDate);
    setSavedShiftType(shiftType);
    showToast("تم تعديل تاريخ الشيفت", "success");
  }, [cafeId, shiftDate, shiftType, showToast]);

  useEffect(() => {
    if (!cafeId) return;
    fetchShiftData(cafeId);
  }, [cafeId, fetchShiftData]);

  useEffect(() => {
    if (!liveCafe) return;

    const nextDate = liveCafe.current_shift_date || "";
    const nextType = liveCafe.current_shift_type || "AM";

    setShiftDate(nextDate);
    setShiftType(nextType);
    setSavedShiftDate(nextDate);
    setSavedShiftType(nextType);
  }, [liveCafe]);

  return {
    shiftDate,
    setShiftDate,
    shiftType,
    choiceShiftPage: shiftType,
    setShiftType,
    savingShift,
    savedShiftDate,
    savedShiftType,
    isShiftChanged,
    resetShiftToOriginal,
    saveShift,
  };
}
