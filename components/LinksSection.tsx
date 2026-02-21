import { Control, UseFormRegister, FieldErrors, useFieldArray, useWatch } from "react-hook-form";
import { ResumeData } from "@/lib/schema";

interface LinksSectionProps {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
}

interface LinkRowProps {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
  index: number;
  onRemove: () => void;
}

function LinkRow({ control, register, errors, index, onRemove }: LinkRowProps) {
  const type = useWatch({ control, name: `links.${index}.type` });

  return (
    <div className="flex gap-2 items-start">
      <div className="flex-none w-32">
        <select
          {...register(`links.${index}.type`)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="git">Git Repo</option>
          <option value="portfolio">Portfolio</option>
          <option value="linkedin">LinkedIn</option>
          <option value="other">Other</option>
        </select>
      </div>
      {type === "other" && (
        <div className="flex-1">
          <input
            type="text"
            {...register(`links.${index}.otherLabel`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            placeholder="e.g., Blog, Website, Portfolio"
          />
          <label className="block text-sm font-medium text-gray-700 mt-1">
            Link Label
          </label>
        </div>
      )}
      <div className="flex-1">
        <input
          type="url"
          {...register(`links.${index}.url`)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="https://example.com"
        />
        {errors.links?.[index]?.url && (
          <p className="text-sm text-red-600 mt-1">
            {errors.links[index]?.url?.message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="flex-none text-sm text-red-500 hover:text-red-700 px-3 py-2"
      >
        Remove
      </button>
    </div>
  );
}

export default function LinksSection({
  control,
  register,
  errors,
}: LinksSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  const handleAddLink = () => {
    if (fields.length < 10) {
      append({ type: "git", url: "" });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Links</h2>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <LinkRow
            key={field.id}
            control={control}
            register={register}
            errors={errors}
            index={index}
            onRemove={() => remove(index)}
          />
        ))}
      </div>
      {fields.length < 10 && (
        <button
          type="button"
          onClick={handleAddLink}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg px-3 py-1.5"
        >
          Add Link
        </button>
      )}
      {errors.links && typeof errors.links.message === "string" && (
        <p className="text-sm text-red-600 mt-2">{errors.links.message}</p>
      )}
    </div>
  );
}
