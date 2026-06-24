import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase dengan SERVICE ROLE KEY.
 * File ini diimpor oleh `server-only`, sehingga build akan gagal
 * jika ada Client Component yang mencoba mengimpornya secara tidak sengaja.
 * Service role key melewati Row Level Security — jangan pernah
 * mengirim client ini atau kuncinya ke browser.
 */

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Konfigurasi Supabase belum lengkap. Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah diisi di .env.local."
    );
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedClient;
}
