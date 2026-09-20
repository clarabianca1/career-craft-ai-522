import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Briefcase, MapPin, SlidersHorizontal, Wallet } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { MatchRing } from "@/components/MatchScore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { calculateMatchLocally } from "@/lib/matching";
import { useJobs, useProfileBundle } from "@/lib/queries";
import { SENIORITY_OPTIONS, WORK_MODEL_OPTIONS } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/jobs/")({
  head: () => ({
    meta: [
      { title: "Encontrar vagas — MatchCV" },
      {
        name: "description",
        content: "Filtre vagas por cargo, localização, modelo, salário e Match Score mínimo.",
      },
      { property: "og:title", content: "Encontrar vagas — MatchCV" },
      { property: "og:description", content: "Vagas com estimativa de compatibilidade com seu perfil." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JobsPage,
});

const DATE_OPTIONS = [
  { value: 0, label: "Qualquer data" },
  { value: 7, label: "Últimos 7 dias" },
  { value: 30, label: "Últimos 30 dias" },
];

function JobsPage() {
  const bundle = useProfileBundle();
  const { data: jobs = [], isLoading } = useJobs();

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [workModels, setWorkModels] = useState<string[]>([]);
  const [seniorities, setSeniorities] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState(0);
  const [minScore, setMinScore] = useState(0);
  const [days, setDays] = useState(0);

  const toggle = (list: string[], value: string, setter: (next: string[]) => void) =>
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const results = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    return jobs
      .map((job) => ({ job, match: calculateMatchLocally(job, bundle) }))
      .filter(({ job, match }) => {
        if (
          term &&
          ![job.title, job.company, job.description ?? "", job.keywords.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(term)
        )
          return false;
        if (location && !(job.location ?? "").toLowerCase().includes(location.toLowerCase()))
          return false;
        if (company && !job.company.toLowerCase().includes(company.toLowerCase())) return false;
        if (workModels.length && !workModels.includes(job.work_model ?? "")) return false;
        if (seniorities.length && !seniorities.includes(job.seniority ?? "")) return false;
        if (minSalary && (job.salary_max ?? job.salary_min ?? 0) < minSalary) return false;
        if (minScore && match.score < minScore) return false;
        if (days) {
          const limit = Date.now() - days * 86400000;
          if (new Date(job.published_at).getTime() < limit) return false;
        }
        return true;
      })
      .sort((a, b) => b.match.score - a.match.score);
  }, [jobs, bundle, keyword, location, company, workModels, seniorities, minSalary, minScore, days]);

  const filters = (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Cargo ou palavra-chave</Label>
        <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Localização</Label>
        <Input value={location} onChange={(event) => setLocation(event.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Empresa</Label>
        <Input value={company} onChange={(event) => setCompany(event.target.value)} />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs text-muted-foreground">Modelo de trabalho</legend>
        {WORK_MODEL_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={workModels.includes(option.value)}
              onCheckedChange={() => toggle(workModels, option.value, setWorkModels)}
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs text-muted-foreground">Senioridade</legend>
        {SENIORITY_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={seniorities.includes(option.value)}
              onCheckedChange={() => toggle(seniorities, option.value, setSeniorities)}
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          Salário mínimo: R$ {minSalary.toLocaleString("pt-BR")}
        </Label>
        <Slider
          value={[minSalary]}
          max={25000}
          step={1000}
          onValueChange={(value) => setMinSalary(value[0] ?? 0)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Match Score mínimo: {minScore}%</Label>
        <Slider
          value={[minScore]}
          max={100}
          step={5}
          onValueChange={(value) => setMinScore(value[0] ?? 0)}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs text-muted-foreground">Data de publicação</legend>
        {DATE_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <Checkbox checked={days === option.value} onCheckedChange={() => setDays(option.value)} />
            {option.label}
          </label>
        ))}
      </fieldset>
    </div>
  );

  return (
    <AppShell
      title="Encontrar vagas"
      breadcrumb={[{ label: "Dashboard", to: "/dashboard" }, { label: "Encontrar vagas" }]}
      actions={
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <SlidersHorizontal className="mr-1.5 size-4" /> Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto px-5 py-6">
            <SheetTitle className="font-display">Filtros</SheetTitle>
            <div className="mt-5">{filters}</div>
          </SheetContent>
        </Sheet>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="surface-card hidden h-fit p-5 lg:block">
          <h2 className="font-display text-sm font-semibold">Filtros</h2>
          <div className="mt-4">{filters}</div>
        </aside>

        <div>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Carregando vagas…" : `${results.length} vagas encontradas`}
          </p>

          <div className="mt-4 space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
            ) : results.length ? (
              results.map(({ job, match }) => (
                <Link
                  key={job.id}
                  to="/jobs/$jobId"
                  params={{ jobId: job.id }}
                  className="surface-card flex flex-col gap-4 p-5 transition-shadow hover:shadow-[var(--shadow-lift)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-semibold">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" /> {job.location ?? "Não informado"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="size-3.5" /> {job.work_model ?? "Não informado"}
                      </span>
                      {job.salary_min ? (
                        <span className="flex items-center gap-1">
                          <Wallet className="size-3.5" /> R${" "}
                          {job.salary_min.toLocaleString("pt-BR")} – R${" "}
                          {(job.salary_max ?? job.salary_min).toLocaleString("pt-BR")}
                        </span>
                      ) : null}
                      <span>
                        {new Date(job.published_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.keywords.slice(0, 5).map((keywordItem) => (
                        <Badge key={keywordItem} variant="secondary" className="text-xs">
                          {keywordItem}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <MatchRing score={match.score} />
                </Link>
              ))
            ) : (
              <EmptyState
                icon={Briefcase}
                title="Nenhuma vaga com esses filtros"
                description="Reduza o Match Score mínimo ou limpe alguns filtros para ver mais oportunidades."
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
