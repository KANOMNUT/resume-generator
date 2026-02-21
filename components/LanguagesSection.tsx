import { Control, UseFormRegister, FieldErrors, useFieldArray } from "react-hook-form";
import { ResumeData } from "@/lib/schema";

interface LanguagesSectionProps {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
}

export default function LanguagesSection({
  control,
  register,
  errors,
}: LanguagesSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages",
  });

  const handleAddLanguage = () => {
    if (fields.length < 20) {
      append({ language: "", level: "intermediate" as const });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Languages</h2>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Language {index + 1}
              </h3>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`languages.${index}.language`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Language <span className="text-red-500">*</span>
                </label>
                <input
                  id={`languages.${index}.language`}
                  type="text"
                  {...register(`languages.${index}.language`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  placeholder="e.g., English, Thai, Japanese"
                />
                {errors.languages?.[index]?.language && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.languages[index]?.language?.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor={`languages.${index}.level`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  id={`languages.${index}.level`}
                  {...register(`languages.${index}.level`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="">Select level</option>
                  <option value="native">Native</option>
                  <option value="fluent">Fluent</option>
                  <option value="advanced">Advanced</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="basic">Basic</option>
                </select>
                {errors.languages?.[index]?.level && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.languages[index]?.level?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {fields.length < 20 && (
        <button
          type="button"
          onClick={handleAddLanguage}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg px-3 py-1.5"
        >
          Add Language
        </button>
      )}
      {errors.languages && typeof errors.languages.message === "string" && (
        <p className="text-sm text-red-600 mt-2">{errors.languages.message}</p>
      )}
    </div>
  );
}
