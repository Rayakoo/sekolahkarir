import { z } from "zod";

export const cvDataSchema = z.object({
  fullName: z.string().trim().max(80).default(""),
  headline: z.string().trim().max(120).default(""),
  email: z.string().trim().max(120).default(""),
  phone: z.string().trim().max(40).default(""),
  location: z.string().trim().max(80).default(""),
  summary: z.string().trim().max(1200).default(""),
  skills: z.array(z.string().trim().max(60)).max(30).default([]),
  experiences: z
    .array(
      z.object({
        role: z.string().trim().max(100).default(""),
        company: z.string().trim().max(100).default(""),
        period: z.string().trim().max(60).default(""),
        description: z.string().trim().max(1000).default(""),
      }),
    )
    .max(10)
    .default([]),
  educations: z
    .array(
      z.object({
        school: z.string().trim().max(120).default(""),
        degree: z.string().trim().max(100).default(""),
        period: z.string().trim().max(60).default(""),
      }),
    )
    .max(6)
    .default([]),
});

export type CvData = z.infer<typeof cvDataSchema>;

export function emptyCvData(): CvData {
  return {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    skills: [],
    experiences: [],
    educations: [],
  };
}

export function parseCvData(value: unknown): CvData {
  const parsed = cvDataSchema.safeParse(value);
  return parsed.success ? parsed.data : emptyCvData();
}
