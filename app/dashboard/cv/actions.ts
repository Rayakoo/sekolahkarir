"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { cvDataSchema } from "@/lib/cv";
import { createClient } from "@/lib/supabase/server";

const saveCvSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Nama CV wajib diisi.").max(80),
  data: cvDataSchema,
});

export type SaveCvState = { error: string } | null;

export async function saveCv(
  _previousState: SaveCvState,
  formData: FormData,
): Promise<SaveCvState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi berakhir. Silakan masuk ulang." };
  }

  let parsedData: unknown;

  try {
    parsedData = JSON.parse(String(formData.get("data") ?? "{}"));
  } catch {
    return { error: "Data CV tidak valid." };
  }

  const rawId = formData.get("id");
  const parsed = saveCvSchema.safeParse({
    id: typeof rawId === "string" && rawId ? rawId : undefined,
    title: formData.get("title"),
    data: parsedData,
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Periksa kembali data CV sebelum menyimpan.",
    };
  }

  if (parsed.data.id) {
    const { data: updated, error } = await supabase
      .from("candidate_cvs")
      .update({
        title: parsed.data.title,
        data: parsed.data.data,
        source: "builder",
      })
      .eq("id", parsed.data.id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error || !updated) {
      return { error: "CV tidak ditemukan atau gagal diperbarui." };
    }
  } else {
    const { error } = await supabase.from("candidate_cvs").insert({
      user_id: user.id,
      title: parsed.data.title,
      source: "builder",
      data: parsed.data.data,
    });

    if (error) {
      return { error: "CV gagal disimpan. Coba lagi." };
    }
  }

  revalidatePath("/dashboard/cv");
  redirect("/dashboard/cv?saved=1");
}
