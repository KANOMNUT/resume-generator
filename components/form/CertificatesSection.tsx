"use client";

import { Control, UseFormRegister, FieldErrors, useFieldArray } from "react-hook-form";
import { ResumeData } from "@/lib/schema";
import Field from "@/components/ui/Field";
import EntryCard from "@/components/ui/EntryCard";
import { StyledInput, AddButton } from "@/components/ui/inputs";
import Icon from "@/components/ui/Icon";

interface CertificatesSectionProps {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
}

export default function CertificatesSection({
  control,
  register,
  errors,
}: CertificatesSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "certificates",
  });

  return (
    <div>
      {fields.map((field, i) => (
        <EntryCard
          key={field.id}
          idx={i}
          label={field.name || "New certificate"}
          onRemove={() => remove(i)}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
          >
            <Field
              label="Name"
              required
              full
              error={errors.certificates?.[i]?.name?.message}
            >
              <StyledInput
                {...register(`certificates.${i}.name`)}
                placeholder="AWS Certified Solutions Architect"
              />
            </Field>
            <Field
              label="Issuer"
              required
              error={errors.certificates?.[i]?.issuer?.message}
            >
              <StyledInput
                {...register(`certificates.${i}.issuer`)}
                placeholder="Amazon Web Services"
              />
            </Field>
            <Field label="Year" optional>
              <StyledInput
                {...register(`certificates.${i}.year`)}
                placeholder="2024"
              />
            </Field>
          </div>
        </EntryCard>
      ))}
      <AddButton
        onClick={() => append({ name: "", issuer: "", year: "" })}
      >
        <Icon name="plus" size={13} /> Add certificate
      </AddButton>
    </div>
  );
}
