import { useState } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ResumeData } from "@/lib/schema";

interface SummarySectionProps {
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
}

export default function SummarySection({
  register,
  errors,
}: SummarySectionProps) {
  const [charCount, setCharCount] = useState(0);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Professional Summary
      </h2>
      <div>
        <label
          htmlFor="summary"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Summary <span className="text-red-500">*</span>
        </label>
        <textarea
          id="summary"
          {...register("summary")}
          onChange={(e) => {
            setCharCount(e.target.value.length);
            register("summary").onChange(e);
          }}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-vertical"
          placeholder="Write a brief professional summary highlighting your key skills and experience..."
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {errors.summary && (
              <p className="text-sm text-red-600">{errors.summary.message}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {charCount} / 2000 characters
          </p>
        </div>
      </div>
    </div>
  );
}
