import { Control, UseFormRegister, FieldErrors, useFieldArray } from "react-hook-form";
import { ResumeData } from "@/lib/schema";

interface SkillsSectionProps {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
}

export default function SkillsSection({
  control,
  register,
  errors,
}: SkillsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  const handleAddSkill = () => {
    if (fields.length < 50) {
      append({ value: "" });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills</h2>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-start">
            <div className="flex-1">
              <input
                type="text"
                {...register(`skills.${index}.value`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., JavaScript, React, Node.js"
              />
              {errors.skills?.[index]?.value && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.skills[index]?.value?.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="flex-none text-sm text-red-500 hover:text-red-700 px-3 py-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {fields.length < 50 && (
        <button
          type="button"
          onClick={handleAddSkill}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg px-3 py-1.5"
        >
          Add Skill
        </button>
      )}
      {errors.skills && typeof errors.skills.message === "string" && (
        <p className="text-sm text-red-600 mt-2">{errors.skills.message}</p>
      )}
    </div>
  );
}
