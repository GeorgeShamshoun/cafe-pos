import { useMemo } from "react";
import { useCafeTables } from "../data/tablesTable";

export default function useTables(cafeId) {
  const options = useMemo(() => ({ activeOnly: true }), []);
  const { rows: tables, loading, refresh } = useCafeTables(cafeId, options);

  return { tables, loading, fetchTables: refresh };
}
