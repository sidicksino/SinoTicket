import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Panel({ title, subtitle, action, children }: PanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.01] p-6 backdrop-blur-xl liquid-glass">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-heading italic text-white tracking-tight leading-none mb-2">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-sm font-body font-light text-white/50">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </header>
      <div className="font-body text-white/70">
        {children}
      </div>
    </section>
  );
}
