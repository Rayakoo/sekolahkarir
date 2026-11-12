"use client";

export type UploadedFile = {
  url: string;
  fileName: string;
};

type UploadOptions = {
  maxSizeMb?: number;
  allowedTypes?: string[];
  label?: string;
};

/**
 * Upload generik ke Edge Function Omahnalar `uploadfile`.
 * Function mengembalikan { url, fileName } dan menyimpan file di Garage.
 */
export async function uploadFileToStorage(
  file: File,
  options: UploadOptions = {},
): Promise<UploadedFile> {
  const {
    maxSizeMb = 10,
    allowedTypes,
    label = "File",
  } = options;

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    throw new Error("Format file tidak didukung.");
  }

  if (file.size > maxSizeMb * 1024 * 1024) {
    throw new Error(`Ukuran ${label.toLowerCase()} maksimal ${maxSizeMb} MB.`);
  }

  const functionUrl = process.env.NEXT_PUBLIC_UPLOAD_FUNCTION_URL;
  const functionKey = process.env.NEXT_PUBLIC_UPLOAD_FUNCTION_KEY;

  if (!functionUrl || !functionKey) {
    throw new Error(
      "NEXT_PUBLIC_UPLOAD_FUNCTION_URL atau NEXT_PUBLIC_UPLOAD_FUNCTION_KEY belum diisi.",
    );
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${functionKey}`,
      apikey: functionKey,
    },
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | { url?: string; fileName?: string; error?: string; message?: string }
    | null;

  if (!response.ok || !payload?.url) {
    throw new Error(
      payload?.error ??
        payload?.message ??
        `Gagal mengunggah ${label.toLowerCase()}. Coba lagi.`,
    );
  }

  return {
    url: payload.url,
    fileName: payload.fileName ?? file.name,
  };
}
