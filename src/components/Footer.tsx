import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-0">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-text-2">
            <span>Built with the Decart AI SDK</span>
            <Heart className="h-3.5 w-3.5 text-primary-400" fill="currentColor" />
            <span>Deploys to Vercel &amp; Netlify</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-3">
            <a
              href="https://www.decart.ai"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-text-1"
            >
              decart.ai
            </a>
            <span aria-hidden>·</span>
            <a
              href="https://github.com/DecartAI/sdk"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-text-1"
            >
              SDK
            </a>
            <span aria-hidden>·</span>
            <span>Not affiliated with Decart AI</span>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-text-3 sm:text-left">
          Your API key is stored only in your browser and is sent directly to Decart. Never share
          keys in screenshots or commits.
        </p>
      </div>
    </footer>
  );
}
