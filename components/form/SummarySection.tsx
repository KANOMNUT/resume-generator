"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ResumeData } from "@/lib/schema";
import Field from "@/components/ui/Field";
import { StyledTextarea } from "@/components/ui/inputs";
import Icon from "@/components/ui/Icon";

interface SummarySectionProps {
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
}

export default function SummarySection({
  register,
  errors,
}: SummarySectionProps) {
  return (
    <div>
      <Field
        hint="2–4 sentences. What you do, what you care about, years of experience."
        error={errors.summary?.message}
      >
        <StyledTextarea
          {...register("summary")}
          rows={5}
          placeholder="Product designer with 8 years of experience…"
        />
      </Field>
      <div
        style={{
          marginTop: "12px",
          padding: "10px 12px",
          background: "color-mix(in oklab, var(--accent) 5%, transparent)",
          border:
            "1px solid color-mix(in oklab, var(--accent) 20%, transparent)",
          borderRadius: "8px",
          fontSize: "12px",
          color: "var(--ink-2)",
          display: "flex",
          gap: "8px",
          alignItems: "flex-start",
        }}
      >
        <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: "1px" }}>
          <Icon name="sparkle" size={14} />
        </span>
        <span>
          <b>Tip:</b> lead with your role, then quantify impact. Avoid jargon.
        </span>
      </div>
    </div>
  );
}
