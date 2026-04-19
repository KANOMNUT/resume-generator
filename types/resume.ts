/**
 * UI-level preview data types — used by the live preview templates.
 * These mirror ResumeData from lib/schema.ts but use string[] for skills
 * and include location. Preview templates consume PreviewData directly.
 */

export type LinkType = "git" | "portfolio" | "linkedin" | "other";
export type LanguageLevel =
  | "native"
  | "fluent"
  | "advanced"
  | "intermediate"
  | "basic";
export type TemplateId = "classic" | "modern" | "compact";

export interface PreviewLink {
  type: LinkType;
  url: string;
  otherLabel?: string;
}

export interface PreviewProject {
  name: string;
  detail?: string;
}

export interface PreviewExperience {
  company: string;
  position: string;
  startMonth: string;
  startYear: string;
  endMonth?: string;
  endYear?: string;
  isCurrent: boolean;
  description: string;
  projects: PreviewProject[];
}

export interface PreviewEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear: string;
  endYear?: string;
  isCurrent: boolean;
  description?: string;
}

export interface PreviewLanguage {
  language: string;
  level: LanguageLevel;
}

export interface PreviewCertificate {
  name: string;
  issuer: string;
  year?: string;
}

export interface PreviewData {
  firstName: string;
  lastName: string;
  nickname?: string;
  title?: string;
  email: string;
  phone: string;
  location?: string;
  photo?: string;
  summary: string;
  links: PreviewLink[];
  experience: PreviewExperience[];
  education: PreviewEducation[];
  languages: PreviewLanguage[];
  /** Plain string array for preview rendering */
  skills: string[];
  certificates: PreviewCertificate[];
}

export const LEVEL_LABELS: Record<LanguageLevel, string> = {
  native: "Native",
  fluent: "Fluent",
  advanced: "Advanced",
  intermediate: "Intermediate",
  basic: "Basic",
};

export const LINK_TYPE_LABELS: Record<LinkType, string> = {
  git: "Git Repo",
  portfolio: "Portfolio",
  linkedin: "LinkedIn",
  other: "Other",
};

export const ACCENTS = [
  { name: "Indigo", value: "#3a3dd6", soft: "#eceafb" },
  { name: "Forest", value: "#1f6b3a", soft: "#e6f0e9" },
  { name: "Slate", value: "#1a1b1e", soft: "#ededec" },
  { name: "Amber", value: "#b06510", soft: "#f7ece1" },
  { name: "Plum", value: "#72246a", soft: "#f1e6ef" },
] as const;

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const currentYear = new Date().getFullYear();
export const YEARS = Array.from(
  { length: currentYear - 1959 },
  (_, i) => String(currentYear + 1 - i)
);

export function dateStr(
  startMonth: string,
  startYear: string,
  isCurrent: boolean,
  endMonth?: string,
  endYear?: string
): string {
  const start = [startMonth, startYear].filter(Boolean).join(" ");
  const end = isCurrent
    ? "Present"
    : [endMonth, endYear].filter(Boolean).join(" ");
  if (!start) return "";
  return end ? `${start} \u2014 ${end}` : start;
}

export function yearRange(
  startYear: string,
  endYear?: string,
  isCurrent?: boolean
): string {
  const end = isCurrent ? "Present" : endYear || "";
  if (!startYear) return "";
  return end ? `${startYear} \u2013 ${end}` : startYear;
}
