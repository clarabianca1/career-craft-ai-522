import type {
  AtsAnalysis,
  Certification,
  Education,
  Experience,
  Job,
  Language,
  Profile,
  ResumeContent,
  Skill,
} from "./types";
import { normalize } from "./matching";

export type ProfileBundle = {
  profile: Profile | null;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
};

function period(start?: string | null, end?: string | null, current?: boolean) {
  const from = start ?? "";
  const to = current ? "atual" : (end ?? "");
  if (!from && !to) return "";
  return [from, to].filter(Boolean).join(" — ");
}

function bulletsFrom(experience: Experience) {
  const source = [experience.responsibilities, experience.achievements, experience.description]
    .filter(Boolean)
    .join("\n");
  return source
    .split(/\n|•|;|\u2022/)
    .map((line) => line.replace(/^[-*\s]+/, "").trim())
    .filter((line) => line.length > 3);
}

/** Monta o currículo base a partir apenas dos dados informados pelo usuário. */
export function buildBaseResume(bundle: ProfileBundle): ResumeContent {
  const { profile, experiences, education, skills, languages, certifications } = bundle;
  return {
    personal: {
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      location: [profile?.city, profile?.state].filter(Boolean).join(", "),
      linkedin: profile?.linkedin ?? "",
      portfolio: profile?.portfolio ?? "",
      github: profile?.github ?? "",
    },
    headline: profile?.target_role ?? "",
    summary: profile?.summary ?? "",
    experiences: [...experiences]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((experience) => ({
        company: experience.company,
        position: experience.position,
        location: experience.location ?? "",
        period: period(experience.start_date, experience.end_date, experience.current),
        bullets: bulletsFrom(experience),
      })),
    education: education.map((item) => ({
      institution: item.institution,
      course: item.course ?? "",
      degree: item.degree ?? "",
      period: period(item.start_date, item.end_date),
    })),
    hardSkills: skills.filter((skill) => skill.type === "hard").map((skill) => skill.name),
    softSkills: skills.filter((skill) => skill.type === "soft").map((skill) => skill.name),
    languages: languages.map((language) => ({
      language: language.language,
      level: language.level ?? "",
    })),
    certifications: certifications.map((certification) => ({
      name: certification.name,
      issuer: certification.issuer ?? "",
      year: certification.year ?? "",
    })),
  };
}

export function resumeToPlainText(content: ResumeContent) {
  return [
    content.personal.name,
    content.headline,
    [content.personal.email, content.personal.phone, content.personal.location]
      .filter(Boolean)
      .join(" | "),
    [content.personal.linkedin, content.personal.portfolio, content.personal.github]
      .filter(Boolean)
      .join(" | "),
    "RESUMO PROFISSIONAL",
    content.summary,
    "EXPERIÊNCIA PROFISSIONAL",
    ...content.experiences.map((experience) =>
      [
        `${experience.position} — ${experience.company} (${experience.period})`,
        ...experience.bullets.map((bullet) => `- ${bullet}`),
      ].join("\n"),
    ),
    "FORMAÇÃO ACADÊMICA",
    ...content.education.map(
      (item) => `${item.degree} ${item.course} — ${item.institution} (${item.period})`,
    ),
    "HABILIDADES",
    content.hardSkills.join(", "),
    content.softSkills.join(", "),
    "IDIOMAS",
    ...content.languages.map((language) => `${language.language} — ${language.level}`),
    "CERTIFICAÇÕES",
    ...content.certifications.map(
      (certification) => `${certification.name} — ${certification.issuer} ${certification.year}`,
    ),
  ]
    .filter(Boolean)
    .join("\n");
}

/** Verificação ATS determinística: estrutura, palavras-chave, contato e formato. */
export function analyzeAtsLocally(content: ResumeContent, job: Job | null): AtsAnalysis {
  const text = normalize(resumeToPlainText(content));
  const keywords = job ? [...new Set([...job.keywords, ...job.requirements])] : [];
  const keywordsFound = keywords.filter((keyword) => text.includes(normalize(keyword)));
  const keywordsMissing = keywords.filter((keyword) => !text.includes(normalize(keyword)));

  const hasContact = Boolean(content.personal.email && content.personal.phone);
  const hasSummary = content.summary.trim().length > 60;
  const hasExperience = content.experiences.length > 0;
  const hasBullets = content.experiences.every((experience) => experience.bullets.length > 0);
  const hasSkills = content.hardSkills.length >= 3;
  const coverage = keywords.length ? keywordsFound.length / keywords.length : 0.75;

  const checks: AtsAnalysis["checks"] = [
    {
      label: "Estrutura",
      status: hasExperience && content.education.length > 0 ? "ok" : "attention",
      detail:
        hasExperience && content.education.length > 0
          ? "Seções convencionais identificadas."
          : "Inclua experiência e formação com títulos convencionais.",
    },
    {
      label: "Palavras-chave",
      status: coverage >= 0.5 ? "ok" : "attention",
      detail: keywords.length
        ? `${keywordsFound.length} de ${keywords.length} termos da vaga aparecem no currículo.`
        : "Sem vaga associada para comparar termos.",
    },
    {
      label: "Experiência relevante",
      status: hasExperience && hasBullets ? "ok" : "attention",
      detail: hasBullets
        ? "Experiências descritas em tópicos legíveis."
        : "Descreva cada experiência em tópicos curtos.",
    },
    {
      label: "Informações de contato",
      status: hasContact ? "ok" : "attention",
      detail: hasContact ? "Email e telefone presentes." : "Adicione email e telefone.",
    },
    {
      label: "Resumo profissional",
      status: hasSummary ? "ok" : "attention",
      detail: hasSummary ? "Resumo com tamanho adequado." : "Escreva um resumo de 3 a 5 linhas.",
    },
    {
      label: "Formato",
      status: "ok",
      detail: "Layout em coluna única, sem gráficos ou imagens — legível por ATS.",
    },
  ];

  const improvements: string[] = [];
  if (!hasContact) improvements.push("Inclua email e telefone no topo do currículo.");
  if (!hasSummary) improvements.push("Amplie o resumo profissional para 3 a 5 linhas objetivas.");
  if (!hasSkills) improvements.push("Liste ao menos 3 habilidades técnicas que você realmente domina.");
  keywordsMissing.slice(0, 5).forEach((keyword) => {
    improvements.push(
      `A vaga cita "${keyword}". Se você tiver essa experiência, descreva-a; caso contrário, não inclua.`,
    );
  });
  if (!improvements.length) improvements.push("Nenhum ajuste estrutural crítico identificado.");

  const okCount = checks.filter((check) => check.status === "ok").length;
  const score = Math.round((okCount / checks.length) * 60 + coverage * 40);

  return {
    score: Math.max(10, Math.min(99, score)),
    checks,
    keywordsFound,
    keywordsMissing,
    improvements,
  };
}

export function resumeFileName(content: ResumeContent, job: Job | null) {
  const slug = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  return [
    slug(content.personal.name || "Curriculo"),
    "Curriculo",
    job ? slug(job.company) : "",
    job ? slug(job.title) : "",
  ]
    .filter(Boolean)
    .join("_");
}
