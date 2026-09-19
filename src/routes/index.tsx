import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  FileSearch,
  FileText,
  History,
  Kanban,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchRing } from "@/components/MatchScore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MatchCV — seu currículo, a vaga certa, um match mais inteligente" },
      {
        name: "description",
        content:
          "Encontre vagas compatíveis com seu perfil, entenda seu Match Score e gere currículos ATS-friendly personalizados para cada vaga, sem inventar experiências.",
      },
      { property: "og:title", content: "MatchCV — matchmaking de vagas e currículos ATS" },
      {
        property: "og:description",
        content:
          "Perfil profissional, match com vagas, análise da descrição e currículo personalizado em minutos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { title: "Crie seu perfil profissional", description: "Uma vez só: experiências, formação, skills e currículo." },
  { title: "Encontre vagas compatíveis", description: "Filtros por cargo, localização, modelo e salário." },
  { title: "Veja seu Match Score", description: "Entenda ponto por ponto por que existe aquela compatibilidade." },
  { title: "Personalize seu currículo", description: "A IA reorganiza e destaca o que você já tem." },
  { title: "Baixe e candidate-se", description: "PDF ou DOCX prontos para envio, com verificação ATS." },
];

const BENEFITS = [
  { icon: Target, title: "Match inteligente", description: "Compatibilidade estimada entre seu perfil e cada vaga." },
  { icon: FileText, title: "Currículos personalizados", description: "Uma versão pensada para cada oportunidade." },
  { icon: ScanLine, title: "Otimização ATS", description: "Estrutura limpa, legível por sistemas de triagem." },
  { icon: FileSearch, title: "Análise de palavras-chave", description: "Veja os termos que a vaga realmente pede." },
  { icon: History, title: "Histórico de currículos", description: "Todas as versões salvas e prontas para reuso." },
  { icon: Kanban, title: "Candidaturas organizadas", description: "Kanban de salvas, aplicadas, entrevistas e ofertas." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-[var(--primary)] text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-lg font-semibold">MatchCV</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth" search={{ mode: "signup" }}>
                Criar meu perfil
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 lg:grid-cols-2 lg:py-24">
        <div>
          <Badge variant="outline" className="border-[var(--gold)]/50 bg-[var(--gold-soft)] text-xs">
            Match de vagas + currículo inteligente
          </Badge>
          <h1 className="mt-5 font-display text-4xl leading-[1.08] font-semibold sm:text-5xl">
            Seu currículo. A vaga certa.{" "}
            <span className="text-[var(--primary)]">Um match mais inteligente.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground">
            Encontre vagas compatíveis com seu perfil e crie currículos personalizados para cada
            oportunidade — sem inventar experiências.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "signup" }}>
                Criar meu perfil <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#como-funciona">Como funciona</a>
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-[var(--success)]" />
            A IA nunca cria experiências, cargos ou certificações que você não tenha informado.
          </p>
        </div>

        <div className="surface-card p-5 lg:p-6">
          <div className="flex items-center justify-between gap-4 rounded-lg bg-[var(--burgundy-soft)] p-4">
            <div>
              <p className="text-xs text-muted-foreground">Analista de Dados • Fintech Clarity</p>
              <p className="font-display text-lg font-semibold">Remoto • Pleno</p>
            </div>
            <MatchRing score={87} size={78} label={false} />
          </div>

          <ol className="mt-5 space-y-3">
            {[
              { icon: BadgeCheck, label: "Perfil profissional completo" },
              { icon: Target, label: "Match calculado com a vaga" },
              { icon: FileSearch, label: "Análise da descrição da vaga" },
              { icon: FileText, label: "Currículo personalizado gerado" },
              { icon: BarChart3, label: "Verificação ATS e candidatura" },
            ].map(({ icon: Icon, label }, index) => (
              <li key={label} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                <span className="flex size-7 items-center justify-center rounded-full bg-[var(--gold-soft)] text-xs font-semibold text-[var(--primary)]">
                  {index + 1}
                </span>
                <Icon className="size-4 text-[var(--gold)]" />
                <span className="text-sm">{label}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="como-funciona" className="border-y bg-card py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-semibold">Como funciona</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Cinco passos simples: você sempre sabe onde está e qual é o próximo passo.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, index) => (
              <div key={step.title} className="surface-card p-4">
                <span className="font-display text-2xl text-[var(--gold)]">0{index + 1}</span>
                <h3 className="mt-2 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-semibold">Benefícios</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="surface-card p-5 transition-shadow hover:shadow-[var(--shadow-lift)]">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--burgundy-soft)] text-[var(--primary)]">
                <Icon className="size-4" />
              </span>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-burgundy-gradient py-16 text-[color:var(--sidebar-foreground)]">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <ShieldCheck className="mx-auto size-8 text-[var(--gold)]" />
          <h2 className="mt-4 font-display text-3xl font-semibold">
            A IA não inventa informações profissionais
          </h2>
          <p className="mt-4 text-sm opacity-85">
            Nosso objetivo não é criar um currículo enganoso. A IA apenas reorganiza, resume e destaca
            o que você informou, usando palavras-chave da vaga somente quando elas realmente combinam
            com a sua experiência. Quando algo não aparece no seu perfil, dizemos exatamente isso:
            “não encontramos essa informação no seu perfil”.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="font-display text-3xl font-semibold">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="mt-6">
          <AccordionItem value="score">
            <AccordionTrigger>O Match Score garante a vaga?</AccordionTrigger>
            <AccordionContent>
              Não. O score é uma estimativa de compatibilidade calculada a partir das informações
              disponíveis no seu perfil e na descrição da vaga.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="ats">
            <AccordionTrigger>O currículo passa em qualquer ATS?</AccordionTrigger>
            <AccordionContent>
              Usamos estruturas legíveis por sistemas de triagem e mostramos oportunidades de
              melhoria, mas não prometemos aprovação em nenhum ATS específico.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="vagas">
            <AccordionTrigger>De onde vêm as vagas?</AccordionTrigger>
            <AccordionContent>
              Cada vaga guarda sua origem e link. Hoje trabalhamos com uma base de demonstração e a
              arquitetura já está preparada para conectar fontes externas de vagas.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} MatchCV</span>
          <Link to="/auth" className="hover:text-foreground">
            Criar meu perfil
          </Link>
        </div>
      </footer>
    </div>
  );
}
