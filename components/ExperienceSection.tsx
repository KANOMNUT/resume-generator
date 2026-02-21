import {
  Control,
  UseFormRegister,
  FieldErrors,
  useFieldArray,
  useWatch,
  UseFormSetValue,
} from "react-hook-form";
import { ResumeData } from "@/lib/schema";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1959 }, (_, i) =>
  String(currentYear + 1 - i)
);

interface ProjectsListProps {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
  experienceIndex: number;
}

function ProjectsList({ control, register, errors, experienceIndex }: ProjectsListProps) {
  const { fields: projFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: `experience.${experienceIndex}.projects` as const,
  });

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Projects</h4>
      <div className="space-y-3">
        {projFields.map((projField, projIndex) => (
          <div
            key={projField.id}
            className="bg-blue-50 border border-blue-100 rounded-lg p-3"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-blue-700">
                Project {projIndex + 1}
              </span>
              <button
                type="button"
                onClick={() => removeProject(projIndex)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label
                  htmlFor={`experience.${experienceIndex}.projects.${projIndex}.name`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  id={`experience.${experienceIndex}.projects.${projIndex}.name`}
                  type="text"
                  {...register(`experience.${experienceIndex}.projects.${projIndex}.name`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  placeholder="Project Name"
                />
                {errors.experience?.[experienceIndex]?.projects?.[projIndex]?.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.experience[experienceIndex]?.projects?.[projIndex]?.name?.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor={`experience.${experienceIndex}.projects.${projIndex}.detail`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Details / Technologies <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id={`experience.${experienceIndex}.projects.${projIndex}.detail`}
                  {...register(`experience.${experienceIndex}.projects.${projIndex}.detail`)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white resize-vertical"
                  placeholder="Describe the project, technologies used, your role..."
                />
                {errors.experience?.[experienceIndex]?.projects?.[projIndex]?.detail && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.experience[experienceIndex]?.projects?.[projIndex]?.detail?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {projFields.length < 10 && (
        <button
          type="button"
          onClick={() => appendProject({ name: "", detail: "" })}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg px-3 py-1.5"
        >
          Add Project
        </button>
      )}
    </div>
  );
}

interface ExperienceEntryProps {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
  setValue: UseFormSetValue<ResumeData>;
  index: number;
  onRemove: () => void;
}

function ExperienceEntry({
  control,
  register,
  errors,
  setValue,
  index,
  onRemove,
}: ExperienceEntryProps) {
  const isCurrent = useWatch({ control, name: `experience.${index}.isCurrent` });

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          Experience {index + 1}
        </h3>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label
            htmlFor={`experience.${index}.company`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Company <span className="text-red-500">*</span>
          </label>
          <input
            id={`experience.${index}.company`}
            type="text"
            {...register(`experience.${index}.company`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            placeholder="Company Name"
          />
          {errors.experience?.[index]?.company && (
            <p className="text-sm text-red-600 mt-1">
              {errors.experience[index]?.company?.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`experience.${index}.position`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Position <span className="text-red-500">*</span>
          </label>
          <input
            id={`experience.${index}.position`}
            type="text"
            {...register(`experience.${index}.position`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            placeholder="Job Title"
          />
          {errors.experience?.[index]?.position && (
            <p className="text-sm text-red-600 mt-1">
              {errors.experience[index]?.position?.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              {...register(`experience.${index}.startMonth`)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="" disabled>
                Month
              </option>
              {MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              {...register(`experience.${index}.startYear`)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="" disabled>
                Year
              </option>
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          {errors.experience?.[index]?.startMonth && (
            <p className="text-sm text-red-600 mt-1">
              {errors.experience[index]?.startMonth?.message}
            </p>
          )}
          {errors.experience?.[index]?.startYear && (
            <p className="text-sm text-red-600 mt-1">
              {errors.experience[index]?.startYear?.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date{" "}
            <span className="text-gray-400 font-normal">(Leave blank if ongoing)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              {...register(`experience.${index}.endMonth`)}
              disabled={!!isCurrent}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Month</option>
              {MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              {...register(`experience.${index}.endYear`)}
              disabled={!!isCurrent}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Year</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id={`experience.${index}.isCurrent`}
            type="checkbox"
            {...register(`experience.${index}.isCurrent`, {
              onChange: (e) => {
                if (e.target.checked) {
                  setValue(`experience.${index}.endMonth`, "");
                  setValue(`experience.${index}.endYear`, "");
                }
              },
            })}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label
            htmlFor={`experience.${index}.isCurrent`}
            className="text-sm font-medium text-gray-700"
          >
            Currently work here
          </label>
        </div>

        <div>
          <label
            htmlFor={`experience.${index}.description`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id={`experience.${index}.description`}
            {...register(`experience.${index}.description`)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white resize-vertical"
            placeholder="Describe your responsibilities and achievements..."
          />
          {errors.experience?.[index]?.description && (
            <p className="text-sm text-red-600 mt-1">
              {errors.experience[index]?.description?.message}
            </p>
          )}
        </div>

        <ProjectsList
          control={control}
          register={register}
          errors={errors}
          experienceIndex={index}
        />
      </div>
    </div>
  );
}

interface ExperienceSectionProps {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
  setValue: UseFormSetValue<ResumeData>;
}

export default function ExperienceSection({
  control,
  register,
  errors,
  setValue,
}: ExperienceSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  const handleAddExperience = () => {
    if (fields.length < 20) {
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
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Work Experience
      </h2>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <ExperienceEntry
            key={field.id}
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
            index={index}
            onRemove={() => remove(index)}
          />
        ))}
      </div>
      {fields.length < 20 && (
        <button
          type="button"
          onClick={handleAddExperience}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg px-3 py-1.5"
        >
          Add Experience
        </button>
      )}
      {errors.experience && typeof errors.experience.message === "string" && (
        <p className="text-sm text-red-600 mt-2">{errors.experience.message}</p>
      )}
    </div>
  );
}
