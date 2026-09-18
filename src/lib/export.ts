import type { ResumeContent } from "./types";
import { resumeToPlainText } from "./resume";

/** Abre o diálogo de impressão do navegador para gerar o PDF do currículo. */
export function exportResumePdf(printAreaId: string, fileName: string) {
  const node = document.getElementById(printAreaId);
  if (!node) return;
  const win = window.open("", "_blank", "width=820,height=1000");
  if (!win) return;
  win.document.write(`<!doctype html><html><head><title>${fileName}</title>
  <style>
    @page { margin: 18mm 16mm; }
    body { font-family: Georgia, "Times New Roman", serif; color: #1F1F1F; line-height: 1.45; font-size: 11.5pt; }
    h1 { font-size: 20pt; margin: 0 0 2px; }
    h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: .08em; border-bottom: 1px solid #999; padding-bottom: 3px; margin: 18px 0 8px; }
    h3 { font-size: 11.5pt; margin: 10px 0 2px; }
    ul { margin: 4px 0 0 18px; padding: 0; }
    li { margin-bottom: 3px; }
    p { margin: 0 0 6px; }
    .meta { color: #444; font-size: 10pt; }
    .sans { font-family: Helvetica, Arial, sans-serif; }
  </style></head><body>${node.innerHTML}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}

/** Exporta um DOCX simples (HTML embalado em Word), aceito por ATS. */
export function exportResumeDocx(content: ResumeContent, fileName: string) {
  const escape = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const section = (title: string, body: string) =>
    body ? `<h2>${escape(title)}</h2>${body}` : "";

  const html = `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
  <head><meta charset="utf-8"><title>${escape(fileName)}</title></head><body>
  <h1>${escape(content.personal.name)}</h1>
  <p>${escape(content.headline)}</p>
  <p>${escape(
    [content.personal.email, content.personal.phone, content.personal.location]
      .filter(Boolean)
      .join(" | "),
  )}</p>
  <p>${escape(
    [content.personal.linkedin, content.personal.portfolio, content.personal.github]
      .filter(Boolean)
      .join(" | "),
  )}</p>
  ${section("Resumo profissional", content.summary ? `<p>${escape(content.summary)}</p>` : "")}
  ${section(
    "Experiência profissional",
    content.experiences
      .map(
        (experience) =>
          `<h3>${escape(experience.position)} — ${escape(experience.company)}</h3>
           <p>${escape([experience.period, experience.location].filter(Boolean).join(" | "))}</p>
           <ul>${experience.bullets.map((bullet) => `<li>${escape(bullet)}</li>`).join("")}</ul>`,
      )
      .join(""),
  )}
  ${section(
    "Formação acadêmica",
    content.education
      .map(
        (item) =>
          `<p><strong>${escape([item.degree, item.course].filter(Boolean).join(" "))}</strong><br>${escape(
            item.institution,
          )} — ${escape(item.period)}</p>`,
      )
      .join(""),
  )}
  ${section(
    "Habilidades",
    [
      content.hardSkills.length ? `<p>Técnicas: ${escape(content.hardSkills.join(", "))}</p>` : "",
      content.softSkills.length
        ? `<p>Comportamentais: ${escape(content.softSkills.join(", "))}</p>`
        : "",
    ].join(""),
  )}
  ${section(
    "Idiomas",
    content.languages
      .map((language) => `<p>${escape(language.language)} — ${escape(language.level)}</p>`)
      .join(""),
  )}
  ${section(
    "Certificações",
    content.certifications
      .map(
        (certification) =>
          `<p>${escape([certification.name, certification.issuer, certification.year].filter(Boolean).join(" — "))}</p>`,
      )
      .join(""),
  )}
  </body></html>`;

  downloadBlob(new Blob([html], { type: "application/msword" }), `${fileName}.doc`);
}

export function exportResumeTxt(content: ResumeContent, fileName: string) {
  downloadBlob(
    new Blob([resumeToPlainText(content)], { type: "text/plain;charset=utf-8" }),
    `${fileName}.txt`,
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
