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
import { YEARS } from "@/types/resume";

interface EducationSectionProps {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
}

function EducationEntry({
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
  const isCurrent = useWatch({ control, name: `education.${idx}.isCurrent` });
  const institution = useWatch({ control, name: `education.${idx}.institution` });

  return (
    <EntryCard
      idx={idx}
      label={institution || "New entry"}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <Field
          label="Institution"
          required
          full
          error={errors.education?.[idx]?.institution?.message}
        >
          <StyledInput
            {...register(`education.${idx}.institution`)}
            placeholder="Politecnico di Milano"
          />
        </Field>
        <Field
          label="Degree"
          required
          error={errors.education?.[idx]?.degree?.message}
        >
          <StyledInput
            {...register(`education.${idx}.degree`)}
            placeholder="BSc"
          />
        </Field>
        <Field label="Field of study" optional>
          <StyledInput
            {...register(`education.${idx}.fieldOfStudy`)}
            placeholder="Computer Science"
          />
        </Field>
        <Field
          label="Start year"
          required
          error={errors.education?.[idx]?.startYear?.message}
        >
          <StyledSelect {...register(`education.${idx}.startYear`)}>
            <option value="">Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </StyledSelect>
        </Field>
        <Field label="End year">
          <StyledSelect
            {...register(`education.${idx}.endYear`)}
            disabled={!!isCurrent}
          >
            <option value="">Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </StyledSelect>
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
          {...register(`education.${idx}.isCurrent`)}
          style={{ accentColor: "var(--accent)" }}
        />
        Currently studying
      </label>

      <Field label="Notes" optional>
        <StyledTextarea
          {...register(`education.${idx}.description`)}
          rows={2}
          placeholder="Honors, thesis, GPA…"
        />
      </Field>
    </EntryCard>
  );
}

export default function EducationSection({
  control,
  register,
  errors,
}: EducationSectionProps) {
  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "education",
  });

  const duplicate = (idx: number) => {
    const copy = JSON.parse(JSON.stringify(fields[idx]));
    delete copy.id;
    insert(idx + 1, copy);
  };

  return (
    <div>
      {fields.map((field, i) => (
        <EducationEntry
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
            institution: "",
            degree: "",
            fieldOfStudy: "",
            startYear: "",
            endYear: "",
            isCurrent: false,
            description: "",
          })
        }
      >
        <Icon name="plus" size={13} /> Add education
      </AddButton>
    </div>
  );
}
