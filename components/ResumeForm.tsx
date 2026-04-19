"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeSchema, type ResumeData } from "@/lib/schema";
import { PreviewData, TemplateId } from "@/types/resume";
import type { CompletionChecks as CompChecks } from "@/components/ui/ProgressStrip";

import Topbar from "@/components/Topbar";
import ResumePreview from "@/components/preview/ResumePreview";
import TweaksPanel from "@/components/TweaksPanel";
import ProgressStrip from "@/components/ui/ProgressStrip";
import SectionCard from "@/components/ui/SectionCard";
import Icon from "@/components/ui/Icon";

import PersonalSection from "@/components/form/PersonalSection";
import LinksSection from "@/components/form/LinksSection";
import SummarySection from "@/components/form/SummarySection";
import ExperienceSection from "@/components/form/ExperienceSection";
import EducationSection from "@/components/form/EducationSection";
import SkillsSection from "@/components/form/SkillsSection";
import LanguagesSection from "@/components/form/LanguagesSection";
import CertificatesSection from "@/components/form/CertificatesSection";

// ---------- Sample data ----------
const SAMPLE_DATA: ResumeData = {
  firstName: "Elena",
  lastName: "Marchetti",
  nickname: "",
  title: "Senior Product Designer",
  email: "elena.marchetti@proton.me",
  phone: "+39 347 812 9045",
  location: "Milan, Italy",
  summary:
    "Product designer with 9 years of experience shaping B2B software — design systems, data-dense interfaces, and the zero-to-one work that ships them. Previously at Figma and Algolia; I care about craft, clarity, and shipping on time.",
  links: [
    { type: "portfolio", url: "https://elena.design", otherLabel: "" },
    { type: "linkedin", url: "https://linkedin.com/in/emarchetti", otherLabel: "" },
    { type: "git", url: "https://github.com/emarch", otherLabel: "" },
  ],
  experience: [
    {
      company: "Figma",
      position: "Senior Product Designer, Dev Mode",
      startMonth: "Mar",
      startYear: "2023",
      endMonth: "",
      endYear: "",
      isCurrent: true,
      description:
        "Lead designer for Dev Mode — the handoff surface used by 2M+ developers monthly. Ship the inspection panel, code gen, and VS Code integration.",
      projects: [
        {
          name: "Inspect panel redesign",
          detail: "Reduced time-to-first-copy by 42% in usability testing.",
        },
      ],
    },
  ],
  education: [
    {
      institution: "Politecnico di Milano",
      degree: "MSc Communication Design",
      fieldOfStudy: "",
      startYear: "2013",
      endYear: "2015",
      isCurrent: false,
      description: "",
    },
  ],
  languages: [
    { language: "Italian", level: "native" },
    { language: "English", level: "fluent" },
    { language: "Spanish", level: "intermediate" },
  ],
  skills: [
    { value: "Figma" },
    { value: "Design systems" },
    { value: "Prototyping" },
    { value: "User research" },
    { value: "HTML/CSS" },
  ],
  certificates: [
    {
      name: "Nielsen Norman UX Certificate",
      issuer: "NN/g",
      year: "2021",
    },
  ],
};

const EMPTY_DATA: ResumeData = {
  firstName: "",
  lastName: "",
  nickname: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  links: [],
  experience: [],
  education: [],
  languages: [],
  skills: [],
  certificates: [],
};

// ---------- Completeness logic ----------
function computeCompleteness(data: Partial<ResumeData>): {
  checks: CompChecks;
  pct: number;
} {
  const checks: CompChecks = {
    personal: !!(
      data.firstName &&
      data.lastName &&
      data.email &&
      data.phone
    ),
    links: (data.links || []).some((l) => l.url),
    summary: !!(data.summary && data.summary.length > 20),
    experience: (data.experience || []).some(
      (e) => e.company && e.position
    ),
    education: (data.education || []).some(
      (e) => e.institution && e.degree
    ),
    skills: (data.skills || []).length >= 3,
    languages: (data.languages || []).length >= 1,
    certificates: (data.certificates || []).length >= 1,
  };

  const required: (keyof CompChecks)[] = [
    "personal",
    "summary",
    "experience",
    "education",
  ];
  const bonus: (keyof CompChecks)[] = [
    "links",
    "skills",
    "languages",
    "certificates",
  ];

  const reqDone = required.filter((k) => checks[k]).length;
  const bonusDone = bonus.filter((k) => checks[k]).length;
  const pct = Math.round(
    ((reqDone / required.length) * 0.8 + (bonusDone / bonus.length) * 0.2) *
      100
  );

  return { checks, pct };
}

// ---------- RHF data → PreviewData ----------
function toPreviewData(data: Partial<ResumeData>, photo: string | null): PreviewData {
  return {
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    nickname: data.nickname || "",
    title: data.title || "",
    email: data.email || "",
    phone: data.phone || "",
    location: data.location || "",
    photo: photo || undefined,
    summary: data.summary || "",
    links: (data.links || []).map((l) => ({
      type: l.type,
      url: l.url,
      otherLabel: l.otherLabel,
    })),
    experience: (data.experience || []).map((e) => ({
      company: e.company,
      position: e.position,
      startMonth: e.startMonth,
      startYear: e.startYear,
      endMonth: e.endMonth,
      endYear: e.endYear,
      isCurrent: e.isCurrent,
      description: e.description,
      projects: (e.projects || []).map((p) => ({
        name: p.name,
        detail: p.detail,
      })),
    })),
    education: (data.education || []).map((e) => ({
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      startYear: e.startYear,
      endYear: e.endYear,
      isCurrent: e.isCurrent,
      description: e.description,
    })),
    languages: (data.languages || []).map((l) => ({
      language: l.language,
      level: l.level,
    })),
    // Map { value: string }[] → string[]
    skills: (data.skills || []).map((s) => s.value).filter(Boolean),
    certificates: (data.certificates || []).map((c) => ({
      name: c.name,
      issuer: c.issuer,
      year: c.year,
    })),
  };
}

type SectionKey =
  | "personal"
  | "links"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "certificates";

export default function ResumeForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [accent, setAccent] = useState("#3a3dd6");
  const [zoom, setZoom] = useState(0.85);
  const [tweaksOpen, setTweaksOpen] = useState(true);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    {
      personal: true,
      links: false,
      summary: false,
      experience: true,
      education: false,
      skills: false,
      languages: false,
      certificates: false,
    }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResumeData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: SAMPLE_DATA,
  });

  // Watch all form values for live preview
  const watchedData = useWatch({ control });

  // Apply accent CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  const { checks, pct } = useMemo(
    () => computeCompleteness(watchedData as Partial<ResumeData>),
    [watchedData]
  );

  const previewData = useMemo(
    () => toPreviewData(watchedData as Partial<ResumeData>, photoBase64),
    [watchedData, photoBase64]
  );

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: true }));
  };

  const onSubmit = async (data: ResumeData) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      const submissionData: ResumeData = {
        ...data,
        photo: photoBase64 ?? undefined,
      };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...submissionData, template, accentColor: accent }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to generate PDF: ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.firstName}_${data.lastName}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate PDF. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const firstName = (watchedData as Partial<ResumeData>).firstName || "";
  const lastName = (watchedData as Partial<ResumeData>).lastName || "";

  return (
    <>
      <Topbar
        firstName={firstName}
        lastName={lastName}
        onStartEmpty={() => {
          reset(EMPTY_DATA);
          setPhotoBase64(null);
        }}
        onGeneratePDF={() => handleSubmit(onSubmit)()}
        isGenerating={isGenerating}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(460px, 1fr) minmax(540px, 1.1fr)",
          height: "calc(100vh - 55px)",
        }}
      >
        {/* ---- LEFT: Form ---- */}
        <div
          className="pane"
          style={{
            borderRight: "1px solid var(--line)",
            background: "var(--bg)",
            overflowY: "auto",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div
              style={{
                maxWidth: "640px",
                margin: "0 auto",
                padding: "24px 28px 120px",
              }}
            >
              {/* Form header */}
              <div style={{ marginBottom: "6px" }}>
                <h1
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "28px",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}
                >
                  Craft your resume
                </h1>
                <p
                  style={{
                    color: "var(--ink-3)",
                    fontSize: "13.5px",
                    margin: "6px 0 0",
                  }}
                >
                  Edit on the left, watch the PDF update on the right. Switch
                  templates anytime.
                </p>
              </div>

              {/* Progress strip */}
              <ProgressStrip
                checks={checks}
                pct={pct}
                onChipClick={(key) => openSection(key as SectionKey)}
              />

              {/* Error banner */}
              {error && (
                <div
                  style={{
                    background: "#fdecea",
                    border: "1px solid #f5b8bb",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px 14px",
                    fontSize: "13px",
                    color: "var(--danger)",
                    marginBottom: "12px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* 1. Personal */}
              <SectionCard
                n={1}
                title="Personal information"
                subtitle={
                  firstName && lastName
                    ? `${firstName} ${lastName}`
                    : "Name, contact, photo"
                }
                done={checks.personal}
                open={openSections.personal}
                onToggle={() => toggleSection("personal")}
              >
                <PersonalSection
                  register={register}
                  errors={errors}
                  onPhotoChange={setPhotoBase64}
                  photoPreview={photoBase64}
                />
              </SectionCard>

              {/* 2. Links */}
              <SectionCard
                n={2}
                title="Links"
                subtitle={`${(watchedData.links || []).length} added`}
                done={checks.links}
                open={openSections.links}
                onToggle={() => toggleSection("links")}
              >
                <LinksSection
                  control={control}
                  register={register}
                  errors={errors}
                />
              </SectionCard>

              {/* 3. Summary */}
              <SectionCard
                n={3}
                title="Professional summary"
                subtitle={
                  watchedData.summary
                    ? `${watchedData.summary.length} chars`
                    : "Required"
                }
                done={checks.summary}
                open={openSections.summary}
                onToggle={() => toggleSection("summary")}
              >
                <SummarySection register={register} errors={errors} />
              </SectionCard>

              {/* 4. Experience */}
              <SectionCard
                n={4}
                title="Work experience"
                subtitle={`${(watchedData.experience || []).length} role${(watchedData.experience || []).length === 1 ? "" : "s"}`}
                done={checks.experience}
                open={openSections.experience}
                onToggle={() => toggleSection("experience")}
              >
                <ExperienceSection
                  control={control}
                  register={register}
                  errors={errors}
                />
              </SectionCard>

              {/* 5. Education */}
              <SectionCard
                n={5}
                title="Education"
                subtitle={`${(watchedData.education || []).length} entr${(watchedData.education || []).length === 1 ? "y" : "ies"}`}
                done={checks.education}
                open={openSections.education}
                onToggle={() => toggleSection("education")}
              >
                <EducationSection
                  control={control}
                  register={register}
                  errors={errors}
                />
              </SectionCard>

              {/* 6. Skills */}
              <SectionCard
                n={6}
                title="Skills"
                subtitle={`${(watchedData.skills || []).length} skill${(watchedData.skills || []).length === 1 ? "" : "s"}`}
                done={checks.skills}
                open={openSections.skills}
                onToggle={() => toggleSection("skills")}
              >
                <SkillsSection control={control} />
              </SectionCard>

              {/* 7. Languages */}
              <SectionCard
                n={7}
                title="Languages"
                subtitle={`${(watchedData.languages || []).length} language${(watchedData.languages || []).length === 1 ? "" : "s"}`}
                done={checks.languages}
                open={openSections.languages}
                onToggle={() => toggleSection("languages")}
              >
                <LanguagesSection
                  control={control}
                  register={register}
                  errors={errors}
                />
              </SectionCard>

              {/* 8. Certificates */}
              <SectionCard
                n={8}
                title="Certificates"
                subtitle={`${(watchedData.certificates || []).length} added`}
                done={checks.certificates}
                open={openSections.certificates}
                onToggle={() => toggleSection("certificates")}
              >
                <CertificatesSection
                  control={control}
                  register={register}
                  errors={errors}
                />
              </SectionCard>

              {/* Sticky submit bar */}
              <div
                style={{
                  position: "sticky",
                  bottom: 0,
                  background:
                    "linear-gradient(to top, var(--bg) 72%, transparent)",
                  padding: "16px 0 18px",
                  marginTop: "20px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <button
                  type="submit"
                  disabled={isGenerating}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    height: "40px",
                    padding: "0 18px",
                    borderRadius: "8px",
                    border: "1px solid var(--accent)",
                    background: "var(--accent)",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: isGenerating ? "not-allowed" : "pointer",
                    opacity: isGenerating ? 0.7 : 1,
                    boxShadow:
                      "0 1px 0 rgba(17,18,20,0.05), inset 0 -1px 0 rgba(0,0,0,0.15)",
                  }}
                >
                  <Icon name="download" size={14} />
                  {isGenerating ? "Generating…" : "Generate PDF"}
                </button>
                <div
                  style={{
                    marginLeft: "auto",
                    fontSize: "11.5px",
                    color: "var(--ink-4)",
                  }}
                >
                  Your data stays in your browser until you click generate.
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* ---- RIGHT: Preview ---- */}
        <ResumePreview
          data={previewData}
          template={template}
          onTemplateChange={setTemplate}
          zoom={zoom}
          onZoomChange={setZoom}
        />
      </div>

      {/* Tweaks panel */}
      {tweaksOpen && (
        <TweaksPanel
          template={template}
          onTemplateChange={setTemplate}
          accent={accent}
          onAccentChange={setAccent}
          onClose={() => setTweaksOpen(false)}
          onLoadSample={() => {
            reset(SAMPLE_DATA);
            setPhotoBase64(null);
          }}
          onClearAll={() => {
            reset(EMPTY_DATA);
            setPhotoBase64(null);
          }}
        />
      )}
    </>
  );
}
