// JSON Resume Schema v1.0.0
// Based on https://jsonresume.org/schema/

export interface JSONResume {
  basics?: Basics;
  work?: Work[];
  volunteer?: Volunteer[];
  education?: Education[];
  awards?: Award[];
  certificates?: Certificate[];
  publications?: Publication[];
  skills?: Skill[];
  languages?: Language[];
  interests?: Interest[];
  references?: Reference[];
  projects?: Project[];
  meta?: Meta;
}

export interface Basics {
  name?: string;
  label?: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: Location;
  profiles?: Profile[];
}

export interface Location {
  address?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  region?: string;
}

export interface Profile {
  network?: string;
  username?: string;
  url?: string;
}

export interface Work {
  name?: string;
  position?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
}

export interface Volunteer {
  organization?: string;
  position?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
}

export interface Education {
  institution?: string;
  url?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
  courses?: string[];
}

export interface Award {
  title?: string;
  date?: string;
  awarder?: string;
  summary?: string;
}

export interface Certificate {
  name?: string;
  date?: string;
  issuer?: string;
  url?: string;
}

export interface Publication {
  name?: string;
  publisher?: string;
  releaseDate?: string;
  url?: string;
  summary?: string;
}

export interface Skill {
  name?: string;
  level?: string;
  keywords?: string[];
}

export interface Language {
  language?: string;
  fluency?: string;
}

export interface Interest {
  name?: string;
  keywords?: string[];
}

export interface Reference {
  name?: string;
  reference?: string;
}

export interface Project {
  name?: string;
  description?: string;
  highlights?: string[];
  keywords?: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
  roles?: string[];
  entity?: string;
  type?: string;
}

export interface Meta {
  canonical?: string;
  version?: string;
  lastModified?: string;
}

// Database types
export interface Resume {
  id: string;
  user_id: string;
  resume_data: JSONResume | null;
  original_file_url: string | null;
  original_file_name: string | null;
  is_basis_resume: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStatus {
  user_id: string;
  resume_completed: boolean;
  completed_at: string | null;
}

// Upload types
export interface ResumeUpload {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

// Interview response types
export interface InterviewResponse {
  question: string;
  answer: string;
  section: keyof JSONResume;
}

export interface InterviewSession {
  responses: InterviewResponse[];
  currentSection: keyof JSONResume;
  isComplete: boolean;
}

// Document types supported for upload
export enum DocumentType {
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC = 'application/msword',
  TXT = 'text/plain',
  JPG = 'image/jpeg',
  PNG = 'image/png',
}

export const SUPPORTED_DOCUMENT_TYPES = [
  DocumentType.PDF,
  DocumentType.DOCX,
  DocumentType.DOC,
  DocumentType.TXT,
  DocumentType.JPG,
  DocumentType.PNG,
];
