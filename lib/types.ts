export type StageKind = "cv" | "test" | "interview" | "announcement" | "other";

export type JobStage = {
  id: string;
  title: string;
  description: string | null;
  kind: StageKind;
  sort_order: number;
};

export type Job = {
  id: string;
  slug: string;
  title: string;
  team: string;
  location: string;
  employment_type: string;
  summary: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salary_range: string | null;
  deadline: string | null;
  is_open: boolean;
  sort_order: number;
};

export type JobWithStages = Job & {
  job_stages: JobStage[];
};

export type CvSource = "upload" | "builder";

export type CandidateCv = {
  id: string;
  title: string;
  source: CvSource;
  file_url: string | null;
  storage_path: string | null;
  data: unknown;
  created_at: string;
  updated_at: string;
};

export type StageSubmission = {
  id: string;
  file_url: string | null;
  link_url: string | null;
  note: string | null;
  submitted_at: string;
};

export type ApplicationStage = {
  id: string;
  title: string;
  description: string | null;
  kind: StageKind;
  sort_order: number;
  status: "locked" | "current" | "completed" | "rejected";
  scheduled_start: string | null;
  scheduled_end: string | null;
  note: string | null;
  completed_at: string | null;
  stage_submissions: StageSubmission[] | null;
};

export type Application = {
  id: string;
  job_id: string;
  cv_id: string | null;
  cv_title: string;
  cv_source: CvSource;
  cover_letter: string | null;
  status: "in_progress" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  updated_at: string;
  jobs: Job | null;
  application_stages: ApplicationStage[];
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "candidate" | "admin";
};
