import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
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
import { computeProfileCompletion } from "@/lib/matching";
import { useProfileBundle, useRowMutation, useSaveProfile } from "@/lib/queries";
import { SENIORITY_OPTIONS, WORK_MODEL_OPTIONS } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Meu perfil — MatchCV" },
      {
        name: "description",
        content: "Atualize dados pessoais, objetivo, experiências, formação, habilidades e idiomas.",
      },
      { property: "og:title", content: "Meu perfil — MatchCV" },
      { property: "og:description", content: "Seu perfil profissional é a base de todos os matches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const bundle = useProfileBundle();
  const profile = bundle.profile;
  const saveProfile = useSaveProfile();
  const experiencesApi = useRowMutation("experiences", "experiences");
  const educationApi = useRowMutation("education", "education");
  const skillsApi = useRowMutation("skills", "skills");
  const languagesApi = useRowMutation("languages", "languages");
  const certificationsApi = useRowMutation("certifications", "certifications");

  const [form, setForm] = useState<Record<string, string>>({});
  const [experienceDraft, setExperienceDraft] = useState({
    company: "",
    position: "",
    start_date: "",
    end_date: "",
    description: "",
  });
  const [educationDraft, setEducationDraft] = useState({ institution: "", course: "", degree: "", end_date: "" });
  const [skillDraft, setSkillDraft] = useState({ name: "", type: "hard" as "hard" | "soft" });
  const [languageDraft, setLanguageDraft] = useState({ language: "", level: "" });
  const [certificationDraft, setCertificationDraft] = useState({ name: "", issuer: "", year: "" });

  const value = (key: string) => form[key] ?? ((profile as Record<string, unknown> | null)?.[key] as string | null) ?? "";
  const setValue = (key: string, next: string) => setForm({ ...form, [key]: next });
  const completion = computeProfileCompletion(bundle);

  const save = async () => {
    const payload = Object.fromEntries(
      Object.entries(form).map(([key, entry]) => [key, entry || null]),
    );
    await saveProfile.mutateAsync({ ...payload, profile_completion: completion });
    toast.success("Perfil atualizado.");
  };

  return (
    <AppShell
      title="Meu perfil"
      breadcrumb={[{ label: "Dashboard", to: "/dashboard" }, { label: "Meu perfil" }]}
      actions={
        <Button size="sm" onClick={save}>
          Salvar alterações
        </Button>
      }
    >
      <div className="surface-card mb-4 flex items-center gap-4 p-5">
        <div className="flex-1">
          <p className="text-sm font-medium">Completude do perfil</p>
          <Progress value={completion} className="mt-2 h-2" />
        </div>
        <span className="font-display text-2xl font-semibold">{completion}%</span>
      </div>

      <Tabs defaultValue="dados">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="experiencias">Experiências</TabsTrigger>
          <TabsTrigger value="formacao">Formação</TabsTrigger>
          <TabsTrigger value="skills">Habilidades</TabsTrigger>
          <TabsTrigger value="extras">Idiomas e certificações</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-5">
          <div className="surface-card grid gap-4 p-5 sm:grid-cols-2">
            {[
              ["name", "Nome completo"],
              ["email", "Email"],
              ["phone", "Telefone"],
              ["city", "Cidade"],
              ["state", "Estado"],
              ["linkedin", "LinkedIn"],
              ["portfolio", "Portfólio"],
              ["github", "GitHub"],
              ["target_role", "Cargo-alvo"],
              ["professional_area", "Área profissional"],
            ].map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input value={value(key)} onChange={(event) => setValue(key, event.target.value)} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Senioridade</Label>
              <Select value={value("seniority")} onValueChange={(next) => setValue("seniority", next)}>
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
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Modelo de trabalho</Label>
              <Select value={value("work_model")} onValueChange={(next) => setValue("work_model", next)}>
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
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Resumo profissional</Label>
              <Textarea
                rows={4}
                value={value("summary")}
                onChange={(event) => setValue("summary", event.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="experiencias" className="mt-5 space-y-3">
          {bundle.experiences.map((experience) => (
            <div key={experience.id} className="surface-card flex items-start justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold">
                  {experience.position} — {experience.company}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[experience.start_date, experience.end_date || "atual"].filter(Boolean).join(" a ")}
                </p>
                {experience.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{experience.description}</p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remover"
                onClick={() => experiencesApi.remove.mutate(experience.id)}
              >
                <Trash2 className="size-4 text-[var(--destructive)]" />
              </Button>
            </div>
          ))}
          <div className="surface-card grid gap-3 p-4 sm:grid-cols-2">
            <Input
              placeholder="Empresa"
              value={experienceDraft.company}
              onChange={(event) => setExperienceDraft({ ...experienceDraft, company: event.target.value })}
            />
            <Input
              placeholder="Cargo"
              value={experienceDraft.position}
              onChange={(event) => setExperienceDraft({ ...experienceDraft, position: event.target.value })}
            />
            <Input
              placeholder="Início (03/2021)"
              value={experienceDraft.start_date}
              onChange={(event) => setExperienceDraft({ ...experienceDraft, start_date: event.target.value })}
            />
            <Input
              placeholder="Fim (vazio = atual)"
              value={experienceDraft.end_date}
              onChange={(event) => setExperienceDraft({ ...experienceDraft, end_date: event.target.value })}
            />
            <Textarea
              className="sm:col-span-2"
              rows={3}
              placeholder="Atividades e responsabilidades"
              value={experienceDraft.description}
              onChange={(event) => setExperienceDraft({ ...experienceDraft, description: event.target.value })}
            />
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
                setExperienceDraft({ company: "", position: "", start_date: "", end_date: "", description: "" });
              }}
            >
              <Plus className="mr-1.5 size-4" /> Adicionar experiência
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="formacao" className="mt-5 space-y-3">
          {bundle.education.map((item) => (
            <div key={item.id} className="surface-card flex items-center justify-between p-4">
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
          <div className="surface-card grid gap-3 p-4 sm:grid-cols-2">
            <Input
              placeholder="Instituição"
              value={educationDraft.institution}
              onChange={(event) => setEducationDraft({ ...educationDraft, institution: event.target.value })}
            />
            <Input
              placeholder="Curso"
              value={educationDraft.course}
              onChange={(event) => setEducationDraft({ ...educationDraft, course: event.target.value })}
            />
            <Input
              placeholder="Grau"
              value={educationDraft.degree}
              onChange={(event) => setEducationDraft({ ...educationDraft, degree: event.target.value })}
            />
            <Input
              placeholder="Conclusão"
              value={educationDraft.end_date}
              onChange={(event) => setEducationDraft({ ...educationDraft, end_date: event.target.value })}
            />
            <Button
              variant="outline"
              className="sm:col-span-2"
              onClick={async () => {
                if (!educationDraft.institution) return;
                await educationApi.insert.mutateAsync(educationDraft);
                setEducationDraft({ institution: "", course: "", degree: "", end_date: "" });
              }}
            >
              <Plus className="mr-1.5 size-4" /> Adicionar formação
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-5 space-y-4">
          <div className="surface-card p-5">
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
                <p className="text-sm text-muted-foreground">
                  Não encontramos habilidades cadastradas no seu perfil.
                </p>
              ) : null}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Habilidade"
                value={skillDraft.name}
                onChange={(event) => setSkillDraft({ ...skillDraft, name: event.target.value })}
              />
              <Select
                value={skillDraft.type}
                onValueChange={(next) => setSkillDraft({ ...skillDraft, type: next as "hard" | "soft" })}
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
          </div>
        </TabsContent>

        <TabsContent value="extras" className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="surface-card p-5">
            <h2 className="font-display text-base font-semibold">Idiomas</h2>
            <div className="mt-3 space-y-2">
              {bundle.languages.map((language) => (
                <div key={language.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
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
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Idioma"
                value={languageDraft.language}
                onChange={(event) => setLanguageDraft({ ...languageDraft, language: event.target.value })}
              />
              <Input
                placeholder="Nível"
                value={languageDraft.level}
                onChange={(event) => setLanguageDraft({ ...languageDraft, level: event.target.value })}
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

          <div className="surface-card p-5">
            <h2 className="font-display text-base font-semibold">Certificações</h2>
            <div className="mt-3 space-y-2">
              {bundle.certifications.map((certification) => (
                <div
                  key={certification.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <span className="text-sm">
                    {certification.name}
                    {certification.issuer ? ` — ${certification.issuer}` : ""}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover"
                    onClick={() => certificationsApi.remove.mutate(certification.id)}
                  >
                    <Trash2 className="size-4 text-[var(--destructive)]" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <Input
                placeholder="Nome"
                value={certificationDraft.name}
                onChange={(event) =>
                  setCertificationDraft({ ...certificationDraft, name: event.target.value })
                }
              />
              <Input
                placeholder="Emissor"
                value={certificationDraft.issuer}
                onChange={(event) =>
                  setCertificationDraft({ ...certificationDraft, issuer: event.target.value })
                }
              />
              <Input
                placeholder="Ano"
                value={certificationDraft.year}
                onChange={(event) =>
                  setCertificationDraft({ ...certificationDraft, year: event.target.value })
                }
              />
              <Button
                variant="outline"
                className="sm:col-span-3"
                onClick={async () => {
                  if (!certificationDraft.name.trim()) return;
                  await certificationsApi.insert.mutateAsync(certificationDraft);
                  setCertificationDraft({ name: "", issuer: "", year: "" });
                }}
              >
                <Plus className="mr-1.5 size-4" /> Adicionar certificação
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
