import {
  JSONResume,
  InterviewResponse,
  InterviewSession,
} from '@/types/resume';
import { createEmptyResume } from './jsonResume';

/**
 * Build JSON Resume from interview responses
 */
export function buildResumeFromInterview(
  responses: InterviewResponse[]
): JSONResume {
  const resume = createEmptyResume();

  // Group responses by section
  const responsesBySection = responses.reduce(
    (acc, response) => {
      if (!acc[response.section]) {
        acc[response.section] = [];
      }
      acc[response.section].push(response);
      return acc;
    },
    {} as Record<string, InterviewResponse[]>
  );

  // Process each section
  for (const [section, sectionResponses] of Object.entries(
    responsesBySection
  )) {
    switch (section) {
      case 'basics':
        resume.basics = buildBasicsFromResponses(sectionResponses);
        break;
      case 'work':
        resume.work = buildWorkFromResponses(sectionResponses);
        break;
      case 'education':
        resume.education = buildEducationFromResponses(sectionResponses);
        break;
      case 'skills':
        resume.skills = buildSkillsFromResponses(sectionResponses);
        break;
      case 'projects':
        resume.projects = buildProjectsFromResponses(sectionResponses);
        break;
      // Add other sections as needed
    }
  }

  return resume;
}

function buildBasicsFromResponses(responses: InterviewResponse[]) {
  const basics: JSONResume['basics'] = {
    name: '',
    email: '',
    phone: '',
    summary: '',
    location: {},
    profiles: [],
  };

  responses.forEach((response) => {
    const questionLower = response.question.toLowerCase();

    if (questionLower.includes('name')) {
      basics.name = response.answer;
    } else if (questionLower.includes('email')) {
      basics.email = response.answer;
    } else if (questionLower.includes('phone')) {
      basics.phone = response.answer;
    } else if (
      questionLower.includes('summary') ||
      questionLower.includes('about yourself')
    ) {
      basics.summary = response.answer;
    } else if (
      questionLower.includes('location') ||
      questionLower.includes('city')
    ) {
      if (basics.location) {
        basics.location.city = response.answer;
      }
    }
  });

  return basics;
}

function buildWorkFromResponses(responses: InterviewResponse[]) {
  // For simplicity, assume responses alternate between company, position, description
  const work: JSONResume['work'] = [];
  let currentWork: any = {};

  responses.forEach((response, index) => {
    const questionLower = response.question.toLowerCase();

    if (
      questionLower.includes('company') ||
      questionLower.includes('employer')
    ) {
      if (currentWork.name) {
        work.push(currentWork);
        currentWork = {};
      }
      currentWork.name = response.answer;
    } else if (
      questionLower.includes('position') ||
      questionLower.includes('title')
    ) {
      currentWork.position = response.answer;
    } else if (questionLower.includes('start date')) {
      currentWork.startDate = response.answer;
    } else if (questionLower.includes('end date')) {
      currentWork.endDate = response.answer;
    } else if (
      questionLower.includes('description') ||
      questionLower.includes('responsibilities')
    ) {
      currentWork.summary = response.answer;
    } else if (
      questionLower.includes('achievements') ||
      questionLower.includes('highlights')
    ) {
      currentWork.highlights = response.answer
        .split('\n')
        .filter((h: string) => h.trim());
    }
  });

  if (currentWork.name) {
    work.push(currentWork);
  }

  return work;
}

function buildEducationFromResponses(responses: InterviewResponse[]) {
  const education: JSONResume['education'] = [];
  let currentEdu: any = {};

  responses.forEach((response) => {
    const questionLower = response.question.toLowerCase();

    if (
      questionLower.includes('school') ||
      questionLower.includes('university') ||
      questionLower.includes('institution')
    ) {
      if (currentEdu.institution) {
        education.push(currentEdu);
        currentEdu = {};
      }
      currentEdu.institution = response.answer;
    } else if (
      questionLower.includes('degree') ||
      questionLower.includes('study type')
    ) {
      currentEdu.studyType = response.answer;
    } else if (
      questionLower.includes('field') ||
      questionLower.includes('major') ||
      questionLower.includes('area')
    ) {
      currentEdu.area = response.answer;
    } else if (
      questionLower.includes('start date') ||
      questionLower.includes('graduation')
    ) {
      if (questionLower.includes('start')) {
        currentEdu.startDate = response.answer;
      } else {
        currentEdu.endDate = response.answer;
      }
    }
  });

  if (currentEdu.institution) {
    education.push(currentEdu);
  }

  return education;
}

function buildSkillsFromResponses(responses: InterviewResponse[]) {
  const skills: JSONResume['skills'] = [];

  responses.forEach((response) => {
    // Parse comma-separated or newline-separated skills
    const skillsList = response.answer
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s);

    skillsList.forEach((skillName) => {
      skills.push({
        name: skillName,
        keywords: [],
      });
    });
  });

  return skills;
}

function buildProjectsFromResponses(responses: InterviewResponse[]) {
  const projects: JSONResume['projects'] = [];
  let currentProject: any = {};

  responses.forEach((response) => {
    const questionLower = response.question.toLowerCase();

    if (questionLower.includes('project name')) {
      if (currentProject.name) {
        projects.push(currentProject);
        currentProject = {};
      }
      currentProject.name = response.answer;
    } else if (questionLower.includes('description')) {
      currentProject.description = response.answer;
    } else if (
      questionLower.includes('highlights') ||
      questionLower.includes('achievements')
    ) {
      currentProject.highlights = response.answer
        .split('\n')
        .filter((h: string) => h.trim());
    } else if (
      questionLower.includes('url') ||
      questionLower.includes('link')
    ) {
      currentProject.url = response.answer;
    }
  });

  if (currentProject.name) {
    projects.push(currentProject);
  }

  return projects;
}

/**
 * Get interview questions for a specific section
 */
export function getQuestionsForSection(section: keyof JSONResume): string[] {
  const questions: Record<string, string[]> = {
    basics: [
      "What's your full name?",
      "What's your email address?",
      "What's your phone number?",
      'Where are you located? (City, State/Region)',
      "Tell me a bit about yourself - what's your professional summary?",
    ],
    work: [
      'What company did you work for?',
      'What was your job title/position?',
      'When did you start? (e.g., January 2020)',
      'When did you end (or are you currently working there)?',
      'What were your main responsibilities?',
      'What were your key achievements or highlights?',
      'Would you like to add another work experience? (yes/no)',
    ],
    education: [
      'What school/university did you attend?',
      'What degree did you receive? (e.g., Bachelor of Science)',
      'What was your field of study/major?',
      'When did you start?',
      'When did you graduate (or expected graduation)?',
      'Would you like to add another education entry? (yes/no)',
    ],
    skills: [
      'What are your technical skills? (Separate with commas)',
      'What soft skills do you have? (Separate with commas)',
    ],
    projects: [
      "What's the name of the project?",
      'Describe the project briefly',
      'What were the key highlights or achievements?',
      'Is there a URL/link to this project?',
      'Would you like to add another project? (yes/no)',
    ],
  };

  return questions[section] || [];
}

/**
 * Determine which section to ask about next
 */
export function getNextSection(
  currentSection: keyof JSONResume | null
): keyof JSONResume | null {
  const sectionOrder: (keyof JSONResume)[] = [
    'basics',
    'work',
    'education',
    'skills',
    'projects',
  ];

  if (!currentSection) {
    return sectionOrder[0];
  }

  const currentIndex = sectionOrder.indexOf(currentSection);
  if (currentIndex === -1 || currentIndex === sectionOrder.length - 1) {
    return null; // Interview complete
  }

  return sectionOrder[currentIndex + 1];
}
