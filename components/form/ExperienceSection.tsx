"use client";

import {
  Control,
  UseFormRegister,
  FieldErrors,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { ResumeData } from "@/lib/schema";
import Field from "@/components/ui/Field";
import EntryCard from "@/components/ui/EntryCard";
import { StyledInput, StyledSelect, StyledTextarea, AddButton } from "@/components/ui/inputs";
import Icon from "@/components/ui/Icon";
import { MONTHS, YEARS } from "@/types/resume";

interface ExperienceSectionProps {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
}

function ProjectsList({
  control,
  register,
  errors,
  expIndex,
}: {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
  expIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `experience.${expIndex}.projects`,
  });

  return (
    <div
      style={{
        marginTop: "10px",
        paddingLeft: "10px",
        borderLeft: "2px solid var(--line-2)",
      }}
    >
      <h4
        style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--ink-4)",
          margin: "0 0 8px",
          fontWeight: 600,
        }}
      >
        Projects{" "}
        <span
          style={{
            color: "var(--ink-4)",
            fontWeight: 400,
            textTransform: "none",
            letterSpacing: 0,
          }}
        >
          &middot; {fields.length}
        </span>
      </h4>
      {fields.map((pf, pi) => (
        <div
          key={pf.id}
          style={{
            background: "#fff",
            border: "1px solid var(--line-2)",
            borderRadius: "var(--radius-sm)",
            padding: "10px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "11.5px",
              color: "var(--ink-4)",
              marginBottom: "6px",
            }}
          >
            <span>Project {pi + 1}</span>
            <button
              type="button"
              onClick={() => remove(pi)}
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
              }}
            >
              <Icon name="trash" size={13} />
            </button>
          </div>
          <Field
            label="Name"
            required
            error={
              errors.experience?.[expIndex]?.projects?.[pi]?.name?.message
            }
          >
            <StyledInput
              {...register(`experience.${expIndex}.projects.${pi}.name`)}
              placeholder="Project name"
            />
          </Field>
          <Field label="Details" optional>
            <StyledTextarea
              {...register(`experience.${expIndex}.projects.${pi}.detail`)}
              rows={2}
              placeholder="Tech, outcome, link…"
            />
          </Field>
        </div>
      ))}
      <AddButton onClick={() => append({ name: "", detail: "" })}>
        <Icon name="plus" size={13} /> Add project
      </AddButton>
    </div>
  );
}

function ExperienceEntry({
  idx,
  control,
  register,
  errors,
  onRemove,
  onDuplicate,
}: {
  idx: number;
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const isCurrent = useWatch({
    control,
    name: `experience.${idx}.isCurrent`,
  });
  const company = useWatch({ control, name: `experience.${idx}.company` });
  const position = useWatch({ control, name: `experience.${idx}.position` });

  const label = company
    ? `${company}${position ? ` — ${position}` : ""}`
    : "New role";

  return (
    <EntryCard
      idx={idx}
      label={label}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <Field
          label="Company"
          required
          error={errors.experience?.[idx]?.company?.message}
        >
          <StyledInput
            {...register(`experience.${idx}.company`)}
            placeholder="Acme Inc."
          />
        </Field>
        <Field
          label="Position"
          required
          error={errors.experience?.[idx]?.position?.message}
        >
          <StyledInput
            {...register(`experience.${idx}.position`)}
            placeholder="Product Designer"
          />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <Field label="Start">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            <StyledSelect {...register(`experience.${idx}.startMonth`)}>
              <option value="">Month</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </StyledSelect>
            <StyledSelect {...register(`experience.${idx}.startYear`)}>
              <option value="">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </StyledSelect>
          </div>
        </Field>
        <Field label="End">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            <StyledSelect
              {...register(`experience.${idx}.endMonth`)}
              disabled={!!isCurrent}
            >
              <option value="">Month</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </StyledSelect>
            <StyledSelect
              {...register(`experience.${idx}.endYear`)}
              disabled={!!isCurrent}
            >
              <option value="">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </StyledSelect>
          </div>
        </Field>
      </div>

      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: "var(--ink-2)",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        <input
          type="checkbox"
          {...register(`experience.${idx}.isCurrent`)}
          style={{ accentColor: "var(--accent)" }}
        />
        I currently work here
      </label>

      <Field
        label="Description"
        required
        error={errors.experience?.[idx]?.description?.message}
      >
        <StyledTextarea
          {...register(`experience.${idx}.description`)}
          rows={3}
          placeholder="What you did, who you worked with, what shipped."
        />
      </Field>

      <ProjectsList
        control={control}
        register={register}
        errors={errors}
        expIndex={idx}
      />
    </EntryCard>
  );
}

export default function ExperienceSection({
  control,
  register,
  errors,
}: ExperienceSectionProps) {
  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "experience",
  });

  const duplicate = (idx: number) => {
    const items = fields;
    const copy = JSON.parse(JSON.stringify(items[idx]));
    delete copy.id;
    insert(idx + 1, copy);
  };

  return (
    <div>
      {fields.map((field, i) => (
        <ExperienceEntry
          key={field.id}
          idx={i}
          control={control}
          register={register}
          errors={errors}
          onRemove={() => remove(i)}
          onDuplicate={() => duplicate(i)}
        />
      ))}
      <AddButton
        onClick={() =>
          append({
            company: "",
            position: "",
            startMonth: "",
            startYear: "",
            endMonth: "",
            endYear: "",
            isCurrent: false,
            description: "",
            projects: [],
          })
        }
      >
        <Icon name="plus" size={13} /> Add experience
      </AddButton>
    </div>
  );
}
