import type { ResumeContent } from "@/lib/types";
import { cn } from "@/lib/utils";

const TEMPLATES = {
  classic: {
    heading: "font-display text-[1.6rem]",
    section: "uppercase tracking-[0.14em] text-[0.7rem] font-semibold border-b pb-1",
    body: "font-serif",
  },
  modern: {
    heading: "text-[1.6rem] font-semibold",
    section:
      "uppercase tracking-[0.18em] text-[0.68rem] font-bold text-[var(--primary)] border-b pb-1",
    body: "",
  },
  executive: {
    heading: "font-display text-[1.75rem] font-semibold",
    section:
      "uppercase tracking-[0.2em] text-[0.68rem] font-semibold text-[var(--primary)] border-b-2 pb-1",
    body: "font-serif",
  },
} as const;

export const RESUME_TEMPLATES = [
  { id: "classic", label: "Classic ATS" },
  { id: "modern", label: "Modern ATS" },
  { id: "executive", label: "Executive ATS" },
] as const;

export function ResumePreview({
  content,
  template = "classic",
  id = "resume-print-area",
}: {
  content: ResumeContent;
  template?: keyof typeof TEMPLATES;
  id?: string;
}) {
  const style = TEMPLATES[template] ?? TEMPLATES.classic;
  const contactLine = [
    content.personal.email,
    content.personal.phone,
    content.personal.location,
  ].filter(Boolean);
  const linkLine = [
    content.personal.linkedin,
    content.personal.portfolio,
    content.personal.github,
  ].filter(Boolean);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mt-5">
      <h2 className={cn(style.section, "text-foreground")}>{title}</h2>
      <div className="mt-2 space-y-3 text-[0.84rem] leading-relaxed">{children}</div>
    </section>
  );

  return (
    <div
      id={id}
      className={cn("print-area bg-white px-8 py-9 text-[#1F1F1F] shadow-none", style.body)}
    >
      <header>
        <h1 className={style.heading}>{content.personal.name || "Seu nome"}</h1>
        {content.headline ? (
          <p className="mt-0.5 text-[0.95rem] text-[#4A0404]">{content.headline}</p>
        ) : null}
        {contactLine.length ? (
          <p className="mt-2 text-[0.78rem] text-[#4b4b4b]">{contactLine.join(" • ")}</p>
        ) : null}
        {linkLine.length ? (
          <p className="text-[0.78rem] text-[#4b4b4b]">{linkLine.join(" • ")}</p>
        ) : null}
      </header>

      {content.summary ? (
        <Section title="Resumo profissional">
          <p>{content.summary}</p>
        </Section>
      ) : null}

      {content.experiences.length ? (
        <Section title="Experiência profissional">
          {content.experiences.map((experience, index) => (
            <div key={`${experience.company}-${index}`}>
              <h3 className="text-[0.9rem] font-semibold">
                {experience.position} — {experience.company}
              </h3>
              <p className="text-[0.76rem] text-[#5c5c5c]">
                {[experience.period, experience.location].filter(Boolean).join(" | ")}
              </p>
              {experience.bullets.length ? (
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {experience.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </Section>
      ) : null}

      {content.education.length ? (
        <Section title="Formação acadêmica">
          {content.education.map((item, index) => (
            <div key={index}>
              <p className="font-semibold">{[item.degree, item.course].filter(Boolean).join(" ")}</p>
              <p className="text-[0.78rem] text-[#5c5c5c]">
                {[item.institution, item.period].filter(Boolean).join(" • ")}
              </p>
            </div>
          ))}
        </Section>
      ) : null}

      {content.hardSkills.length || content.softSkills.length ? (
        <Section title="Habilidades">
          {content.hardSkills.length ? (
            <p>
              <strong>Técnicas:</strong> {content.hardSkills.join(", ")}
            </p>
          ) : null}
          {content.softSkills.length ? (
            <p>
              <strong>Comportamentais:</strong> {content.softSkills.join(", ")}
            </p>
          ) : null}
        </Section>
      ) : null}

      {content.languages.length ? (
        <Section title="Idiomas">
          <p>
            {content.languages
              .map((language) => [language.language, language.level].filter(Boolean).join(" — "))
              .join(" • ")}
          </p>
        </Section>
      ) : null}

      {content.certifications.length ? (
        <Section title="Certificações">
          {content.certifications.map((certification, index) => (
            <p key={index}>
              {[certification.name, certification.issuer, certification.year]
                .filter(Boolean)
                .join(" — ")}
            </p>
          ))}
        </Section>
      ) : null}
    </div>
  );
}
