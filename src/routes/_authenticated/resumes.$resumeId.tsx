import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileDown,
  Loader2,
  Save,
  ScanLine,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { RESUME_TEMPLATES, ResumePreview } from "@/components/ResumePreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { analyzeATS } from "@/lib/ai.functions";
import { useAuth } from "@/lib/auth";
import { exportResumeDocx, exportResumePdf } from "@/lib/export";
import { useJob, useProfileBundle, useResume } from "@/lib/queries";
import { buildBaseResume, resumeFileName, normalizeResumeContent } from "@/lib/resume";
import type { AtsAnalysis, ResumeContent } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/resumes/$resumeId")({
  head: () => ({
    meta: [
      { title: "Editor de currículo — MatchCV" },
      {
        name: "description",
        content: "Edite o conteúdo, veja o preview em tempo real, rode a verificação ATS e exporte em PDF ou DOCX.",
      },
      { property: "og:title", content: "Editor de currículo — MatchCV" },
      { property: "og:description", content: "Editor com preview, verificação ATS e exportação." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResumeEditor,
});

function ResumeEditor() {
  const { resumeId } = Route.useParams();
  const { data: resume, isLoading } = useResume(resumeId);
  const { data: job } = useJob(resume?.target_job_id ?? "");
  const bundle = useProfileBundle();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const analyzeAtsFn = useServerFn(analyzeATS);

  const [content, setContent] = useState<ResumeContent | null>(null);
  const [template, setTemplate] = useState<"classic" | "modern" | "executive">("classic");
  const [showOriginal, setShowOriginal] = useState(false);
  const [ats, setAts] = useState<AtsAnalysis | null>(null);

  useEffect(() => {
    if (resume && !content) {
      setContent(normalizeResumeContent(resume.content));
      setTemplate(resume.template);
      setAts(resume.ats_analysis ?? null);
    }
  }, [resume, content]);

  const original = useMemo(() => buildBaseResume(bundle), [bundle]);
  const visible = showOriginal ? original : content;

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("resumes")
        .update({
          content: content as never,
          template,
          status: "pronto",
          updated_at: new Date().toISOString(),
        })
        .eq("id", resumeId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume", resumeId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["resumes", user?.id] });
      toast.success("Currículo salvo.");
    },
    onError: () => toast.error("Não foi possível salvar."),
  });

  const runAts = useMutation({
    mutationFn: async () => {
      await save.mutateAsync();
      return analyzeAtsFn({ data: { resumeId } });
    },
    onSuccess: (analysis) => setAts(analysis),
    onError: () => toast.error("Não foi possível executar a verificação ATS."),
  });

  if (isLoading || !content || !visible) {
    return (
      <AppShell title="Editor de currículo">
        <Skeleton className="h-96 w-full" />
      </AppShell>
    );
  }

  const fileName = resumeFileName(content, job ?? null);

  const update = (patch: Partial<ResumeContent>) => setContent({ ...content, ...patch });

  return (
    <AppShell
      title={resume?.title ?? "Currículo"}
      breadcrumb={[{ label: "Meus currículos", to: "/resumes" }, { label: "Editor" }]}
      actions={
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Save className="mr-1.5 size-4" />}
            Salvar
          </Button>
          <Button size="sm" onClick={() => exportResumePdf("resume-print-area", fileName)}>
            <Download className="mr-1.5 size-4" /> PDF
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="surface-card p-5">
            <Tabs defaultValue="conteudo">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
                <TabsTrigger value="ats">ATS Scanner</TabsTrigger>
                <TabsTrigger value="alteracoes">Alterações</TabsTrigger>
              </TabsList>

              <TabsContent value="conteudo" className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Título profissional</Label>
                  <Input
                    value={content.headline}
                    onChange={(event) => update({ headline: event.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Resumo profissional</Label>
                  <Textarea
                    rows={5}
                    value={content.summary}
                    onChange={(event) => update({ summary: event.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">Experiências</Label>
                  {content.experiences.map((experience, index) => (
                    <div key={`${experience.company}-${index}`} className="rounded-lg border p-3">
                      <p className="text-sm font-semibold">
                        {experience.position} — {experience.company}
                      </p>
                      <Textarea
                        className="mt-2"
                        rows={4}
                        value={experience.bullets.join("\n")}
                        onChange={(event) => {
                          const experiences = [...content.experiences];
                          experiences[index] = {
                            ...experience,
                            bullets: event.target.value.split("\n"),
                          };
                          update({ experiences });
                        }}
                      />
                      <div className="mt-2 flex gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={index === 0}
                          onClick={() => {
                            const experiences = [...content.experiences];
                            const previous = experiences[index - 1]!;
                            experiences[index - 1] = experience;
                            experiences[index] = previous;
                            update({ experiences });
                          }}
                        >
                          Subir
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            update({
                              experiences: content.experiences.filter((_, item) => item !== index),
                            })
                          }
                        >
                          Remover desta versão
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Habilidades técnicas (separadas por vírgula)
                  </Label>
                  <Textarea
                    rows={2}
                    value={content.hardSkills.join(", ")}
                    onChange={(event) =>
                      update({
                        hardSkills: event.target.value.split(",").map((skill) => skill.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Habilidades comportamentais (separadas por vírgula)
                  </Label>
                  <Textarea
                    rows={2}
                    value={content.softSkills.join(", ")}
                    onChange={(event) =>
                      update({
                        softSkills: event.target.value.split(",").map((skill) => skill.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Edite apenas com informações reais suas. Não adicionamos nada que não esteja no seu
                  perfil.
                </p>
              </TabsContent>

              <TabsContent value="ats" className="mt-5 space-y-4">
                <Button onClick={() => runAts.mutate()} disabled={runAts.isPending}>
                  {runAts.isPending ? (
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                  ) : (
                    <ScanLine className="mr-1.5 size-4" />
                  )}
                  Verificar compatibilidade ATS
                </Button>

                {ats ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Progress value={ats.score} className="h-2" />
                      <span className="font-display text-lg font-semibold">{ats.score}%</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {ats.checks.map((check) => (
                        <li key={check.label} className="flex gap-2">
                          {check.status === "ok" ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                          ) : (
                            <AlertCircle className="mt-0.5 size-4 shrink-0 text-[var(--gold)]" />
                          )}
                          <span>
                            <strong>{check.label}:</strong> {check.detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {ats.keywordsMissing.length ? (
                      <div>
                        <p className="text-sm font-semibold">Palavras-chave ausentes</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {ats.keywordsMissing.map((keyword) => (
                            <Badge key={keyword} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Não encontramos essas informações no seu perfil. Inclua somente se você
                          realmente tiver essa experiência.
                        </p>
                      </div>
                    ) : null}
                    {ats.improvements.length ? (
                      <div>
                        <p className="text-sm font-semibold">Oportunidades de melhoria</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {ats.improvements.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      A verificação indica boas práticas de legibilidade. Não garante aprovação em
                      nenhum sistema de triagem.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Rode a verificação para ver estrutura, palavras-chave, experiência relevante,
                    contato e formato.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="alteracoes" className="mt-5 space-y-3">
                <h3 className="text-sm font-semibold">O que foi alterado para esta vaga?</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {(resume?.changes ?? []).length ? (
                    resume!.changes!.map((change) => <li key={change}>{change}</li>)
                  ) : (
                    <li>Nenhuma alteração registrada para esta versão.</li>
                  )}
                </ul>
                <Button variant="outline" size="sm" onClick={() => setShowOriginal(!showOriginal)}>
                  {showOriginal ? "Ver versão personalizada" : "Ver versão original"}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {RESUME_TEMPLATES.map((item) => (
              <Button
                key={item.id}
                variant={template === item.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTemplate(item.id)}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportResumeDocx(content, fileName)}
            >
              <FileDown className="mr-1.5 size-4" /> DOCX
            </Button>
          </div>
          {showOriginal ? (
            <p className="rounded-lg bg-[var(--gold-soft)] px-3 py-2 text-xs">
              Exibindo a versão original do seu perfil, sem personalização.
            </p>
          ) : null}
          <div className="overflow-hidden rounded-xl border">
            <ResumePreview content={visible} template={template} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
