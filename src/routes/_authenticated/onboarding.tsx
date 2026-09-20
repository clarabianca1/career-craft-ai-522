import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { computeProfileCompletion } from "@/lib/matching";
import { useProfileBundle, useRowMutation, useSaveProfile } from "@/lib/queries";
import { SENIORITY_OPTIONS, WORK_MODEL_OPTIONS } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Montar meu perfil — MatchCV" },
      {
        name: "description",
        content: "Cadastre dados pessoais, objetivo, experiências, formação, skills e currículo.",
      },
      { property: "og:title", content: "Montar meu perfil — MatchCV" },
      { property: "og:description", content: "Onboarding guiado do perfil profissional." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const STEPS = [
  "Dados pessoais",
  "Objetivo profissional",
  "Experiências",
  "Formação",
  "Habilidades",
  "Idiomas",
  "Currículo",
];

function Onboarding() {
  const bundle = useProfileBundle();
  const { user } = useAuth();
  const saveProfile = useSaveProfile();
  const experiencesApi = useRowMutation("experiences", "experiences");
  const educationApi = useRowMutation("education", "education");
  const skillsApi = useRowMutation("skills", "skills");
  const languagesApi = useRowMutation("languages", "languages");
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [personal, setPersonal] = useState({
    name: "",
    phone: "",
    city: "",
    state: "",
    linkedin: "",
    portfolio: "",
  });
  const [goal, setGoal] = useState({
    target_role: "",
    professional_area: "",
    seniority: "",
    work_model: "",
    desired_location: "",
    salary_expectation: "",
    summary: "",
  });
  const [experienceDraft, setExperienceDraft] = useState({
    company: "",
    position: "",
    location: "",
    start_date: "",
    end_date: "",
    description: "",
    achievements: "",
  });
  const [educationDraft, setEducationDraft] = useState({
    institution: "",
    course: "",
    degree: "",
    start_date: "",
    end_date: "",
  });
  const [skillDraft, setSkillDraft] = useState({ name: "", type: "hard" as "hard" | "soft" });
  const [languageDraft, setLanguageDraft] = useState({ language: "", level: "" });
  const [resumeText, setResumeText] = useState("");

  const profile = bundle.profile;
  const merged = {
    ...bundle,
    profile: profile
      ? {
          ...profile,
          ...Object.fromEntries(Object.entries(personal).filter(([, value]) => value)),
          ...Object.fromEntries(Object.entries(goal).filter(([, value]) => value)),
        }
      : null,
  };
  const completion = computeProfileCompletion(merged);

  const savePersonal = async () => {
    await saveProfile.mutateAsync({
      name: (personal.name || profile?.name) ?? null,
      email: profile?.email ?? user?.email ?? null,
      phone: (personal.phone || profile?.phone) ?? null,
      city: (personal.city || profile?.city) ?? null,
      state: (personal.state || profile?.state) ?? null,
      linkedin: (personal.linkedin || profile?.linkedin) ?? null,
      portfolio: (personal.portfolio || profile?.portfolio) ?? null,
    });
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      if (step === 0) {
        if (!(personal.name || profile?.name)) {
          toast.error("Informe seu nome para continuar.");
          return;
        }
        await savePersonal();
      }
      if (step === 1) {
        await saveProfile.mutateAsync({
          target_role: (goal.target_role || profile?.target_role) ?? null,
          professional_area: (goal.professional_area || profile?.professional_area) ?? null,
          seniority: (goal.seniority || profile?.seniority) ?? null,
          work_model: (goal.work_model || profile?.work_model) ?? null,
          desired_location: (goal.desired_location || profile?.desired_location) ?? null,
          salary_expectation: (goal.salary_expectation || profile?.salary_expectation) ?? null,
          summary: (goal.summary || profile?.summary) ?? null,
        });
      }
      if (step === STEPS.length - 1) {
        await saveProfile.mutateAsync({
          resume_text: (resumeText || profile?.resume_text) ?? null,
          profile_completion: completion,
          onboarding_completed: true,
        });
        toast.success("Perfil pronto! Vamos encontrar suas vagas.");
        navigate({ to: "/dashboard" });
        return;
      }
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    } catch {
      toast.error("Não foi possível salvar agora. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const reorder = async (index: number, direction: -1 | 1) => {
    const list = bundle.experiences;
    const target = list[index + direction];
    const current = list[index];
    if (!target || !current) return;
    await experiencesApi.update.mutateAsync({
      id: current.id,
      values: { sort_order: target.sort_order },
    });
    await experiencesApi.update.mutateAsync({
      id: target.id,
      values: { sort_order: current.sort_order },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-burgundy-gradient px-4 py-5 text-[color:var(--sidebar-foreground)]">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-md bg-[var(--gold)] text-[color:var(--accent-foreground)]">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="text-xs opacity-75">
              Etapa {step + 1} de {STEPS.length}
            </p>
            <h1 className="font-display text-lg font-semibold">{STEPS[step]}</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center gap-3">
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
          <span className="text-xs text-muted-foreground">Perfil {completion}%</span>
        </div>

        <div className="surface-card mt-6 p-5 lg:p-6">
          {step === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo" required>
                <Input
                  value={personal.name || profile?.name || ""}
                  onChange={(event) => setPersonal({ ...personal, name: event.target.value })}
                />
              </Field>
              <Field label="Telefone">
                <Input
                  value={personal.phone || profile?.phone || ""}
                  onChange={(event) => setPersonal({ ...personal, phone: event.target.value })}
                />
              </Field>
              <Field label="Cidade">
                <Input
                  value={personal.city || profile?.city || ""}
                  onChange={(event) => setPersonal({ ...personal, city: event.target.value })}
                />
              </Field>
              <Field label="Estado">
                <Input
                  value={personal.state || profile?.state || ""}
                  onChange={(event) => setPersonal({ ...personal, state: event.target.value })}
                />
              </Field>
              <Field label="LinkedIn">
                <Input
                  value={personal.linkedin || profile?.linkedin || ""}
                  onChange={(event) => setPersonal({ ...personal, linkedin: event.target.value })}
                />
              </Field>
              <Field label="Portfólio ou site">
                <Input
                  value={personal.portfolio || profile?.portfolio || ""}
                  onChange={(event) => setPersonal({ ...personal, portfolio: event.target.value })}
                />
              </Field>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cargo-alvo">
                <Input
                  placeholder="Ex.: Analista de Dados"
                  value={goal.target_role || profile?.target_role || ""}
                  onChange={(event) => setGoal({ ...goal, target_role: event.target.value })}
                />
              </Field>
              <Field label="Área profissional">
                <Input
                  value={goal.professional_area || profile?.professional_area || ""}
                  onChange={(event) => setGoal({ ...goal, professional_area: event.target.value })}
                />
              </Field>
              <Field label="Senioridade">
                <Select
                  value={goal.seniority || profile?.seniority || ""}
                  onValueChange={(value) => setGoal({ ...goal, seniority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {SENIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Modelo de trabalho">
                <Select
                  value={goal.work_model || profile?.work_model || ""}
                  onValueChange={(value) => setGoal({ ...goal, work_model: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_MODEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Localização desejada">
                <Input
                  value={goal.desired_location || profile?.desired_location || ""}
                  onChange={(event) => setGoal({ ...goal, desired_location: event.target.value })}
                />
              </Field>
              <Field label="Pretensão salarial">
                <Input
                  value={goal.salary_expectation || profile?.salary_expectation || ""}
                  onChange={(event) => setGoal({ ...goal, salary_expectation: event.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Resumo profissional (com suas palavras)">
                  <Textarea
                    rows={4}
                    value={goal.summary || profile?.summary || ""}
                    onChange={(event) => setGoal({ ...goal, summary: event.target.value })}
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {bundle.experiences.map((experience, index) => (
                  <div
                    key={experience.id}
                    className="flex items-start justify-between gap-3 rounded-lg border px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {experience.position} — {experience.company}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[experience.start_date, experience.end_date || "atual"]
                          .filter(Boolean)
                          .join(" a ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Subir"
                        disabled={index === 0}
                        onClick={() => reorder(index, -1)}
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Descer"
                        disabled={index === bundle.experiences.length - 1}
                        onClick={() => reorder(index, 1)}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remover"
                        onClick={() => experiencesApi.remove.mutate(experience.id)}
                      >
                        <Trash2 className="size-4 text-[var(--destructive)]" />
                      </Button>
                    </div>
                  </div>
                ))}
                {!bundle.experiences.length ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma experiência cadastrada ainda.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                <Field label="Empresa">
                  <Input
                    value={experienceDraft.company}
                    onChange={(event) =>
                      setExperienceDraft({ ...experienceDraft, company: event.target.value })
                    }
                  />
                </Field>
                <Field label="Cargo">
                  <Input
                    value={experienceDraft.position}
                    onChange={(event) =>
                      setExperienceDraft({ ...experienceDraft, position: event.target.value })
                    }
                  />
                </Field>
                <Field label="Início (ex.: 03/2021)">
                  <Input
                    value={experienceDraft.start_date}
                    onChange={(event) =>
                      setExperienceDraft({ ...experienceDraft, start_date: event.target.value })
                    }
                  />
                </Field>
                <Field label="Fim (vazio = atual)">
                  <Input
                    value={experienceDraft.end_date}
                    onChange={(event) =>
                      setExperienceDraft({ ...experienceDraft, end_date: event.target.value })
                    }
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Atividades e responsabilidades">
                    <Textarea
                      rows={3}
                      value={experienceDraft.description}
                      onChange={(event) =>
                        setExperienceDraft({ ...experienceDraft, description: event.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Resultados (opcional, apenas fatos reais)">
                    <Textarea
                      rows={2}
                      value={experienceDraft.achievements}
                      onChange={(event) =>
                        setExperienceDraft({ ...experienceDraft, achievements: event.target.value })
                      }
                    />
                  </Field>
                </div>
                <Button
                  variant="outline"
                  className="sm:col-span-2"
                  onClick={async () => {
                    if (!experienceDraft.company || !experienceDraft.position) {
                      toast.error("Informe empresa e cargo.");
                      return;
                    }
                    await experiencesApi.insert.mutateAsync({
                      ...experienceDraft,
                      current: !experienceDraft.end_date,
                      sort_order: bundle.experiences.length,
                    });
                    setExperienceDraft({
                      company: "",
                      position: "",
                      location: "",
                      start_date: "",
                      end_date: "",
                      description: "",
                      achievements: "",
                    });
                    toast.success("Experiência adicionada.");
                  }}
                >
                  <Plus className="mr-1.5 size-4" /> Adicionar experiência
                </Button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              {bundle.education.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {item.degree} {item.course}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.institution}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover"
                    onClick={() => educationApi.remove.mutate(item.id)}
                  >
                    <Trash2 className="size-4 text-[var(--destructive)]" />
                  </Button>
                </div>
              ))}
              <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                <Field label="Instituição">
                  <Input
                    value={educationDraft.institution}
                    onChange={(event) =>
                      setEducationDraft({ ...educationDraft, institution: event.target.value })
                    }
                  />
                </Field>
                <Field label="Curso">
                  <Input
                    value={educationDraft.course}
                    onChange={(event) =>
                      setEducationDraft({ ...educationDraft, course: event.target.value })
                    }
                  />
                </Field>
                <Field label="Grau (ex.: Bacharelado)">
                  <Input
                    value={educationDraft.degree}
                    onChange={(event) =>
                      setEducationDraft({ ...educationDraft, degree: event.target.value })
                    }
                  />
                </Field>
                <Field label="Conclusão">
                  <Input
                    value={educationDraft.end_date}
                    onChange={(event) =>
                      setEducationDraft({ ...educationDraft, end_date: event.target.value })
                    }
                  />
                </Field>
                <Button
                  variant="outline"
                  className="sm:col-span-2"
                  onClick={async () => {
                    if (!educationDraft.institution) {
                      toast.error("Informe a instituição.");
                      return;
                    }
                    await educationApi.insert.mutateAsync(educationDraft);
                    setEducationDraft({
                      institution: "",
                      course: "",
                      degree: "",
                      start_date: "",
                      end_date: "",
                    });
                  }}
                >
                  <Plus className="mr-1.5 size-4" /> Adicionar formação
                </Button>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {bundle.skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant={skill.type === "hard" ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => skillsApi.remove.mutate(skill.id)}
                  >
                    {skill.name} ✕
                  </Badge>
                ))}
                {!bundle.skills.length ? (
                  <p className="text-sm text-muted-foreground">Nenhuma habilidade cadastrada.</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Ex.: SQL, Power BI, Comunicação"
                  value={skillDraft.name}
                  onChange={(event) => setSkillDraft({ ...skillDraft, name: event.target.value })}
                />
                <Select
                  value={skillDraft.type}
                  onValueChange={(value) =>
                    setSkillDraft({ ...skillDraft, type: value as "hard" | "soft" })
                  }
                >
                  <SelectTrigger className="sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hard">Técnica</SelectItem>
                    <SelectItem value="soft">Comportamental</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!skillDraft.name.trim()) return;
                    await skillsApi.insert.mutateAsync({
                      name: skillDraft.name.trim(),
                      type: skillDraft.type,
                    });
                    setSkillDraft({ name: "", type: skillDraft.type });
                  }}
                >
                  Adicionar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Cadastre apenas habilidades que você realmente possui — elas são a base do match.
              </p>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {bundle.languages.map((language) => (
                  <div
                    key={language.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-2.5"
                  >
                    <span className="text-sm">
                      {language.language} — {language.level || "nível não informado"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remover"
                      onClick={() => languagesApi.remove.mutate(language.id)}
                    >
                      <Trash2 className="size-4 text-[var(--destructive)]" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Idioma"
                  value={languageDraft.language}
                  onChange={(event) =>
                    setLanguageDraft({ ...languageDraft, language: event.target.value })
                  }
                />
                <Input
                  placeholder="Nível"
                  value={languageDraft.level}
                  onChange={(event) =>
                    setLanguageDraft({ ...languageDraft, level: event.target.value })
                  }
                />
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!languageDraft.language.trim()) return;
                    await languagesApi.insert.mutateAsync(languageDraft);
                    setLanguageDraft({ language: "", level: "" });
                  }}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          ) : null}

          {step === 6 ? (
            <Tabs defaultValue="paste">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="paste">Colar texto</TabsTrigger>
                <TabsTrigger value="upload">Enviar arquivo</TabsTrigger>
                <TabsTrigger value="manual">Criar manualmente</TabsTrigger>
              </TabsList>
              <TabsContent value="paste" className="mt-4 space-y-3">
                <Field label="Cole o conteúdo do seu currículo">
                  <Textarea
                    rows={10}
                    value={resumeText || profile?.resume_text || ""}
                    onChange={(event) => setResumeText(event.target.value)}
                  />
                </Field>
                <p className="text-xs text-muted-foreground">
                  Revise o conteúdo antes de salvar. Nada é inventado: usaremos apenas o que está aqui.
                </p>
              </TabsContent>
              <TabsContent value="upload" className="mt-4 space-y-3">
                <Input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.type === "application/pdf" || file.name.endsWith(".docx")) {
                      toast.info(
                        "Para PDF e DOCX, abra o arquivo e cole o texto na aba “Colar texto” para revisar antes de salvar.",
                      );
                      return;
                    }
                    setResumeText(await file.text());
                    toast.success("Texto extraído. Revise antes de salvar.");
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Aceitamos .txt diretamente; para PDF e DOCX, cole o texto para revisão.
                </p>
              </TabsContent>
              <TabsContent value="manual" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Você já preencheu experiências, formação e habilidades — isso é suficiente para
                  gerarmos seu currículo base. Pode seguir para o dashboard.
                </p>
              </TabsContent>
            </Tabs>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-1.5 size-4" /> Voltar
          </Button>
          <div className="flex items-center gap-2">
            {step < STEPS.length - 1 ? (
              <Button variant="ghost" onClick={() => setStep(step + 1)}>
                Pular etapa
              </Button>
            ) : null}
            <Button onClick={handleNext} disabled={saving}>
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {step === STEPS.length - 1 ? "Concluir perfil" : "Continuar"}
              {step === STEPS.length - 1 ? null : <ArrowRight className="ml-1.5 size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
    </div>
  );
}
