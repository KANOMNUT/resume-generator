import type { ResumeData } from "./schema";

/** Strip control characters except newlines and tabs */
function cleanString(str: string): string {
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

export function sanitizeResumeData(data: ResumeData): ResumeData {
  return {
    firstName: cleanString(data.firstName),
    lastName: cleanString(data.lastName),
    nickname: data.nickname ? cleanString(data.nickname) : undefined,
    email: cleanString(data.email),
    phone: cleanString(data.phone),
    // Photo is a validated base64 data URL — pass through without modification
    photo: data.photo ?? undefined,
    links: (data.links ?? []).map((link) => ({
      type: link.type,
      url: cleanString(link.url),
    })),
    summary: cleanString(data.summary),
    experience: (data.experience ?? []).map((exp) => ({
      company: cleanString(exp.company),
      position: cleanString(exp.position),
      duration: cleanString(exp.duration),
      description: cleanString(exp.description),
      projects: (exp.projects ?? []).map((proj) => ({
        name: cleanString(proj.name),
        detail: proj.detail ? cleanString(proj.detail) : undefined,
      })),
    })),
    education: (data.education ?? []).map((edu) => ({
      institution: cleanString(edu.institution),
      degree: cleanString(edu.degree),
      fieldOfStudy: edu.fieldOfStudy ? cleanString(edu.fieldOfStudy) : undefined,
      duration: cleanString(edu.duration),
      description: edu.description ? cleanString(edu.description) : undefined,
    })),
    skills: (data.skills ?? []).map((s) => ({ value: cleanString(s.value) })),
    certificates: (data.certificates ?? []).map((cert) => ({
      name: cleanString(cert.name),
      issuer: cleanString(cert.issuer),
      year: cert.year ? cleanString(cert.year) : undefined,
    })),
  };
}
