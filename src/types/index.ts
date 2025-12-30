export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  field: ResumeField;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    summary: string;
    photoUrl?: string; // New field for profile image
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages: string[]; // New field
  projects: ProjectItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link: string;
  technologies: string;
}

export type ResumeField = 
  | 'Software Engineer' 
  | 'DevOps' 
  | 'Product Manager' 
  | 'Data Scientist' 
  | 'Designer' 
  | 'Marketing' 
  | 'Doctor'
  | 'Teacher'
  | 'Bank Employee'
  | 'Human Resources'
  | 'Student / Fresher'
  | 'General';

export const FIELD_SKILLS: Record<ResumeField, string[]> = {
  'Software Engineer': ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'System Design', 'Git', 'SQL'],
  'DevOps': ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform', 'Linux', 'Bash Scripting', 'Monitoring'],
  'Product Manager': ['Product Strategy', 'Agile', 'User Research', 'Roadmapping', 'Data Analysis', 'Stakeholder Management'],
  'Data Scientist': ['Python', 'R', 'Machine Learning', 'SQL', 'Tableau', 'Statistics', 'Big Data', 'TensorFlow'],
  'Designer': ['Figma', 'Adobe XD', 'UI/UX', 'Prototyping', 'User Testing', 'Wireframing', 'Visual Design'],
  'Marketing': ['SEO', 'Content Strategy', 'Social Media', 'Google Analytics', 'Email Marketing', 'Copywriting', 'Branding'],
  'Doctor': ['Patient Care', 'Diagnosis', 'Surgery', 'EMR', 'Clinical Research', 'Emergency Medicine', 'Pediatrics', 'Communication'],
  'Teacher': ['Classroom Management', 'Curriculum Design', 'Lesson Planning', 'Student Assessment', 'Special Education', 'EdTech'],
  'Bank Employee': ['Risk Management', 'Financial Analysis', 'Customer Service', 'Compliance', 'Investment Banking', 'Accounting', 'Sales'],
  'Human Resources': ['Recruitment', 'Employee Relations', 'Payroll', 'Onboarding', 'Performance Management', 'HRIS', 'Conflict Resolution'],
  'Student / Fresher': ['Communication', 'Teamwork', 'Problem Solving', 'Time Management', 'Leadership', 'Microsoft Office', 'Research'],
  'General': ['Communication', 'Project Management', 'Leadership', 'Organization', 'Problem Solving']
};

export const FIELD_SECTIONS: Record<ResumeField, { experience: string }> = {
  'Doctor': { experience: 'Clinical Experience' },
  'Teacher': { experience: 'Teaching Experience' },
  'Bank Employee': { experience: 'Banking Experience' },
  'Software Engineer': { experience: 'Work Experience' },
  'DevOps': { experience: 'Work Experience' },
  'Product Manager': { experience: 'Professional Experience' },
  'Data Scientist': { experience: 'Professional Experience' },
  'Designer': { experience: 'Work Experience' },
  'Marketing': { experience: 'Work Experience' },
  'Human Resources': { experience: 'HR Experience' },
  'Student / Fresher': { experience: 'Internships & Experience' },
  'General': { experience: 'Experience' }
};
