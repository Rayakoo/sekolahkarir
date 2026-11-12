import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "./env";

/**
 * Public client for data that does not depend on the signed-in user.
 * It does not read cookies, so it can be used on public pages.
 */
export function createPublicClient() {
  const { url, key } = getSupabaseConfig();

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
