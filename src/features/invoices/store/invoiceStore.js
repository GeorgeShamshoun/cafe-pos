import { create } from "zustand";
import { supabase } from "../../../supabase";
import { recalculateOrderTotals } from "../../../services/orderTotalsService";
import {
  addOrMergeOrderItem,
  moveOrMergeOrderItem,
  updateOrderItemQuantity,
} from "../../../services/orderItemsService";

export const useInvoiceStore = create((set, get) => ({
  realtimeChannel: null,
  selectedOrder: null,
  openOrders: [],
  closedOrders: [],
  orderItems: [],
  selectedGroup: null,
  loading: false,

  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  setLoading: (value) => set({ loading: value }),

  fetchOpenOrders: async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, order_no, start_time, cashier_id, captain_id, table_id,
        order_shift_type, order_shift_date, subtotal, order_service_percentage,
        discount, service_amount, total_amount, is_take_away, is_closed,
        tables ( table_name, sort_index )
      `)
      .eq("is_closed", false)
    if (error) { console.log(error); return; }
    const sorted = (data || []).sort((a, b) => (a.tables?.sort_index || 0) - (b.tables?.sort_index || 0));
    set({ openOrders: sorted });
  },

fetchClosedOrders: async (shiftDate, shiftType) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id, order_no, start_time, cashier_id, captain_id, table_id,
      order_shift_type, order_shift_date, subtotal, order_service_percentage,
      discount, service_amount, total_amount, is_take_away, is_closed,
      tables ( table_name, sort_index )
    `)
    .eq("is_closed", true)
    .eq("order_shift_date", shiftDate)
    .eq("order_shift_type", shiftType);
  console.log("data =", data);
  if (error) {console.log(error);return;}
  const sorted = (data || []).sort((a, b) => (a.tables?.sort_index || 0) - (b.tables?.sort_index || 0));
  set({ closedOrders: sorted });
},

  loadOrderItems: async (orderId) => {
    if (!orderId) { set({ orderItems: [] }); return []; }

    set({ loading: true });

    const { data: orderItems, error } = await supabase
      .from("order_items").select("*").eq("order_id", orderId);

    if (error) { console.log(error); set({ loading: false }); return []; }
    if (!orderItems?.length) { set({ orderItems: [], loading: false }); return []; }

    const itemIds = orderItems.map((x) => x.item_id);
    const { data: itemsData } = await supabase
      .from("items").select("id, name_ar, name_en, sort_index").in("id", itemIds);

    const merged = orderItems.map((row) => {
      const item = (itemsData || []).find((i) => i.id === row.item_id);
      const unitPrice = Number(row.unit_price || 0);
      const quantity = Number(row.quantity || 0);
      return {
        ...row,
        item,
        sort_index: item?.sort_index ?? null,
        total: quantity * unitPrice,
      };
    });

    const sorted = merged.sort((a, b) => {
      const sa = a.sort_index ?? 999999;
      const sb = b.sort_index ?? 999999;
      return sa - sb;
    });

    set({ orderItems: sorted, loading: false });
    return sorted;
  },

  refreshSelectedOrder: async (orderId) => {
    if (!orderId) return null;

    const { data, error } = await supabase
      .from("orders")
      .select(`*, tables ( table_name, sort_index )`)
      .eq("id", orderId)
      .single();

    if (error) { console.log(error); return null; }

    set({ selectedOrder: data });
    return data;
  },

  refreshInvoiceData: async (orderId, shiftType, options = {}) => {
    const { full = true } = options;
    const tasks = [get().refreshSelectedOrder(orderId)];
    if (full) {
      tasks.push(get().loadOrderItems(orderId));
      tasks.push(get().fetchOpenOrders(shiftType));
    }
    await Promise.all(tasks);
  },

  refreshAfterItemChange: async (orderId) => {
    await Promise.all([
      get().loadOrderItems(orderId),
      get().recalculateAndSaveTotals(orderId),
    ]);
  },

  recalculateTotals: () => {
    const order = get().selectedOrder;
    const items = get().orderItems;
    if (!order) return;

    const subtotal = items.reduce((sum, row) => sum + Number(row.total || 0), 0);
    const servicePercentage = order.is_take_away ? 0 : Number(order.order_service_percentage || 0);
    const serviceAmount = subtotal * (servicePercentage / 100);
    const discount = Number(order.discount || 0);
    const totalAmount = subtotal + serviceAmount - discount;

    set({ selectedOrder: { ...order, subtotal, service_amount: serviceAmount, total_amount: totalAmount } });
  },

  softRefreshOrderTotals: (orderId) => {
    if (!orderId) return;
    const order = get().selectedOrder;
    if (!order || order.id !== orderId) return;

    const items = get().orderItems;
    const subtotal = items.reduce((sum, row) => sum + Number(row.total || 0), 0);
    const servicePercentage = order.is_take_away ? 0 : Number(order.order_service_percentage || 0);
    const serviceAmount = subtotal * (servicePercentage / 100);
    const discount = Number(order.discount || 0);
    const totalAmount = subtotal + serviceAmount - discount;

    set({ selectedOrder: { ...order, subtotal, service_amount: serviceAmount, total_amount: totalAmount } });
  },

  recalculateAndSaveTotals: async (orderId) => {
    if (!orderId) return;
    get().softRefreshOrderTotals(orderId);

    const { data, error } = await recalculateOrderTotals(orderId);
    if (error) { console.log("recalculateAndSaveTotals error:", error); return; }

    if (data) {
      set((state) => ({
        selectedOrder: state.selectedOrder?.id === orderId
          ? { ...state.selectedOrder, ...data }
          : state.selectedOrder,
      }));
    }
  },

  addItemToOrder: async (orderId, item) => {
    if (!orderId || !item?.id) return;

    const result = await addOrMergeOrderItem(orderId, item.id, 1);
    if (result?.error) { console.log(result.error); return; }

    await get().loadOrderItems(orderId);
    await get().recalculateAndSaveTotals(orderId);
  },

  increaseQty: async (row) => {
    if (!row?.id) return;

    const nextQuantity = Number(row.quantity || 0) + 1;
    const { error } = await updateOrderItemQuantity(row.id, nextQuantity);
    if (error) { console.log(error); return; }

    await get().loadOrderItems(row.order_id);
    await get().recalculateAndSaveTotals(row.order_id);
  },

decreaseQty: async (row) => {
  if (!row?.id) return false;
  if (row.quantity <= 1) return false;

  const nextQuantity = Number(row.quantity || 0) - 1;

  const { error } = await updateOrderItemQuantity(
    row.id,
    nextQuantity
  );

  if (error) {
    console.log(error);
    return false;
  }

  await get().loadOrderItems(row.order_id);
  await get().recalculateAndSaveTotals(row.order_id);

  return true;
},

  moveItemToOrder: async (row, targetOrderId, shiftType) => {
    if (!row?.id || !targetOrderId) return;

    const result = await moveOrMergeOrderItem(row, targetOrderId);
    if (result?.error) { console.log(result.error); return; }

    await Promise.all([
      recalculateOrderTotals(row.order_id),
      recalculateOrderTotals(targetOrderId),
    ]);
    await get().refreshInvoiceData(row.order_id, shiftType);
  },

  addItemByCode: async (quickCode, orderId) => {
    if (!quickCode || !orderId) return false;

    const codeNumber = Number(quickCode);
    if (Number.isNaN(codeNumber)) return false;

    const { data: item } = await supabase
      .from("items")
      .select("id")
      .eq("sort_index", codeNumber)
      .eq("is_active", true)
      .single();

    if (!item) return false;

    const result = await addOrMergeOrderItem(orderId, item.id, 1);
    if (result?.error) { console.log(result.error); return false; }

    await get().loadOrderItems(orderId);
    await get().recalculateAndSaveTotals(orderId);
    return true;
  },

  updateOrderItemInState: (updatedRow) => {
    const items = get().orderItems;
    const newItems = items.map((row) => row.id === updatedRow.id ? updatedRow : row);
    set({ orderItems: newItems });
  },

  deleteOrderItem: async (row) => {
    if (!row?.id) return;

    const { error } = await supabase.from("order_items").delete().eq("id", row.id);
    if (error) { console.log(error); return; }

    const items = get().orderItems.filter((r) => r.id !== row.id);
    set({ orderItems: items });
    await get().recalculateAndSaveTotals(row.order_id);
  },

  // ✅ FIX closure: بنستخدم get() عشان دايما نقرأ أحدث selectedOrder
  subscribeToOrderItems: (orderId) => {
    const existing = get().realtimeChannel;
    if (existing) {
      supabase.removeChannel(existing);
      set({ realtimeChannel: null });
    }

    const channelName = `order-items-${orderId}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
          filter: `order_id=eq.${orderId}`,
        },
        async () => {
          // ✅ get() بيجيب أحدث state دايماً — مفيش closure problem هنا
          await get().loadOrderItems(orderId);
          await get().refreshSelectedOrder(orderId);
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
    return channel;
  },

  unsubscribeFromOrderItems: () => {
    const channel = get().realtimeChannel;
    if (channel) {
      supabase.removeChannel(channel);
      set({ realtimeChannel: null });
    }
  },

  syncOrder: async (orderId) => {
    await Promise.all([
      get().loadOrderItems(orderId),
      get().refreshSelectedOrder(orderId),
    ]);
  },
}));
