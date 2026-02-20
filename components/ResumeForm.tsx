"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeSchema, type ResumeData } from "@/lib/schema";
import PersonalInfoSection from "./PersonalInfoSection";
import LinksSection from "./LinksSection";
import SummarySection from "./SummarySection";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import SkillsSection from "./SkillsSection";
import CertificatesSection from "./CertificatesSection";

export default function ResumeForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResumeData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      nickname: "",
      email: "",
      phone: "",
      links: [],
      summary: "",
      experience: [],
      education: [],
      skills: [],
      certificates: [],
    },
  });

  const onSubmit = async (data: ResumeData) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Merge photo into submission payload
      const submissionData: ResumeData = {
        ...data,
        photo: photoBase64 ?? undefined,
      };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
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
        err instanceof Error ? err.message : "Failed to generate PDF. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <PersonalInfoSection
          register={register}
          errors={errors}
          onPhotoChange={setPhotoBase64}
          photoPreview={photoBase64}
        />

        <div className="border-t border-gray-200 pt-6">
          <LinksSection control={control} register={register} errors={errors} />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <SummarySection register={register} errors={errors} />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <ExperienceSection control={control} register={register} errors={errors} />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <EducationSection control={control} register={register} errors={errors} />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <SkillsSection control={control} register={register} errors={errors} />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <CertificatesSection control={control} register={register} errors={errors} />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating PDF...
              </>
            ) : (
              "Generate PDF"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
