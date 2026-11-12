"use client";

import { createClient } from "@/lib/supabase/client";
import { uploadFileToStorage } from "@/services/file-upload";

export type UploadedCv = {
  id: string;
  title: string;
  source: "upload";
  file_url: string;
  created_at: string;
};

export async function uploadCv(file: File): Promise<UploadedCv> {
  const uploaded = await uploadFileToStorage(file, {
    maxSizeMb: 5,
    allowedTypes: ["application/pdf"],
    label: "CV",
  });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sesi berakhir. Silakan masuk ulang.");
  }

  const title = file.name.replace(/\.pdf$/i, "") || "CV";

  const { data: cv, error } = await supabase
    .from("candidate_cvs")
    .insert({
      user_id: user.id,
      title,
      source: "upload",
      file_url: uploaded.url,
    })
    .select("id, title, source, file_url, created_at")
    .single();

  if (error || !cv) {
    throw new Error("File berhasil diunggah, tetapi data CV gagal disimpan.");
  }

  return cv as UploadedCv;
}
