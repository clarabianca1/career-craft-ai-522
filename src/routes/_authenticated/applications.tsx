import { Link, createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink, Kanban, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useApplications, useJobs, useResumes } from "@/lib/queries";
import { APPLICATION_STAGES, type ApplicationStage } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [
      { title: "Minhas candidaturas — MatchCV" },
      {
        name: "description",
        content: "Acompanhe cada candidatura em um Kanban: salvas, aplicadas, entrevista, oferta e encerradas.",
      },
      { property: "og:title", content: "Minhas candidaturas — MatchCV" },
      { property: "og:description", content: "Kanban de acompanhamento das suas candidaturas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { data: applications = [], isLoading } = useApplications();
  const { data: jobs = [] } = useJobs();
  const { data: resumes = [] } = useResumes();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["applications", user?.id] });

  const move = async (applicationId: string, status: ApplicationStage) => {
    const { error } = await supabase
      .from("applications")
      .update(
        status === "applied"
          ? { status, applied_at: new Date().toISOString() }
          : { status },
      )
      .eq("id", applicationId);
    if (error) {
      toast.error("Não foi possível mover a candidatura.");
      return;
    }
    refresh();
  };

  const saveNotes = async (applicationId: string, notes: string) => {
    await supabase.from("applications").update({ notes }).eq("id", applicationId);
    setNotesOpen(null);
    refresh();
    toast.success("Observações salvas.");
  };

  const remove = async (applicationId: string) => {
    await supabase.from("applications").delete().eq("id", applicationId);
    refresh();
  };

  if (isLoading) {
    return (
      <AppShell title="Minhas candidaturas">
        <Skeleton className="h-64 w-full" />
      </AppShell>
    );
  }

  if (!applications.length) {
    return (
      <AppShell
        title="Minhas candidaturas"
        breadcrumb={[{ label: "Dashboard", to: "/dashboard" }, { label: "Minhas candidaturas" }]}
      >
        <EmptyState
          icon={Kanban}
          title="Nenhuma candidatura registrada"
          description="Salve uma vaga interessante e acompanhe cada etapa do processo por aqui."
          action={
            <Button asChild>
              <Link to="/jobs">Encontrar vagas</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Minhas candidaturas"
      breadcrumb={[{ label: "Dashboard", to: "/dashboard" }, { label: "Minhas candidaturas" }]}
    >
      <p className="text-xs text-muted-foreground">
        Arraste os cartões entre as colunas para atualizar o status.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {APPLICATION_STAGES.map((stage) => {
          const items = applications.filter((application) => application.status === stage.id);
          return (
            <section
              key={stage.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragging) move(dragging, stage.id);
                setDragging(null);
              }}
              className="surface-card flex min-h-40 flex-col gap-2 p-3"
            >
              <header className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{stage.label}</h2>
                <Badge variant="secondary">{items.length}</Badge>
              </header>

              {items.map((application) => {
                const job = jobs.find((item) => item.id === application.job_id);
                const resume = resumes.find((item) => item.id === application.resume_id);
                return (
                  <article
                    key={application.id}
                    draggable
                    onDragStart={() => setDragging(application.id)}
                    className="cursor-grab rounded-lg border bg-card p-3 active:cursor-grabbing"
                  >
                    <p className="text-sm font-semibold">{job?.title ?? "Vaga salva"}</p>
                    <p className="text-xs text-muted-foreground">{job?.company ?? "—"}</p>
                    <p className="mt-1 text-[0.7rem] text-muted-foreground">
                      {new Date(application.created_at).toLocaleDateString("pt-BR")}
                      {resume ? ` • ${resume.title}` : ""}
                    </p>
                    {application.notes && notesOpen !== application.id ? (
                      <p className="mt-2 text-xs italic text-muted-foreground">{application.notes}</p>
                    ) : null}
                    {notesOpen === application.id ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          rows={3}
                          defaultValue={application.notes ?? ""}
                          id={`notes-${application.id}`}
                        />
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const element = document.getElementById(
                              `notes-${application.id}`,
                            ) as HTMLTextAreaElement | null;
                            saveNotes(application.id, element?.value ?? "");
                          }}
                        >
                          Salvar
                        </Button>
                      </div>
                    ) : null}
                    <div className="mt-2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setNotesOpen(notesOpen === application.id ? null : application.id)}
                      >
                        Observações
                      </Button>
                      {application.job_url || job?.source_url ? (
                        <Button variant="ghost" size="icon" className="size-7" asChild>
                          <a
                            href={application.job_url ?? job?.source_url ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Abrir vaga"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label="Excluir"
                        onClick={() => remove(application.id)}
                      >
                        <Trash2 className="size-3.5 text-[var(--destructive)]" />
                      </Button>
                    </div>
                  </article>
                );
              })}
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
