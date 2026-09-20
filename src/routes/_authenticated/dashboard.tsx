import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { ArrowRight, Briefcase, FileText, Kanban, Target } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/AppShell";
import { MatchBadge } from "@/components/MatchScore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateMatchLocally, computeProfileCompletion } from "@/lib/matching";
import { APPLICATION_STAGES } from "@/lib/types";
import { useApplications, useJobs, useProfileBundle, useResumes } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MatchCV" },
      { name: "description", content: "Acompanhe seu perfil, vagas compatíveis, currículos e candidaturas." },
      { property: "og:title", content: "Dashboard — MatchCV" },
      { property: "og:description", content: "Seu painel de matches, currículos e candidaturas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const bundle = useProfileBundle();
  const { data: jobs = [], isLoading: loadingJobs } = useJobs();
  const { data: resumes = [] } = useResumes();
  const { data: applications = [] } = useApplications();
  const navigate = useNavigate();

  useEffect(() => {
    if (!bundle.isLoading && bundle.profile && !bundle.profile.onboarding_completed) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [bundle.isLoading, bundle.profile, navigate]);

  const completion = useMemo(() => computeProfileCompletion(bundle), [bundle]);

  const matches = useMemo(() => {
    if (!bundle.profile) return [];
    return jobs
      .map((job) => ({ job, match: calculateMatchLocally(job, bundle) }))
      .sort((a, b) => b.match.score - a.match.score);
  }, [jobs, bundle]);

  const compatible = matches.filter((item) => item.match.score >= 60).length;

  const stageCounts = APPLICATION_STAGES.map((stage) => ({
    ...stage,
    count: applications.filter((application) => application.status === stage.id).length,
  }));

  const chartData = useMemo(() => {
    const buckets = new Map<string, number>();
    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date();
      date.setMonth(date.getMonth() - index);
      buckets.set(date.toLocaleDateString("pt-BR", { month: "short" }), 0);
    }
    applications.forEach((application) => {
      const key = new Date(application.created_at).toLocaleDateString("pt-BR", { month: "short" });
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    return [...buckets].map(([month, total]) => ({ month, total }));
  }, [applications]);

  const skills = bundle.skills.filter((skill) => skill.type === "hard").slice(0, 6);

  return (
    <AppShell title={`Olá, ${bundle.profile?.name?.split(" ")[0] ?? "candidato"}`}>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Seu perfil</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/profile">Editar</Link>
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Completude do perfil</p>
          <div className="mt-2 flex items-center gap-3">
            <Progress value={completion} className="h-2" />
            <span className="font-display text-sm font-semibold">{completion}%</span>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Cargo-alvo</dt>
              <dd className="text-right font-medium">
                {bundle.profile?.target_role || "Não informado"}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Senioridade</dt>
              <dd className="text-right font-medium capitalize">
                {bundle.profile?.seniority || "Não informada"}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {skills.length ? (
              skills.map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-xs">
                  {skill.name}
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                Não encontramos habilidades técnicas no seu perfil.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <StatCard
            icon={Target}
            label="Vagas compatíveis"
            value={loadingJobs ? "…" : `${compatible}`}
            hint={`de ${jobs.length} vagas analisadas`}
            to="/jobs"
          />
          <StatCard
            icon={FileText}
            label="Currículos personalizados"
            value={`${resumes.length}`}
            hint="versões salvas"
            to="/resumes"
          />
          <StatCard
            icon={Kanban}
            label="Candidaturas"
            value={`${applications.length}`}
            hint={stageCounts.map((stage) => `${stage.label}: ${stage.count}`).join(" • ")}
            to="/applications"
          />
          <StatCard
            icon={Briefcase}
            label="Entrevistas"
            value={`${stageCounts.find((stage) => stage.id === "interview")?.count ?? 0}`}
            hint="processos em andamento"
            to="/applications"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <h2 className="font-display text-base font-semibold">Melhores matches para você</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            O Match Score é uma estimativa de compatibilidade, não uma garantia de vaga.
          </p>
          <div className="mt-4 space-y-2">
            {loadingJobs ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : (
              matches.slice(0, 4).map(({ job, match }) => (
                <Link
                  key={job.id}
                  to="/jobs/$jobId"
                  params={{ jobId: job.id }}
                  className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{job.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {job.company} • {job.location ?? "Local não informado"}
                    </p>
                  </div>
                  <MatchBadge score={match.score} />
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="font-display text-base font-semibold">Evolução das candidaturas</h2>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="var(--gold)"
                  strokeWidth={2}
                  fill="url(#fillGold)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  to,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  hint: string;
  to: "/jobs" | "/resumes" | "/applications";
}) {
  return (
    <Link
      to={to}
      className="surface-card group flex flex-col justify-between p-5 transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--burgundy-soft)] text-[var(--primary)]">
          <Icon className="size-4" />
        </span>
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-4 font-display text-3xl font-semibold">{value}</p>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}
