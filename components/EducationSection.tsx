"use client";

import {
  useFieldArray,
  UseFormRegister,
  Control,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { ResumeData } from "@/lib/schema";

interface EducationSectionProps {
  register: UseFormRegister<ResumeData>;
  control: Control<ResumeData>;
  errors: FieldErrors<ResumeData>;
  watch: UseFormWatch<ResumeData>;
  setValue: UseFormSetValue<ResumeData>;
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from(
  { length: currentYear - 1960 + 1 },
  (_, i) => String(currentYear - i)
);

export default function EducationSection({
  register,
  control,
  errors,
  watch,
  setValue,
}: EducationSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  const handleAddEducation = () => {
    if (fields.length < 10) {
      append({
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startYear: "",
        endYear: "",
        isCurrent: false,
        description: "",
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Education</h2>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Education {index + 1}
              </h3>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor={`education.${index}.institution`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Institution <span className="text-red-500">*</span>
                </label>
                <input
                  id={`education.${index}.institution`}
                  type="text"
                  {...register(`education.${index}.institution`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  placeholder="e.g., Chulalongkorn University"
                />
                {errors.education?.[index]?.institution && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.education[index]?.institution?.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`education.${index}.degree`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Degree <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`education.${index}.degree`}
                    type="text"
                    {...register(`education.${index}.degree`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    placeholder="e.g., Bachelor Degree"
                  />
                  {errors.education?.[index]?.degree && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.education[index]?.degree?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`education.${index}.fieldOfStudy`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Field of Study
                  </label>
                  <input
                    id={`education.${index}.fieldOfStudy`}
                    type="text"
                    {...register(`education.${index}.fieldOfStudy`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    placeholder="e.g., Computer Science"
                  />
                  {errors.education?.[index]?.fieldOfStudy && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.education[index]?.fieldOfStudy?.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Start Year / End Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Start Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register(`education.${index}.startYear`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">Select year</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {errors.education?.[index]?.startYear && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.education[index]?.startYear?.message}
                    </p>
                  )}
                </div>

                {/* End Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Year
                  </label>
                  <select
                    {...register(`education.${index}.endYear`)}
                    disabled={!!watch(`education.${index}.isCurrent`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select year</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* isCurrent */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`education.${index}.isCurrent`}
                  {...register(`education.${index}.isCurrent`)}
                  onChange={(e) => {
                    register(`education.${index}.isCurrent`).onChange(e);
                    if (e.target.checked) {
                      setValue(`education.${index}.endYear`, "");
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`education.${index}.isCurrent`}
                  className="text-sm text-gray-700"
                >
                  Currently studying here
                </label>
              </div>

              <div>
                <label
                  htmlFor={`education.${index}.description`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description / Activities
                </label>
                <textarea
                  id={`education.${index}.description`}
                  {...register(`education.${index}.description`)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white resize-vertical"
                  placeholder="e.g., GPA 3.8, Dean's List, relevant coursework or activities..."
                />
                {errors.education?.[index]?.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.education[index]?.description?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {fields.length < 10 && (
        <button
          type="button"
          onClick={handleAddEducation}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg px-3 py-1.5"
        >
          Add Education
        </button>
      )}
      {errors.education && typeof errors.education.message === "string" && (
        <p className="text-sm text-red-600 mt-2">{errors.education.message}</p>
      )}
    </div>
  );
}
