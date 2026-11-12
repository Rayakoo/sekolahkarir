import { notFound } from "next/navigation";

import { parseCvData } from "@/lib/cv";
import { requireUser } from "@/lib/supabase/auth";

import { CvEditor } from "../cv-editor";

export const instant = false;

export default async function EditCvPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, supabase } = await requireUser(`/dashboard/cv/${id}`);

  const { data: cv } = await supabase
    .from("candidate_cvs")
    .select("id, title, source, data")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cv || cv.source !== "builder") notFound();

  return (
    <CvEditor
      cvId={cv.id}
      initialTitle={cv.title}
      initialData={parseCvData(cv.data)}
    />
  );
}
