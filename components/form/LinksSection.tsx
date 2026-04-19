"use client";

import { Control, useFieldArray, UseFormRegister, FieldErrors } from "react-hook-form";
import { ResumeData } from "@/lib/schema";
import Field from "@/components/ui/Field";
import { StyledInput, StyledSelect, AddButton } from "@/components/ui/inputs";
import Icon from "@/components/ui/Icon";

interface LinksSectionProps {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
}

const LINK_TYPES = [
  { value: "portfolio", label: "Portfolio" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "git", label: "Git Repo" },
  { value: "other", label: "Other" },
];

export default function LinksSection({
  control,
  register,
  errors,
}: LinksSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  return (
    <div>
      <p
        style={{
          fontSize: "11.5px",
          color: "var(--ink-4)",
          marginTop: "10px",
          marginBottom: 0,
        }}
      >
        Portfolio, GitHub, LinkedIn &mdash; anything you want recruiters to find.
      </p>
      {fields.map((field, i) => {
        const isOther = field.type === "other";
        return (
          <div
            key={field.id}
            style={{
              display: "grid",
              gridTemplateColumns: isOther
                ? "130px 140px 1fr auto"
                : "130px 1fr auto",
              gap: "8px",
              alignItems: "start",
              marginTop: "10px",
            }}
          >
            <StyledSelect {...register(`links.${i}.type`)}>
              {LINK_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </StyledSelect>
            {isOther && (
              <StyledInput
                {...register(`links.${i}.otherLabel`)}
                placeholder="Label"
              />
            )}
            <div>
              <StyledInput
                {...register(`links.${i}.url`)}
                placeholder="https://…"
              />
              {errors.links?.[i]?.url && (
                <div
                  style={{
                    fontSize: "11.5px",
                    color: "var(--danger)",
                    marginTop: "2px",
                  }}
                >
                  {errors.links[i]?.url?.message}
                </div>
              )}
            </div>
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
        );
      })}
      <AddButton
        onClick={() => append({ type: "portfolio", url: "", otherLabel: "" })}
      >
        <Icon name="plus" size={13} /> Add link
      </AddButton>
    </div>
  );
}
