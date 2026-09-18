export type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  linkedin: string | null;
  portfolio: string | null;
  github: string | null;
  website: string | null;
  target_role: string | null;
  professional_area: string | null;
  seniority: string | null;
  work_model: string | null;
  desired_location: string | null;
  availability: string | null;
  salary_expectation: string | null;
  summary: string | null;
  resume_text: string | null;
  onboarding_completed: boolean;
  profile_completion: number;
};

export type Experience = {
  id: string;
  user_id: string;
  company: string;
  position: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  description: string | null;
  responsibilities: string | null;
  achievements: string | null;
  skills: string[];
  sort_order: number;
};

export type Education = {
  id: string;
  user_id: string;
  institution: string;
  course: string | null;
  degree: string | null;
  start_date: string | null;
  end_date: string | null;
};

export type Skill = { id: string; user_id: string; name: string; type: "hard" | "soft" };
export type Language = { id: string; user_id: string; language: string; level: string | null };
export type Certification = {
  id: string;
  user_id: string;
  name: string;
  issuer: string | null;
  year: string | null;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  work_model: string | null;
  seniority: string | null;
  area: string | null;
  salary_min: number | null;
  salary_max: number | null;
  description: string | null;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  keywords: string[];
  source: string;
  source_url: string | null;
  published_at: string;
};

export type MatchBreakdown = {
  score: number;
  matching: string[];
  missing: string[];
  highlights: string[];
  attention: string[];
  parts: { label: string; score: number; weight: number }[];
};

export type ResumeContent = {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
    github: string;
  };
  headline: string;
  summary: string;
  experiences: {
    company: string;
    position: string;
    location: string;
    period: string;
    bullets: string[];
  }[];
  education: { institution: string; course: string; degree: string; period: string }[];
  hardSkills: string[];
  softSkills: string[];
  languages: { language: string; level: string }[];
  certifications: { name: string; issuer: string; year: string }[];
};

export type Resume = {
  id: string;
  user_id: string;
  title: string;
  target_job_id: string | null;
  content: ResumeContent;
  template: "classic" | "modern" | "executive";
  ats_score: number | null;
  ats_analysis: AtsAnalysis | null;
  changes: string[] | null;
  version: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AtsAnalysis = {
  score: number;
  checks: { label: string; status: "ok" | "attention"; detail: string }[];
  keywordsFound: string[];
  keywordsMissing: string[];
  improvements: string[];
};

export type JobAnalysis = {
  hardSkills: string[];
  softSkills: string[];
  tools: string[];
  languages: string[];
  education: string[];
  experience: string[];
  keywords: string[];
};

export const APPLICATION_STAGES = [
  { id: "saved", label: "Salvas" },
  { id: "applied", label: "Aplicadas" },
  { id: "interview", label: "Entrevista" },
  { id: "offer", label: "Oferta" },
  { id: "closed", label: "Encerradas" },
] as const;

export type ApplicationStage = (typeof APPLICATION_STAGES)[number]["id"];

export type Application = {
  id: string;
  user_id: string;
  job_id: string | null;
  resume_id: string | null;
  status: ApplicationStage;
  applied_at: string | null;
  notes: string | null;
  job_url: string | null;
  created_at: string;
};

export const SENIORITY_OPTIONS = [
  { value: "estagio", label: "Estágio" },
  { value: "junior", label: "Júnior" },
  { value: "pleno", label: "Pleno" },
  { value: "senior", label: "Sênior" },
  { value: "especialista", label: "Especialista" },
  { value: "lideranca", label: "Liderança" },
];

export const WORK_MODEL_OPTIONS = [
  { value: "remoto", label: "Remoto" },
  { value: "hibrido", label: "Híbrido" },
  { value: "presencial", label: "Presencial" },
];
