"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const applySchema = z.object({
  jobId: z.string().uuid(),
  cvId: z.string().uuid(),
  coverLetter: z.string().max(3000).optional(),
});

export type ApplyState = { error: string } | null;

export async function applyToJob(
  _previousState: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi berakhir. Silakan masuk ulang." };
  }

  const parsed = applySchema.safeParse({
    jobId: formData.get("jobId"),
    cvId: formData.get("cvId"),
    coverLetter: formData.get("coverLetter") || undefined,
  });

  if (!parsed.success) {
    return { error: "Pilih CV terlebih dahulu sebelum mengirim lamaran." };
  }

  const { data, error } = await supabase.rpc("apply_to_job", {
    p_job_id: parsed.data.jobId,
    p_cv_id: parsed.data.cvId,
    p_cover_letter: parsed.data.coverLetter ?? null,
  });

  if (error) {
    return {
      error:
        error.message ||
        "Lamaran gagal dikirim. Silakan coba beberapa saat lagi.",
    };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/lamaran/${data}?baru=1`);
}
