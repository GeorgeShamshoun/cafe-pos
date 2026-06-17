import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://emtdsxiqnuqxnrieffgr.supabase.co";
const supabaseKey = "sb_publishable_ZXTz4_5MOCRaqq3141JRRw_na0Cex6i";

export const supabase = createClient(supabaseUrl, supabaseKey);