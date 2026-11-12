import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "./server";

export async function requireUser(nextPath?: string) {
  // Session reads use cookies and time-based token checks, so this helper
  // must never run during prerendering.
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const target = nextPath
      ? `/masuk?next=${encodeURIComponent(nextPath)}`
      : "/masuk";
    redirect(target);
  }

  return { user, supabase };
}
