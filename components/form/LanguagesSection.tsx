"use client";

import { Control, UseFormRegister, FieldErrors, useFieldArray } from "react-hook-form";
import { ResumeData } from "@/lib/schema";
import { StyledInput, StyledSelect, AddButton } from "@/components/ui/inputs";
import Icon from "@/components/ui/Icon";

interface LanguagesSectionProps {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
}

const LEVELS = [
  { value: "native", label: "Native" },
  { value: "fluent", label: "Fluent" },
  { value: "advanced", label: "Advanced" },
  { value: "intermediate", label: "Intermediate" },
  { value: "basic", label: "Basic" },
];

export default function LanguagesSection({
  control,
  register,
  errors,
}: LanguagesSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages",
  });

  return (
    <div>
      {fields.map((field, i) => (
        <div
          key={field.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 150px auto",
            gap: "8px",
            alignItems: "start",
            marginTop: "10px",
          }}
        >
          <div>
            <StyledInput
              {...register(`languages.${i}.language`)}
              placeholder="Language"
            />
            {errors.languages?.[i]?.language && (
              <div
                style={{
                  fontSize: "11.5px",
                  color: "var(--danger)",
                  marginTop: "2px",
                }}
              >
                {errors.languages[i]?.language?.message}
              </div>
            )}
          </div>
          <StyledSelect {...register(`languages.${i}.level`)}>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </StyledSelect>
          <button
            type="button"
            onClick={() => remove(i)}
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
              display: "grid",
              placeItems: "center",
              background: "transparent",
              border: "none",
              color: "var(--ink-4)",
              cursor: "pointer",
              marginTop: "9px",
            }}
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      ))}
      <AddButton
        onClick={() => append({ language: "", level: "intermediate" })}
      >
        <Icon name="plus" size={13} /> Add language
      </AddButton>
    </div>
  );
}
