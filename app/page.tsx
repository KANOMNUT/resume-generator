import ResumeForm from "@/components/ResumeForm";

export default function Home() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Resume Generator
          </h1>
          <p className="text-lg text-gray-600">
            Fill in your details and generate a professional PDF resume.
          </p>
        </div>
        <ResumeForm />
      </div>
    </div>
  );
}
