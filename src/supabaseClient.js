import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn("Aviso: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram definidos no ambiente. O app usará dados locais de fallback.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

