import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ActionButton from "./ActionButton";
import { useCafeTables } from "./data/tablesTable";
import styles from "./styles/tablesStyles";
import {
  getCaptainPermission,
  getCaptains,
  getCaptainUserPermissions,
  updateTable,
} from "./services/tablesService";

export default function Tables({ user }) {
  const tableOptions = useMemo(() => ({}), []);
  const { rows: tables, setRows: setTables } = useCafeTables(
    user?.cafe_id,
    tableOptions
  );
  const [editValues, setEditValues] = useState({});
  const [captains, setCaptains] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [loadingCell, setLoadingCell] = useState(null);
  const [hoveredTableId, setHoveredTableId] = useState(null);    
  const inputsRef = useRef({});
  const keyLockRef = useRef(false);
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success", action = null) => {
  setToast({ message, type, action });
  setTimeout(() => {setToast(null);}, 2000);};
  const loadCaptains = useCallback(async () => {
    if (!user?.cafe_id) return;

    const { data: perm, error: permError } = await getCaptainPermission();

    if (permError || !perm) {
      console.log("Captain permission load error:", permError);
      return;
    }

    const { data: userPerms, error: userPermsError } =
      await getCaptainUserPermissions(perm.id);

    if (userPermsError) {
      console.log("Captain user permissions load error:", userPermsError);
      return;
    }

    if (!userPerms?.length) {
      setCaptains([]);
      return;
    }

    const userIds = userPerms.map((item) => item.user_id);
    const { data: users, error: usersError } = await getCaptains(user.cafe_id, userIds);

    if (usersError) {
      console.log("Captains load error:", usersError);
      return;
    }

    setCaptains(users || []);
  }, [user?.cafe_id]);

  useEffect(() => {
    loadCaptains();
  }, [loadCaptains]);

  const updateEditValue = (table, values) => {
    setEditValues((prev) => ({
      ...prev,
      [table.id]: {
        ...(prev[table.id] || table),
        ...values,
      },
    }));
  };

  const saveTable = async (tableId, values, loadingKey = null) => {
    if (loadingKey) setLoadingCell(loadingKey);

    const { error } = await updateTable(tableId, values);

    if (error) {
      console.log("Table update error:", error);
      if (loadingKey) setLoadingCell(null);
      return false;
    }

    if (loadingKey) setLoadingCell(null);
    return true;
  };

  const saveCaptain = async (table, field, value) => {
    const loadingKey = `${table.id}-${field}`;

    return saveTable(
      table.id,
      {
        [field]: value || null,
      },
      loadingKey
    );
  };

const toggle = async (table) => {
  const loadingKey = `${table.id}-toggle`;
  const newValue = !table.is_active;

  const updateData = {
    is_active: newValue,
  };

  const updated = await saveTable(table.id, updateData, loadingKey);

  if (!updated) return;

  setTables((prev) =>
    prev.map((item) =>
      item.id === table.id
        ? { ...item, ...updateData }
        : item
    )
  );

  updateEditValue(table, updateData);

  showToast(
    newValue
      ? "تم تفعيل الطاولة"
      : "تم إيقاف الطاولة",
    newValue ? "success" : "warning"
  );
};

  const handleOnOffKey = async (e, table, index) => {
    if (e.key !== "Enter" && e.key !== "ArrowDown") return;
    if (e.repeat) return;

    e.preventDefault();

    const next = tables[index + 1];

    if (!next) return;

    const loadingKey = `${next.id}-toggle`;

    const updateData = table.is_active
      ? { is_active: true }
      : {
          is_active: false,
          captain_id_am: null,
          captain_id_pm: null,
        };

    const updated = await saveTable(next.id, updateData, loadingKey);

    if (!updated) return;

    setTables((prev) =>
      prev.map((item) => (item.id === next.id ? { ...item, ...updateData } : item))
    );

    updateEditValue(next, updateData);

    if (next.is_active) {
      setSelectedTableId(next.id);
    }

    setTimeout(() => {
      inputsRef.current[`toggle-${next.id}`]?.focus();
    }, 0);
  };

  const handleCaptainKeyDown = async (e, table, index, field) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      return;
    }

    if (e.key !== "Enter" && e.key !== "ArrowDown") return;

    e.preventDefault();

    if (keyLockRef.current) return;

    keyLockRef.current = true;

    const value = e.target.value;
    const next = tables[index + 1];

    if (!next) {
      keyLockRef.current = false;
      return;
    }

    await saveCaptain(table, field, value);

    if (next.is_active) {
      updateEditValue(next, { [field]: value });
      await saveCaptain(next, field, value);
      setSelectedTableId(next.id);
    }

    setTimeout(() => {
      const refKey = field === "captain_id_am" ? `am-${next.id}` : `pm-${next.id}`;
      inputsRef.current[refKey]?.focus();
    }, 0);

    setTimeout(() => {
      keyLockRef.current = false;
    }, 180);
  };

  return (
    <div style={styles.container}>
      <div style={styles.tablesHeader}>
        <div style={styles.tableNoHeader}>الطاولة</div>
        <div style={styles.captainHeader}>كابتن صباحي</div>
        <div style={styles.captainHeader}>كابتن مسائي</div>
        <div style={styles.statusHeader}>الحالة</div>
      </div>

      {tables.map((table, index) => {
        const values = editValues[table.id] || table;
        const isSelected = selectedTableId === table.id;
        const amLoading = loadingCell === `${table.id}-captain_id_am`;
        const pmLoading = loadingCell === `${table.id}-captain_id_pm`;
        const toggleLoading = loadingCell === `${table.id}-toggle`;
        const isRowLoading = amLoading || pmLoading || toggleLoading;

        return (
          <div key={table.id} style={styles.row}>
            <div
              onMouseEnter={() => setHoveredTableId(table.id)}
              onMouseLeave={() => setHoveredTableId(null)}
              style={{
                ...styles.tableItem,
                background: isSelected ? "#2563eb" : hoveredTableId === table.id ? "#e5e7eb" : "#f1f5f9",
                color: isSelected ? "white" : "#111827",
                cursor: "pointer",
                opacity: isRowLoading ? 0.7 : 1,
              }}
              onClick={() => {
                if (isRowLoading) return;
                setSelectedTableId(table.id);
              }}
            >
              {table.table_name}
            </div>

            <select
              ref={(el) => {
                inputsRef.current[`am-${table.id}`] = el;
              }}
              value={values.captain_id_am || ""}
              disabled={!table.is_active || amLoading}
              onFocus={() => setSelectedTableId(table.id)}
              onChange={async (e) => {
                const value = e.target.value;
                updateEditValue(table, { captain_id_am: value });
                await saveCaptain(table, "captain_id_am", value);
              }}
              onBlur={async () => {
                if (!amLoading) {
                  await saveCaptain(table, "captain_id_am", values.captain_id_am);
                }
              }}
              onKeyDown={(e) => handleCaptainKeyDown(e, table, index, "captain_id_am")}
              style={{
                ...styles.select,
                opacity: table.is_active && !amLoading ? 1 : 0.5,
              }}
            >
              <option value="">{amLoading ? "..." : "--"}</option>
              {captains.map((captain) => (
                <option key={captain.id} value={captain.id}>
                  {captain.name}
                </option>
              ))}
            </select>

            <select
              ref={(el) => {
                inputsRef.current[`pm-${table.id}`] = el;
              }}
              value={values.captain_id_pm || ""}
              disabled={!table.is_active || pmLoading}
              onFocus={() => setSelectedTableId(table.id)}
              onChange={async (e) => {
                const value = e.target.value;
                updateEditValue(table, { captain_id_pm: value });
                await saveCaptain(table, "captain_id_pm", value);
              }}
              onBlur={async () => {
                if (!pmLoading) {
                  await saveCaptain(table, "captain_id_pm", values.captain_id_pm);
                }
              }}
              onKeyDown={(e) => handleCaptainKeyDown(e, table, index, "captain_id_pm")}
              style={{
                ...styles.select,
                opacity: table.is_active && !pmLoading ? 1 : 0.5,
              }}
            >
              <option value="">{pmLoading ? "..." : "--"}</option>
              {captains.map((captain) => (
                <option key={captain.id} value={captain.id}>
                  {captain.name}
                </option>
              ))}
            </select>

            <ActionButton
              loading={toggleLoading}
              disabled={toggleLoading}
              onClick={() => toggle(table)}
              style={{
                background: table.is_active ? "#22c55e" : "#ef4444",
                color: "white",
                fontSize: "10px",
              }}
              title="تغيير حالة الطاولة"
              buttonRef={(el) => {
                inputsRef.current[`toggle-${table.id}`] = el;
              }}
              onFocus={() => setSelectedTableId(table.id)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== "ArrowDown") return;

                e.preventDefault();
                e.stopPropagation();

                if (toggleLoading) return;

                handleOnOffKey(e, table, index);
              }}
            >
              {table.is_active ? "ON" : "OFF"}
            </ActionButton>
          </div>
        );
      })}

      {toast && (
        <div style={{
          position: "fixed",
          bottom: 200,
          left: 270,
          background: toast.type === "error" ? "#ef4444" : "#22c55e",
          color: "white",
          padding: "10px 15px",
          borderRadius: 8,
          zIndex: 99999,
          fontWeight: "700",
          fontSize: "16px",
          minWidth: "180px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}>
          {toast.message}
        </div>
      )}

    </div>
  );
}
