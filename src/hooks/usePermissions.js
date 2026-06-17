import React, { useMemo, useCallback } from "react";

// Memoized hook for permission checking
export const usePermissions = (permissions = []) => {
  const hasPermission = useCallback((key) => {
    return permissions?.includes(key) ?? false;
  }, [permissions]);

  const can = useMemo(() => ({
    viewItems: hasPermission("items.view"),
    viewUsers: hasPermission("users.view"),
    viewTables: hasPermission("tables.view"),
    viewOptions: hasPermission("options.view"),
    addOrder: hasPermission("order.add"),
    deleteOrder: hasPermission("order.delete"),
    printOrder: hasPermission("order.print"),
    updateDiscount: hasPermission("order.discount"),
    updateService: hasPermission("order.service"),
    shiftManagement: hasPermission("date.shift"),
  }), [hasPermission]);

  return { hasPermission, can };
};
