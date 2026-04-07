import type { LegalSection } from "@/lib/legal-documents";

type LegalDocumentProps = {
  eyebrow?: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  compact?: boolean;
};

function Section({ title, paragraphs }: LegalSection) {
  return (
    <section className="space-y-4 rounded-xl border border-[#E5E7EB] bg-white p-8">
      <h2 className="text-3xl font-semibold">{title}</h2>
      <div className="space-y-4 text-lg leading-8 text-[#4B5563]">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export function LegalDocument({
  eyebrow = "Legal",
  title,
  intro,
  sections,
  compact = false
}: LegalDocumentProps) {
  const wrapperClassName = compact ? "space-y-6" : "mx-auto max-w-[800px] space-y-8";
  const headerTitleClassName = compact ? "text-3xl font-semibold" : "text-4xl font-semibold";

  return (
    <div className={wrapperClassName}>
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1B4332]">{eyebrow}</p>
        <h1 className={headerTitleClassName}>{title}</h1>
        <p className="text-lg leading-8 text-[#4B5563]">{intro}</p>
      </header>

      {sections.map((section) => (
        <Section key={section.title} {...section} />
      ))}
    </div>
  );
}
