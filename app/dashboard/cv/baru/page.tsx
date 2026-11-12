import { emptyCvData } from "@/lib/cv";
import { requireUser } from "@/lib/supabase/auth";

import { CvEditor } from "../cv-editor";

export const instant = false;

export default async function NewCvPage() {
  const { user, supabase } = await requireUser("/dashboard/cv/baru");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const initialData = {
    ...emptyCvData(),
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? user.email ?? "",
  };

  return (
    <CvEditor
      initialTitle="CV Saya"
      initialData={initialData}
    />
  );
}
