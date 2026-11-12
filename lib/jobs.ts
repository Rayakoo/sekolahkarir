import "server-only";

import { connection } from "next/server";

import { createPublicClient } from "@/lib/supabase/public";
import type { Job, JobWithStages } from "@/lib/types";

const JOB_FIELDS =
  "id, slug, title, team, location, employment_type, summary, description, requirements, responsibilities, benefits, salary_range, deadline, is_open, sort_order";

export async function getOpenJobs(): Promise<Job[]> {
  await connection();

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("jobs")
      .select(JOB_FIELDS)
      .eq("is_open", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("getOpenJobs:", error.message);
      return [];
    }

    return (data ?? []) as Job[];
  } catch (error) {
    console.error("getOpenJobs:", error);
    return [];
  }
}

export async function getJobBySlug(
  slug: string,
): Promise<JobWithStages | null> {
  await connection();

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("jobs")
      .select(`${JOB_FIELDS}, job_stages(id, title, description, kind, sort_order)`)
      .eq("slug", slug)
      .eq("is_open", true)
      .maybeSingle();

    if (error) {
      console.error("getJobBySlug:", error.message);
      return null;
    }

    if (!data) return null;

    const job = data as unknown as JobWithStages;
    return {
      ...job,
      job_stages: (job.job_stages ?? []).sort(
        (a, b) => a.sort_order - b.sort_order,
      ),
    };
  } catch (error) {
    console.error("getJobBySlug:", error);
    return null;
  }
}
