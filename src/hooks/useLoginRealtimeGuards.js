import { useEffect } from "react";
import { getCurrentPermissionKeys } from "../services/authService";
import { supabase } from "../supabase";

export default function useLoginRealtimeGuards({
  user,
  handleLogout,
  showMessage,
  setPermissions,
}) {
  // ✅ استمع على الكافيه — لو اتوقف اعمل logout
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`cafe-guard-${user.cafe_id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "cafes",
          filter: `id=eq.${user.cafe_id}`,
        },
        (payload) => {
          if (payload.new.is_active === false) {
            showMessage({
              title: "تم إيقاف الكافيه",
              message: "تم تسجيل الخروج الكافيه موقوف.",
              type: "error",
            });
            handleLogout();
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, handleLogout, showMessage]);

  // ✅ استمع على الـ user الحالي — لو اتوقف اعمل logout
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-guard-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const updatedUser = payload.new;
          if (
            updatedUser.is_active === false ||
            updatedUser.status !== "active"
          ) {
            showMessage({
              title: "تم إيقاف المستخدم",
              message: "تم تسجيل الخروج المستخدم غير مفعل.",
              type: "error",
            });
            handleLogout();
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, handleLogout, showMessage]);

  // ✅ استمع على كل user_permissions في الكافيه بدون filter
  // عشان لو أي يوزر اتغيرت صلاحياته يتحدث فوراً
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`perm-guard-${user.cafe_id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_permissions",
          // ✅ بدون filter — بنفلتر manually
        },
        async (payload) => {
          // ✅ نتجاهل لو التغيير مش للـ user الحالي
          const record = payload?.new || payload?.old || {};
          if (record.user_id && record.user_id !== user.id) return;

          const { data: permissionKeys, error } =
            await getCurrentPermissionKeys(user.id);

          if (error) {
            console.log("Permissions refresh error:", error);
            return;
          }

          if (!permissionKeys.includes("login.web")) {
            showMessage({
              title: "تم سحب الصلاحية",
              message: "تم تسجيل الخروج صلاحية الدخول تم سحبها.",
              type: "warning",
            });
            handleLogout();
            return;
          }

          // ✅ تحديث الـ permissions فوراً بدون reload
          setPermissions(permissionKeys);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, handleLogout, showMessage, setPermissions]);
}