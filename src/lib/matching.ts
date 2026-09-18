import type {
  Education,
  Experience,
  Job,
  JobAnalysis,
  Language,
  MatchBreakdown,
  Profile,
  Skill,
} from "./types";

const SENIORITY_RANK: Record<string, number> = {
  estagio: 0,
  junior: 1,
  pleno: 2,
  senior: 3,
  especialista: 4,
  lideranca: 5,
};

const STOPWORDS = new Set([
  "de","da","do","das","dos","com","para","em","e","a","o","as","os","um","uma","no","na",
  "por","que","ao","aos","à","às","the","and","of","to","in","with","experiência","conhecimento",
]);

export function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string) {
  return normalize(text)
    .split(" ")
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

/** Analisa a descrição da vaga localmente (fallback determinístico, sem IA). */
export function analyzeJobLocally(job: Job): JobAnalysis {
  const text = [job.description ?? "", ...job.requirements, ...job.responsibilities].join(" ");
  const lower = normalize(text);

  const pick = (dictionary: string[]) =>
    dictionary.filter((term) => lower.includes(normalize(term)));

  const tools = pick([
    "Power BI","Looker","Tableau","Excel","Figma","Jira","Git","Docker","AWS","Azure","SAP","Notion",
  ]);
  const hardSkills = [
    ...new Set([
      ...job.keywords,
      ...pick([
        "SQL","Python","React","TypeScript","Node.js","PostgreSQL","Lean","Six Sigma","DAX",
        "ETL","Estatística","Modelagem","APIs REST","Testes automatizados","Roadmap","OKR","Analytics",
      ]),
    ]),
  ];
  const softSkills = pick([
    "comunicação","liderança","trabalho em equipe","organização","proatividade","autonomia",
    "colaboração","atenção a detalhes","pensamento crítico",
  ]);
  const languages = pick(["inglês","espanhol","português","francês"]);
  const education = pick(["graduação","pós-graduação","mba","técnico","bacharelado","engenharia"]);
  const experience = job.requirements.filter((requirement) =>
    /experi|anos|vivência|atua/i.test(requirement),
  );

  const frequency = new Map<string, number>();
  tokenize(text).forEach((word) => frequency.set(word, (frequency.get(word) ?? 0) + 1));
  const keywords = [
    ...new Set([
      ...job.keywords,
      ...[...frequency.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([word]) => word),
    ]),
  ].slice(0, 18);

  return {
    hardSkills: hardSkills.filter((s) => !tools.includes(s)),
    softSkills,
    tools,
    languages,
    education,
    experience,
    keywords,
  };
}

type MatchInput = {
  profile: Profile | null;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
};

function profileCorpus(input: MatchInput) {
  const { profile, experiences, education, skills, languages } = input;
  return normalize(
    [
      profile?.target_role ?? "",
      profile?.professional_area ?? "",
      profile?.summary ?? "",
      profile?.resume_text ?? "",
      ...skills.map((skill) => skill.name),
      ...languages.map((language) => `${language.language} ${language.level ?? ""}`),
      ...education.map((item) => `${item.course ?? ""} ${item.degree ?? ""} ${item.institution}`),
      ...experiences.map((experience) =>
        [
          experience.position,
          experience.company,
          experience.description ?? "",
          experience.responsibilities ?? "",
          experience.achievements ?? "",
          experience.skills.join(" "),
        ].join(" "),
      ),
    ].join(" "),
  );
}

/**
 * Calcula uma estimativa de compatibilidade entre perfil e vaga.
 * O score é uma estimativa baseada nas informações disponíveis — nunca uma garantia.
 */
export function calculateMatchLocally(job: Job, input: MatchInput): MatchBreakdown {
  const corpus = profileCorpus(input);
  const analysis = analyzeJobLocally(job);

  const requiredSkills = [...new Set([...analysis.hardSkills, ...analysis.tools])];
  const matching = requiredSkills.filter((skill) => corpus.includes(normalize(skill)));
  const missing = requiredSkills.filter((skill) => !corpus.includes(normalize(skill)));

  const skillScore = requiredSkills.length ? matching.length / requiredSkills.length : 0.6;

  const profileRank = SENIORITY_RANK[input.profile?.seniority ?? ""] ?? -1;
  const jobRank = SENIORITY_RANK[job.seniority ?? ""] ?? -1;
  const seniorityScore =
    profileRank < 0 || jobRank < 0 ? 0.5 : Math.max(0, 1 - Math.abs(profileRank - jobRank) / 3);

  const roleScore = (() => {
    const target = normalize(input.profile?.target_role ?? "");
    if (!target) return 0.5;
    const jobTitle = normalize(job.title);
    const shared = target.split(" ").filter((word) => word.length > 3 && jobTitle.includes(word));
    return shared.length ? Math.min(1, 0.55 + shared.length * 0.22) : 0.35;
  })();

  const experienceScore = (() => {
    const count = input.experiences.length;
    if (!count) return 0.2;
    const relevant = input.experiences.filter((experience) =>
      requiredSkills.some((skill) =>
        normalize(
          [experience.position, experience.description ?? "", experience.skills.join(" ")].join(" "),
        ).includes(normalize(skill)),
      ),
    ).length;
    return Math.min(1, 0.35 + relevant * 0.25);
  })();

  const educationScore = input.education.length ? 0.9 : 0.45;

  const locationScore = (() => {
    const desired = normalize(input.profile?.desired_location ?? "");
    const city = normalize(`${input.profile?.city ?? ""} ${input.profile?.state ?? ""}`);
    const jobLocation = normalize(job.location ?? "");
    if (job.work_model === "remoto") return 1;
    if (!jobLocation) return 0.6;
    const source = `${desired} ${city}`.trim();
    if (!source) return 0.5;
    return jobLocation.split(" ").some((word) => word.length > 3 && source.includes(word))
      ? 1
      : 0.35;
  })();

  const workModelScore = !input.profile?.work_model
    ? 0.5
    : input.profile.work_model === job.work_model
      ? 1
      : job.work_model === "hibrido" || input.profile.work_model === "hibrido"
        ? 0.7
        : 0.35;

  const parts = [
    { label: "Habilidades", score: skillScore, weight: 0.34 },
    { label: "Senioridade", score: seniorityScore, weight: 0.14 },
    { label: "Cargo", score: roleScore, weight: 0.14 },
    { label: "Experiência", score: experienceScore, weight: 0.16 },
    { label: "Formação", score: educationScore, weight: 0.06 },
    { label: "Localização", score: locationScore, weight: 0.09 },
    { label: "Modelo de trabalho", score: workModelScore, weight: 0.07 },
  ];

  const score = Math.round(
    parts.reduce((total, part) => total + part.score * part.weight, 0) * 100,
  );

  const highlights: string[] = [];
  if (requiredSkills.length) {
    highlights.push(
      `${matching.length} de ${requiredSkills.length} habilidades principais aparecem no seu perfil`,
    );
  }
  if (seniorityScore >= 0.8) highlights.push("Senioridade compatível com a vaga");
  if (experienceScore >= 0.6) highlights.push("Experiência semelhante à exigida");
  if (locationScore >= 0.9) highlights.push("Localização compatível");
  if (workModelScore >= 0.9) highlights.push("Modelo de trabalho compatível");

  const attention: string[] = [];
  missing.slice(0, 4).forEach((skill) => {
    attention.push(`A vaga cita "${skill}" — não encontramos essa informação no seu perfil.`);
  });
  if (seniorityScore < 0.6 && jobRank >= 0) {
    attention.push("A senioridade pedida difere da informada no seu perfil.");
  }
  if (locationScore < 0.5) {
    attention.push("A localização da vaga não coincide com a sua localização informada.");
  }

  return {
    score: Math.max(5, Math.min(99, score)),
    matching,
    missing,
    highlights,
    attention,
    parts: parts.map((part) => ({ ...part, score: Math.round(part.score * 100) })),
  };
}

export function matchTier(score: number) {
  if (score >= 80) return { label: "Alta compatibilidade", tone: "success" as const };
  if (score >= 60) return { label: "Compatibilidade moderada", tone: "gold" as const };
  return { label: "Baixa compatibilidade", tone: "muted" as const };
}

export function computeProfileCompletion(input: MatchInput) {
  const { profile, experiences, education, skills, languages } = input;
  const checks = [
    Boolean(profile?.name),
    Boolean(profile?.email),
    Boolean(profile?.city),
    Boolean(profile?.target_role),
    Boolean(profile?.seniority),
    Boolean(profile?.work_model),
    Boolean(profile?.summary || profile?.resume_text),
    experiences.length > 0,
    education.length > 0,
    skills.some((skill) => skill.type === "hard"),
    skills.some((skill) => skill.type === "soft"),
    languages.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
