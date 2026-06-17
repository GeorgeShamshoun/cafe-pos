import { supabase } from "../supabase";

export async function getCafeSettings(cafeId) {
  if (!cafeId) return { data: {}, error: null };

  return supabase
    .from("cafes")
    .select("*")
    .eq("id", cafeId)
    .single();
}

export async function updateCafeSettings(cafeId, settings) {
  return supabase
    .from("cafes")
    .update({
      service_percentage: Number(settings.service_percentage) || 0,
      service_name_ar: settings.service_name_ar,
      service_name_en: settings.service_name_en,
      receipt_footer_ar: settings.receipt_footer_ar,
      receipt_footer_en: settings.receipt_footer_en,
    })
    .eq("id", cafeId);
}
