"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const submissionSchema = z
  .object({
    stageId: z.string().uuid(),
    fileUrl: z.string().url().optional().or(z.literal("")),
    linkUrl: z.string().url().optional().or(z.literal("")),
    note: z.string().trim().max(2000).optional(),
  })
  .refine((value) => Boolean(value.fileUrl || value.linkUrl), {
    message: "Unggah file atau isi link jawaban terlebih dahulu.",
  });

export type StageSubmissionState = { error: string } | null;

export async function submitStage(
  _previousState: StageSubmissionState,
  formData: FormData,
): Promise<StageSubmissionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi berakhir. Silakan masuk ulang." };
  }

  const parsed = submissionSchema.safeParse({
    stageId: formData.get("stageId"),
    fileUrl: formData.get("fileUrl") || "",
    linkUrl: formData.get("linkUrl") || "",
    note: formData.get("note") || "",
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Periksa kembali jawaban tes sebelum mengirim.",
    };
  }

  const { data: stage } = await supabase
    .from("application_stages")
    .select("id, application_id, kind, status")
    .eq("id", parsed.data.stageId)
    .maybeSingle();

  if (!stage) {
    return { error: "Tahapan tidak ditemukan." };
  }

  if (stage.kind !== "test") {
    return { error: "Tahapan ini tidak menerima jawaban tes." };
  }

  if (stage.status !== "current") {
    return { error: "Tahapan ini sudah tidak bisa diisi." };
  }

  const { error } = await supabase.from("stage_submissions").upsert(
    {
      application_stage_id: stage.id,
      application_id: stage.application_id,
      user_id: user.id,
      file_url: parsed.data.fileUrl || null,
      link_url: parsed.data.linkUrl || null,
      note: parsed.data.note || null,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "application_stage_id" },
  );

  if (error) {
    return { error: "Jawaban gagal disimpan. Silakan coba lagi." };
  }

  revalidatePath(`/dashboard/lamaran/${stage.application_id}`);
  redirect(`/dashboard/lamaran/${stage.application_id}?submitted=1`);
}
