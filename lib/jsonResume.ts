import { JSONResume } from '@/types/resume';

/**
 * Creates an empty JSON Resume template
 */
export function createEmptyResume(): JSONResume {
  return {
    basics: {
      name: '',
      label: '',
      email: '',
      phone: '',
      url: '',
      summary: '',
      location: {
        address: '',
        postalCode: '',
        city: '',
        countryCode: '',
        region: '',
      },
      profiles: [],
    },
    work: [],
    education: [],
    skills: [],
    projects: [],
    languages: [],
    interests: [],
    meta: {
      version: 'v1.0.0',
      lastModified: new Date().toISOString(),
    },
  };
}

/**
 * Validates if a resume object follows JSON Resume schema
 */
export function validateResume(resume: any): resume is JSONResume {
  // Basic validation - can be expanded
  if (!resume || typeof resume !== 'object') {
    return false;
  }

  // At minimum, should have basics or some content
  return (
    'basics' in resume ||
    'work' in resume ||
    'education' in resume ||
    'skills' in resume
  );
}

/**
 * Updates the meta.lastModified field
 */
export function updateResumeTimestamp(resume: JSONResume): JSONResume {
  return {
    ...resume,
    meta: {
      ...resume.meta,
      lastModified: new Date().toISOString(),
    },
  };
}

/**
 * Merges partial resume data into existing resume
 */
export function mergeResumeData(
  existing: JSONResume,
  updates: Partial<JSONResume>
): JSONResume {
  const merged = {
    ...existing,
    ...updates,
  };

  return updateResumeTimestamp(merged);
}

/**
 * Checks if a resume has substantial content
 */
export function isResumeComplete(resume: JSONResume): boolean {
  const hasBasics =
    resume.basics && (!!resume.basics.name || !!resume.basics.email);

  const hasWork = resume.work && resume.work.length > 0;
  const hasEducation = resume.education && resume.education.length > 0;
  const hasSkills = resume.skills && resume.skills.length > 0;

  return !!(hasBasics && (hasWork || hasEducation || hasSkills));
}
