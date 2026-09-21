import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Download, FileText, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useJobs, useResumes } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/resumes/")({
  head: () => ({
    meta: [
      { title: "Meus currículos — MatchCV" },
      {
        name: "description",
        content: "Todas as versões de currículo criadas para cada vaga, prontas para editar e baixar.",
      },
      { property: "og:title", content: "Meus currículos — MatchCV" },
      { property: "og:description", content: "Histórico de currículos personalizados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResumesPage,
});

function ResumesPage() {
  const { data: resumes = [], isLoading } = useResumes();
  const { data: jobs = [] } = useJobs();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["resumes", user?.id] });

  const duplicate = async (resumeId: string) => {
    const source = resumes.find((resume) => resume.id === resumeId);
    if (!source) return;
    const { error } = await supabase.from("resumes").insert({
      user_id: user!.id,
      title: `${source.title} (cópia)`,
      target_job_id: source.target_job_id,
      content: source.content as never,
      template: source.template,
      changes: source.changes,
      version: source.version + 1,
      status: "rascunho",
    });
    if (error) {
      toast.error("Não foi possível duplicar.");
      return;
    }
    toast.success("Currículo duplicado.");
    refresh();
  };

  const remove = async (resumeId: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", resumeId);
    if (error) {
      toast.error("Não foi possível excluir.");
      return;
    }
    toast.success("Currículo excluído.");
    refresh();
  };

  return (
    <AppShell
      title="Meus currículos"
      breadcrumb={[{ label: "Dashboard", to: "/dashboard" }, { label: "Meus currículos" }]}
    >
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : resumes.length ? (
        <div className="surface-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaga</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>ATS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resumes.map((resume) => {
                const job = jobs.find((item) => item.id === resume.target_job_id) ?? null;
                return (
                  <TableRow key={resume.id}>
                    <TableCell className="font-medium">{job?.title ?? resume.title}</TableCell>
                    <TableCell>{job?.company ?? "—"}</TableCell>
                    <TableCell>{new Date(resume.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>v{resume.version}</TableCell>
                    <TableCell>
                      {resume.ats_score != null ? `${resume.ats_score}%` : "Não verificado"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {resume.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Editar"
                          onClick={() =>
                            navigate({ to: "/resumes/$resumeId", params: { resumeId: resume.id } })
                          }
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Duplicar"
                          onClick={() => duplicate(resume.id)}
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Baixar"
                          onClick={() =>
                            navigate({ to: "/resumes/$resumeId", params: { resumeId: resume.id } })
                          }
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Excluir"
                          onClick={() => remove(resume.id)}
                        >
                          <Trash2 className="size-4 text-[var(--destructive)]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="Você ainda não criou currículos"
          description="Escolha uma vaga compatível e gere um currículo direcionado a partir do seu perfil."
          action={
            <Button asChild>
              <Link to="/jobs">Encontrar vagas</Link>
            </Button>
          }
        />
      )}
    </AppShell>
  );
}
