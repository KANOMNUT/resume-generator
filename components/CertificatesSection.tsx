import { Control, UseFormRegister, FieldErrors, useFieldArray } from "react-hook-form";
import { ResumeData } from "@/lib/schema";

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

  const handleAddCertificate = () => {
    if (fields.length < 20) {
      append({
        name: "",
        issuer: "",
        year: "",
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Certifications
      </h2>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Certificate {index + 1}
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
                  htmlFor={`certificates.${index}.name`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Certificate Name <span className="text-red-500">*</span>
                </label>
                <input
                  id={`certificates.${index}.name`}
                  type="text"
                  {...register(`certificates.${index}.name`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  placeholder="e.g., AWS Certified Solutions Architect"
                />
                {errors.certificates?.[index]?.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.certificates[index]?.name?.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`certificates.${index}.issuer`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Issuer <span className="text-red-500">*</span>
                </label>
                <input
                  id={`certificates.${index}.issuer`}
                  type="text"
                  {...register(`certificates.${index}.issuer`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  placeholder="e.g., Amazon Web Services"
                />
                {errors.certificates?.[index]?.issuer && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.certificates[index]?.issuer?.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`certificates.${index}.year`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Year
                </label>
                <input
                  id={`certificates.${index}.year`}
                  type="text"
                  {...register(`certificates.${index}.year`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  placeholder="e.g., 2024"
                />
                {errors.certificates?.[index]?.year && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.certificates[index]?.year?.message}
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
          onClick={handleAddCertificate}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg px-3 py-1.5"
        >
          Add Certificate
        </button>
      )}
      {errors.certificates && typeof errors.certificates.message === "string" && (
        <p className="text-sm text-red-600 mt-2">
          {errors.certificates.message}
        </p>
      )}
    </div>
  );
}
