"use client";

import { Control, useFieldArray } from "react-hook-form";
import { ResumeData } from "@/lib/schema";
import Field from "@/components/ui/Field";
import TagInput from "@/components/ui/TagInput";

interface SkillsSectionProps {
  control: Control<ResumeData>;
}

export default function SkillsSection({ control }: SkillsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  const tags = fields.map((f) => f.value);

  const handleChange = (newTags: string[]) => {
    // Replace all: remove from end then append new
    const current = fields.length;
    for (let i = current - 1; i >= 0; i--) remove(i);
    newTags.forEach((v) => append({ value: v }));
  };

  return (
    <div>
      <Field hint="Type and press Enter or comma to add. Backspace on an empty input to remove the last tag.">
        <TagInput
          tags={tags}
          onChange={handleChange}
          placeholder="e.g. Figma, TypeScript, Stakeholder management…"
        />
      </Field>
    </div>
  );
}
