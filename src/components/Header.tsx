import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-0/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent shadow-glow">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-text-0">
              Decart Live Studio
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-3">
              Realtime AI Video
            </span>
          </div>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="https://www.decart.ai" label="Decart AI" />
          <NavLink
            href="https://www.decart.ai/publications/lucy-2-5-raising-the-bar-for-live-ai"
            label="Lucy 2.5"
          />
          <NavLink href="https://github.com/DecartAI/sdk" label="SDK Docs" />
        </nav>

        <a
          href="https://github.com/gentleman8643/my-ai-app"
          target="_blank"
          rel="noreferrer"
          className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-1 transition-colors hover:border-border-strong hover:text-text-0 focus-ring"
        >
          <span className="hidden sm:inline">Repo</span>
        </a>
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-lg px-3 py-2 text-sm font-medium text-text-1 transition-colors hover:bg-surface hover:text-text-0 focus-ring"
    >
      {label}
    </a>
  );
}
