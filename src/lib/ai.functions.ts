import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateAiText, parseAiJson } from "./ai.server";
import { analyzeJobLocally, calculateMatchLocally } from "./matching";
import { analyzeAtsLocally, buildBaseResume, resumeToPlainText } from "./resume";
import type {
  AtsAnalysis,
  Certification,
  Education,
  Experience,
  Job,
  JobAnalysis,
  Language,
  MatchBreakdown,
  Profile,
  ResumeContent,
  Skill,
} from "./types";

type SupabaseLike = {
  from: (table: string) => any;
};

async function loadBundle(supabase: SupabaseLike, userId: string) {
  const [profile, experiences, education, skills, languages, certifications] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("experiences").select("*").eq("user_id", userId).order("sort_order"),
    supabase.from("education").select("*").eq("user_id", userId),
    supabase.from("skills").select("*").eq("user_id", userId),
    supabase.from("languages").select("*").eq("user_id", userId),
    supabase.from("certifications").select("*").eq("user_id", userId),
  ]);

  return {
    profile: (profile.data ?? null) as Profile | null,
    experiences: (experiences.data ?? []) as Experience[],
    education: (education.data ?? []) as Education[],
    skills: (skills.data ?? []) as Skill[],
    languages: (languages.data ?? []) as Language[],
    certifications: (certifications.data ?? []) as Certification[],
  };
}

async function loadJob(supabase: SupabaseLike, jobId: string): Promise<Job> {
  const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).maybeSingle();
  if (error || !data) throw new Error("Vaga não encontrada.");
  return data as Job;
}

function jobToPrompt(job: Job) {
  return [
    `Cargo: ${job.title}`,
    `Empresa: ${job.company}`,
    `Localização: ${job.location ?? "não informada"} | Modelo: ${job.work_model ?? "não informado"}`,
    `Senioridade: ${job.seniority ?? "não informada"}`,
    `Descrição: ${job.description ?? ""}`,
    `Requisitos: ${job.requirements.join("; ")}`,
    `Responsabilidades: ${job.responsibilities.join("; ")}`,
  ].join("\n");
}

/** analyzeJob() — analisa a descrição da vaga e devolve skills e palavras-chave. */
export const analyzeJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ jobId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabase = (context as { supabase: SupabaseLike }).supabase;
    const job = await loadJob(supabase, data.jobId);
    const local = analyzeJobLocally(job);

    try {
      const raw = await generateAiText(
        `Analise a vaga abaixo e extraia as exigências reais.\n\n${jobToPrompt(job)}\n\n` +
          `Formato do JSON: {"hardSkills":[],"softSkills":[],"tools":[],"languages":[],"education":[],"experience":[],"keywords":[]}. ` +
          `Use apenas termos presentes na vaga. Máximo de 12 itens por lista.`,
      );
      const parsed = parseAiJson<JobAnalysis>(raw);
      if (parsed) {
        return {
          hardSkills: parsed.hardSkills ?? local.hardSkills,
          softSkills: parsed.softSkills ?? local.softSkills,
          tools: parsed.tools ?? local.tools,
          languages: parsed.languages ?? local.languages,
          education: parsed.education ?? local.education,
          experience: parsed.experience ?? local.experience,
          keywords: parsed.keywords ?? local.keywords,
          source: "ai" as const,
        };
      }
    } catch {
      // segue com a análise determinística
    }

    return { ...local, source: "local" as const };
  });

/** calculateMatch() — compara perfil e vaga, salva e devolve o detalhamento do score. */
export const calculateMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ jobId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: SupabaseLike; userId: string };
    const job = await loadJob(supabase, data.jobId);
    const bundle = await loadBundle(supabase, userId);
    const breakdown = calculateMatchLocally(job, bundle);

    await supabase.from("job_matches").upsert(
      {
        user_id: userId,
        job_id: job.id,
        match_score: breakdown.score,
        matching_skills: breakdown.matching,
        missing_information: breakdown.missing,
        analysis: breakdown,
      },
      { onConflict: "user_id,job_id" },
    );

    return breakdown as MatchBreakdown;
  });

/** customizeResume() — gera uma versão do currículo direcionada à vaga, sem inventar dados. */
export const customizeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ jobId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: SupabaseLike; userId: string };
    const job = await loadJob(supabase, data.jobId);
    const bundle = await loadBundle(supabase, userId);
    const base = buildBaseResume(bundle);

    if (!base.experiences.length && !base.hardSkills.length) {
      throw new Error("Complete seu perfil antes de gerar um currículo personalizado.");
    }

    let customized: ResumeContent = structuredClone(base);
    let changes: string[] = [];
    let source: "ai" | "local" = "local";

    try {
      const raw = await generateAiText(
        `Vaga:\n${jobToPrompt(job)}\n\n` +
          `Currículo real do candidato (JSON):\n${JSON.stringify(base)}\n\n` +
          `Reescreva o currículo para esta vaga usando SOMENTE as informações acima. ` +
          `Você pode reordenar experiências, reescrever o resumo, ajustar o título profissional, ` +
          `reordenar habilidades e reformular tópicos — sem criar empresas, cargos, datas, números, ` +
          `certificações ou tecnologias que não constem no currículo. ` +
          `Devolva JSON: {"resume": <mesma estrutura do currículo>, "changes": ["..."]}. ` +
          `Em "changes", liste em português o que foi alterado para esta vaga.`,
      );
      const parsed = parseAiJson<{ resume: ResumeContent; changes: string[] }>(raw);
      if (parsed?.resume) {
        customized = sanitizeCustomized(base, parsed.resume);
        changes = (parsed.changes ?? []).slice(0, 8);
        source = "ai";
      }
    } catch {
      // segue com a personalização determinística
    }

    if (source === "local") {
      const fallback = fallbackCustomize(base, job);
      customized = fallback.resume;
      changes = fallback.changes;
    }

    const ats = analyzeAtsLocally(customized, job);

    const { data: inserted, error } = await supabase
      .from("resumes")
      .insert({
        user_id: userId,
        title: `${job.title} — ${job.company}`,
        target_job_id: job.id,
        content: customized,
        template: "classic",
        ats_score: ats.score,
        ats_analysis: ats,
        changes,
        status: "ready",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    return { resume: inserted, base, changes, ats, source };
  });

/** Garante que nada inventado pela IA entre no currículo final. */
function sanitizeCustomized(base: ResumeContent, candidate: ResumeContent): ResumeContent {
  const allowedSkills = new Set([...base.hardSkills, ...base.softSkills].map((s) => s.toLowerCase()));
  const byKey = new Map(
    base.experiences.map((experience) => [
      `${experience.company}|${experience.position}`.toLowerCase(),
      experience,
    ]),
  );

  const experiences = (candidate.experiences ?? [])
    .map((experience) => {
      const original = byKey.get(`${experience.company}|${experience.position}`.toLowerCase());
      if (!original) return null;
      return {
        company: original.company,
        position: original.position,
        location: original.location,
        period: original.period,
        bullets: (experience.bullets ?? original.bullets).filter(Boolean).slice(0, 8),
      };
    })
    .filter(Boolean) as ResumeContent["experiences"];

  const missing = base.experiences.filter(
    (experience) =>
      !experiences.some(
        (kept) => kept.company === experience.company && kept.position === experience.position,
      ),
  );

  return {
    personal: base.personal,
    headline: candidate.headline?.trim() || base.headline,
    summary: candidate.summary?.trim() || base.summary,
    experiences: [...experiences, ...missing],
    education: base.education,
    hardSkills: dedupeAllowed(candidate.hardSkills, base.hardSkills, allowedSkills),
    softSkills: dedupeAllowed(candidate.softSkills, base.softSkills, allowedSkills),
    languages: base.languages,
    certifications: base.certifications,
  };
}

function dedupeAllowed(candidate: string[] | undefined, base: string[], allowed: Set<string>) {
  const ordered = (candidate ?? []).filter((skill) => allowed.has(skill?.toLowerCase?.() ?? ""));
  const rest = base.filter(
    (skill) => !ordered.some((item) => item.toLowerCase() === skill.toLowerCase()),
  );
  return [...ordered, ...rest];
}

/** Personalização determinística usada quando a IA não está disponível. */
function fallbackCustomize(base: ResumeContent, job: Job) {
  const analysis = analyzeJobLocally(job);
  const relevant = new Set(
    [...analysis.hardSkills, ...analysis.tools].map((skill) => skill.toLowerCase()),
  );

  const score = (text: string) =>
    [...relevant].filter((skill) => text.toLowerCase().includes(skill)).length;

  const experiences = [...base.experiences].sort(
    (a, b) =>
      score([b.position, b.bullets.join(" ")].join(" ")) -
      score([a.position, a.bullets.join(" ")].join(" ")),
  );

  const prioritize = (skills: string[]) =>
    [...skills].sort(
      (a, b) => Number(relevant.has(b.toLowerCase())) - Number(relevant.has(a.toLowerCase())),
    );

  const resume: ResumeContent = {
    ...base,
    headline: base.headline || job.title,
    experiences,
    hardSkills: prioritize(base.hardSkills),
    softSkills: prioritize(base.softSkills),
  };

  return {
    resume,
    changes: [
      "Experiências mais relevantes para a vaga foram colocadas em destaque.",
      "Habilidades compatíveis com a vaga foram reorganizadas no topo das listas.",
      base.headline ? "Título profissional mantido conforme seu perfil." : `Título profissional ajustado para "${job.title}".`,
      "Nenhuma informação nova foi criada — apenas a ordem e a apresentação mudaram.",
    ],
  };
}

/** analyzeATS() — avalia estrutura, palavras-chave e legibilidade do currículo. */
export const analyzeATS = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ resumeId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: SupabaseLike; userId: string };
    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", data.resumeId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !resume) throw new Error("Currículo não encontrado.");

    const job = resume.target_job_id ? await loadJob(supabase, resume.target_job_id) : null;
    const content = resume.content as ResumeContent;
    const analysis: AtsAnalysis = analyzeAtsLocally(content, job);

    try {
      const raw = await generateAiText(
        `Currículo (texto):\n${resumeToPlainText(content)}\n\n` +
          (job ? `Vaga:\n${jobToPrompt(job)}\n\n` : "") +
          `Liste até 5 oportunidades objetivas de melhoria de compatibilidade com ATS, sem prometer aprovação ` +
          `e sem sugerir incluir informações que o candidato não possui. ` +
          `Devolva JSON: {"improvements":["..."]}`,
      );
      const parsed = parseAiJson<{ improvements: string[] }>(raw);
      if (parsed?.improvements?.length) {
        analysis.improvements = parsed.improvements.slice(0, 5);
      }
    } catch {
      // mantém as sugestões determinísticas
    }

    await supabase
      .from("resumes")
      .update({ ats_score: analysis.score, ats_analysis: analysis })
      .eq("id", resume.id)
      .eq("user_id", userId);

    return analysis;
  });

/** explainChanges() — descreve as diferenças entre a versão original e a personalizada. */
export const explainChanges = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ resumeId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: SupabaseLike; userId: string };
    const { data: resume } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", data.resumeId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!resume) throw new Error("Currículo não encontrado.");

    const bundle = await loadBundle(supabase, userId);
    const base = buildBaseResume(bundle);
    const content = resume.content as ResumeContent;

    const changes: string[] = Array.isArray(resume.changes) ? resume.changes : [];
    if (!changes.length) {
      if (content.summary !== base.summary) changes.push("Resumo profissional ajustado para a vaga.");
      if (content.headline !== base.headline) changes.push("Título profissional ajustado para a vaga.");
      if (content.experiences[0]?.company !== base.experiences[0]?.company) {
        changes.push("Experiência mais relevante colocada em destaque.");
      }
      if (content.hardSkills[0] !== base.hardSkills[0]) {
        changes.push("Habilidades relevantes reorganizadas.");
      }
      if (!changes.length) changes.push("Nenhuma alteração relevante registrada.");
    }

    return { changes, original: base, customized: content };
  });
