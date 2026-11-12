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

  const { data: applicationId, error } = await supabase.rpc(
    "submit_stage_answer",
    {
      p_stage_id: parsed.data.stageId,
      p_file_url: parsed.data.fileUrl || null,
      p_link_url: parsed.data.linkUrl || null,
      p_note: parsed.data.note || null,
    },
  );

  if (error || !applicationId) {
    return {
      error:
        error?.message ??
        "Jawaban gagal disimpan. Silakan coba lagi.",
    };
  }

  revalidatePath(`/dashboard/lamaran/${applicationId}`);
  redirect(`/dashboard/lamaran/${applicationId}?submitted=1`);
}
