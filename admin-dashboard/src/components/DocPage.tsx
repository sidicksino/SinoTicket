interface DocSection {
  title: string;
  body: string;
}

interface DocPageProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  sections: DocSection[];
  footer?: string;
}

export default function DocPage({
  eyebrow,
  title,
  subtitle,
  sections,
  footer,
}: DocPageProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-700">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
          {eyebrow}
        </p>
        <h2 className="text-3xl font-bold text-text">{title}</h2>
        <p className="max-w-3xl text-subtext">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-3xl border border-card-border bg-card p-6 shadow-sm"
          >
            <h3 className="mb-3 text-lg font-bold text-text">
              {section.title}
            </h3>
            <p className="leading-7 text-subtext">{section.body}</p>
          </section>
        ))}
      </div>

      {footer ? (
        <div className="rounded-3xl border border-card-border bg-primary/5 p-5 text-sm font-medium text-subtext">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
