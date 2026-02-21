import { z } from "zod";

const linkSchema = z.object({
  type: z.enum(["git", "portfolio", "linkedin", "other"]),
  url: z.string().url("Must be a valid URL").max(500, "URL too long"),
  otherLabel: z.string().max(50, "Label too long").optional().or(z.literal("")),
});

const experienceSchema = z.object({
  company: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name too long"),
  position: z
    .string()
    .min(1, "Position is required")
    .max(200, "Position too long"),
  startMonth: z.string().min(1, "Start month is required").max(20, "Invalid month"),
  startYear: z.string().min(1, "Start year is required").max(4, "Invalid year"),
  endMonth: z.string().max(20, "Invalid month").optional().or(z.literal("")),
  endYear: z.string().max(4, "Invalid year").optional().or(z.literal("")),
  isCurrent: z.boolean(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description too long"),
  projects: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, "Project name is required")
          .max(200, "Project name too long"),
        detail: z
          .string()
          .max(2000, "Project detail too long")
          .optional()
          .or(z.literal("")),
      })
    )
    .max(10, "Maximum 10 projects per experience"),
});

const educationSchema = z.object({
  institution: z
    .string()
    .min(1, "Institution is required")
    .max(200, "Institution name too long"),
  degree: z
    .string()
    .min(1, "Degree is required")
    .max(200, "Degree too long"),
  fieldOfStudy: z
    .string()
    .max(200, "Field of study too long")
    .optional()
    .or(z.literal("")),
  duration: z
    .string()
    .min(1, "Duration is required")
    .max(100, "Duration too long"),
  description: z
    .string()
    .max(1000, "Description too long")
    .optional()
    .or(z.literal("")),
});

const languageSchema = z.object({
  language: z.string().min(1, "Language is required").max(100, "Language name too long"),
  level: z.enum(["native", "fluent", "advanced", "intermediate", "basic"], {
    error: "Please select a proficiency level",
  }),
});

const certificateSchema = z.object({
  name: z
    .string()
    .min(1, "Certificate name is required")
    .max(200, "Certificate name too long"),
  issuer: z
    .string()
    .min(1, "Issuer is required")
    .max(200, "Issuer too long"),
  year: z.string().max(10, "Year too long").optional().or(z.literal("")),
});

export const resumeSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name too long"),
  nickname: z.string().max(50, "Nickname too long").optional().or(z.literal("")),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Must be a valid email")
    .max(254, "Email too long"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(30, "Phone number too long"),
  photo: z
    .string()
    .max(600000, "Photo file is too large (max ~450KB)")
    .refine(
      (val) => /^data:image\/(jpeg|jpg|png|webp);base64,/.test(val),
      "Photo must be a valid JPEG, PNG, or WebP image"
    )
    .optional(),
  links: z.array(linkSchema).max(10, "Maximum 10 links"),
  summary: z
    .string()
    .min(1, "Professional summary is required")
    .max(2000, "Summary too long"),
  experience: z
    .array(experienceSchema)
    .max(20, "Maximum 20 experience entries"),
  education: z
    .array(educationSchema)
    .max(10, "Maximum 10 education entries"),
  languages: z.array(languageSchema).max(20, "Maximum 20 languages"),
  skills: z
    .array(z.object({ value: z.string().min(1, "Skill cannot be empty").max(100, "Skill too long") }))
    .max(50, "Maximum 50 skills"),
  certificates: z
    .array(certificateSchema)
    .max(20, "Maximum 20 certificates"),
});

export type ResumeData = z.infer<typeof resumeSchema>;
