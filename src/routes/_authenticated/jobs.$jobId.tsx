import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { MatchRing } from "@/components/MatchScore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { analyzeJob, customizeResume } from "@/lib/ai.functions";
import { useAuth } from "@/lib/auth";
import { calculateMatchLocally } from "@/lib/matching";
import { useJob, useProfileBundle } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/jobs/$jobId")({
  head: () => ({
    meta: [
      { title: "Detalhes da vaga — MatchCV" },
      {
        name: "description",
        content: "Veja compatibilidade, palavras-chave e gere um currículo direcionado para a vaga.",
      },
      { property: "og:title", content: "Detalhes da vaga — MatchCV" },
      { property: "og:description", content: "Análise da vaga e geração de currículo personalizado." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JobDetail,
});

const PROCESSING_STEPS = [
  "Analisando a vaga...",
  "Comparando seu perfil...",
  "Selecionando experiências relevantes...",
  "Otimizando seu currículo...",
  "Executando verificação ATS...",
  "Currículo pronto.",
];

function JobDetail() {
  const { jobId } = Route.useParams();
  const { data: job, isLoading } = useJob(jobId);
  const bundle = useProfileBundle();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const analyzeJobFn = useServerFn(analyzeJob);
  const customizeResumeFn = useServerFn(customizeResume);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [progressStep, setProgressStep] = useState(-1);

  const analysis = useQuery({
    queryKey: ["job-analysis", jobId],
    enabled: Boolean(job),
    queryFn: () => analyzeJobFn({ data: { jobId } }),
  });

  const match = useMemo(
    () => (job ? calculateMatchLocally(job, bundle) : null),
    [job, bundle],
  );

  const generate = useMutation({
    mutationFn: async () => {
      for (let index = 0; index < 4; index += 1) {
        setProgressStep(index);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const result = await customizeResumeFn({ data: { jobId } });
      setProgressStep(4);
      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user!.id,
          title: `${job!.title} — ${job!.company}`,
          target_job_id: jobId,
          content: result.content as never,
          changes: result.changes,
          template: "classic",
          status: "rascunho",
          version: 1,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      setProgressStep(5);
      await new Promise((resolve) => setTimeout(resolve, 400));
      return data.id as string;
    },
    onSuccess: (resumeId) => {
      queryClient.invalidateQueries({ queryKey: ["resumes", user?.id] });
      setDialogOpen(false);
      setProgressStep(-1);
      navigate({ to: "/resumes/$resumeId", params: { resumeId } });
    },
    onError: (error: Error) => {
      setProgressStep(-1);
      toast.error(error.message || "Não foi possível gerar o currículo.");
    },
  });

  if (isLoading || !job || !match) {
    return (
      <AppShell title="Detalhes da vaga">
        <Skeleton className="h-64 w-full" />
      </AppShell>
    );
  }

  const data = analysis.data;
  const requirementGroups = [
    { label: "Habilidades técnicas", items: data?.hardSkills ?? [] },
    { label: "Habilidades comportamentais", items: data?.softSkills ?? [] },
    { label: "Ferramentas", items: data?.tools ?? [] },
    { label: "Idiomas", items: data?.languages ?? [] },
    { label: "Formação", items: data?.education ?? [] },
    { label: "Experiência", items: data?.experience ?? [] },
  ];

  return (
    <AppShell
      title={job.title}
      breadcrumb={[
        { label: "Encontrar vagas", to: "/jobs" },
        { label: job.company },
      ]}
      actions={
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Wand2 className="mr-1.5 size-4" /> Criar currículo
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="surface-card p-5 lg:p-6">
          <Tabs defaultValue="resumo">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="compatibilidade">Compatibilidade</TabsTrigger>
              <TabsTrigger value="palavras">Palavras-chave</TabsTrigger>
              <TabsTrigger value="curriculo">Currículo</TabsTrigger>
            </TabsList>

            <TabsContent value="resumo" className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">{job.location ?? "Local não informado"}</Badge>
                <Badge variant="secondary">{job.work_model ?? "Modelo não informado"}</Badge>
                <Badge variant="secondary">{job.seniority ?? "Senioridade não informada"}</Badge>
                {job.salary_min ? (
                  <Badge variant="secondary">
                    R$ {job.salary_min.toLocaleString("pt-BR")} – R${" "}
                    {(job.salary_max ?? job.salary_min).toLocaleString("pt-BR")}
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
              {job.responsibilities.length ? (
                <div>
                  <h3 className="text-sm font-semibold">Responsabilidades</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {job.responsibilities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {job.requirements.length ? (
                <div>
                  <h3 className="text-sm font-semibold">Requisitos</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {job.requirements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {job.source_url ? (
                <a
                  href={job.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
                >
                  Ver origem da vaga ({job.source}) <ExternalLink className="size-3.5" />
                </a>
              ) : null}
            </TabsContent>

            <TabsContent value="compatibilidade" className="mt-5 space-y-5">
              <p className="text-xs text-muted-foreground">
                O Match Score é uma estimativa de compatibilidade a partir das informações do seu
                perfil e da descrição da vaga. Ele não garante aprovação no processo.
              </p>
              <div className="space-y-3">
                {match.parts.map((part) => (
                  <div key={part.label}>
                    <div className="flex justify-between text-xs">
                      <span>{part.label}</span>
                      <span className="text-muted-foreground">{part.score}%</span>
                    </div>
                    <Progress value={part.score} className="mt-1 h-1.5" />
                  </div>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                    <CheckCircle2 className="size-4 text-[var(--success)]" /> Pontos de compatibilidade
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {match.highlights.length ? (
                      match.highlights.map((item) => <li key={item}>• {item}</li>)
                    ) : (
                      <li>Ainda não identificamos pontos fortes claros para esta vaga.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                    <AlertCircle className="size-4 text-[var(--gold)]" /> Pontos de atenção
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {match.attention.length ? (
                      match.attention.map((item) => <li key={item}>• {item}</li>)
                    ) : (
                      <li>Nenhum ponto de atenção identificado.</li>
                    )}
                  </ul>
                </div>
              </div>
              <p className="rounded-lg bg-[var(--gold-soft)] p-3 text-xs">
                Quando um requisito não aparece no seu perfil, mostramos “não encontramos essa
                informação no seu perfil”. Isso não significa que você não tenha a habilidade — pode
                apenas faltar no cadastro.
              </p>
            </TabsContent>

            <TabsContent value="palavras" className="mt-5 space-y-4">
              {analysis.isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-semibold">Palavras-chave da vaga</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(data?.keywords ?? job.keywords).map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {requirementGroups.map((group) => (
                    <div key={group.label}>
                      <h3 className="text-sm font-semibold">{group.label}</h3>
                      {group.items.length ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {group.items.map((item) => {
                            const present = match.matching.some(
                              (skill) => skill.toLowerCase() === item.toLowerCase(),
                            );
                            return (
                              <Badge
                                key={item}
                                variant={present ? "default" : "outline"}
                                className="text-xs"
                              >
                                {item}
                              </Badge>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Não identificamos exigências desse tipo na vaga.
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="curriculo" className="mt-5 space-y-4">
              <h3 className="font-display text-base font-semibold">
                O que será personalizado neste currículo
              </h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {[
                  "Título profissional alinhado ao cargo da vaga",
                  "Resumo profissional reescrito com base no seu perfil",
                  "Ordem das experiências por relevância",
                  "Descrições reorganizadas, sem alterar fatos",
                  "Palavras-chave da vaga que já existem na sua trajetória",
                  "Habilidades priorizadas e organização das seções",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--gold)]" /> {item}
                  </li>
                ))}
              </ul>
              <p className="rounded-lg border p-3 text-xs">
                Regra fundamental: usamos somente as informações que você cadastrou. Nenhuma
                experiência, empresa, certificação, tecnologia ou número é criado.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Sparkles className="mr-1.5 size-4" /> Criar currículo para esta vaga
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="surface-card h-fit p-5">
          <MatchRing score={match.score} size={104} />
          <p className="mt-4 text-xs text-muted-foreground">
            Estimativa baseada em habilidades, senioridade, cargo, experiência, formação, localização
            e modelo de trabalho.
          </p>
          <div className="mt-4 space-y-2">
            <Button className="w-full" onClick={() => setDialogOpen(true)}>
              <Wand2 className="mr-1.5 size-4" /> Criar currículo
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a
                href={job.source_url ?? "#"}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!job.source_url}
              >
                Abrir vaga na origem
              </a>
            </Button>
          </div>
        </aside>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !generate.isPending && setDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Gerar currículo para esta vaga</DialogTitle>
            <DialogDescription>
              Vamos reorganizar e destacar suas informações reais para {job.title} na {job.company}.
            </DialogDescription>
          </DialogHeader>

          {generate.isPending || progressStep >= 0 ? (
            <ul className="space-y-2 text-sm">
              {PROCESSING_STEPS.map((label, index) => (
                <li
                  key={label}
                  className={
                    index <= progressStep ? "flex items-center gap-2" : "flex items-center gap-2 opacity-40"
                  }
                >
                  {index < progressStep ? (
                    <CheckCircle2 className="size-4 text-[var(--success)]" />
                  ) : index === progressStep ? (
                    <Loader2 className="size-4 animate-spin text-[var(--gold)]" />
                  ) : (
                    <span className="size-4" />
                  )}
                  {label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              O currículo gerado fica salvo em “Meus currículos” e pode ser editado antes do envio.
            </p>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              disabled={generate.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
              {generate.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null} Gerar
              currículo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
