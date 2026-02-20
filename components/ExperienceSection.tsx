import { Control, UseFormRegister, FieldErrors, useFieldArray } from "react-hook-form";
import { ResumeData } from "@/lib/schema";

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

interface ExperienceSectionProps {
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
  errors: FieldErrors<ResumeData>;
}

export default function ExperienceSection({
  control,
  register,
  errors,
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
        duration: "",
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
          <div
            key={field.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Experience {index + 1}
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
                <label
                  htmlFor={`experience.${index}.duration`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  id={`experience.${index}.duration`}
                  type="text"
                  {...register(`experience.${index}.duration`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  placeholder="Jan 2020 - Present"
                />
                {errors.experience?.[index]?.duration && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.experience[index]?.duration?.message}
                  </p>
                )}
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
