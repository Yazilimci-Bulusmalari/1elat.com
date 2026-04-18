import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

function GithubIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.9-.39.99 0 1.98.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12 24 5.65 18.85.5 12 .5z" />
    </svg>
  );
}

function XIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}
import { useT } from "~/lib/i18n";

export function Footer(): React.ReactElement {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background mt-24">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {t.footer.newsletter.title}
              <ArrowRight className="h-7 w-7 text-accent-brand" />
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              {t.footer.newsletter.description}
            </p>
          </div>

          <form className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="email"
              required
              placeholder={t.footer.newsletter.placeholder}
              className="h-12 flex-1 rounded-md border border-input bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-accent-brand"
            />
            <button
              type="submit"
              className="h-12 rounded-md bg-accent-brand px-6 text-sm font-semibold text-accent-brand-foreground hover:bg-accent-brand/90"
            >
              {t.footer.newsletter.subscribe}
            </button>
          </form>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <Link to="/" className="inline-block">
              <span className="rounded-md border-2 border-accent-brand bg-accent-brand/10 px-3 py-1.5 text-sm font-bold tracking-wide text-accent-brand">
                1ELAT
              </span>
            </Link>
            <p className="mt-6 max-w-md text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {t.footer.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-accent-brand">
                {t.footer.columns.product}
              </h3>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <Link to="/" className="hover:text-accent-brand">
                    {t.footer.links.about}
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-accent-brand">
                    {t.footer.links.contact}
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-accent-brand">
                    {t.footer.links.privacy}
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-accent-brand">
                    {t.footer.links.terms}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-accent-brand">
                {t.footer.columns.community}
              </h3>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <Link to="/explore/projects" className="hover:text-accent-brand">
                    {t.footer.links.explore}
                  </Link>
                </li>
                <li>
                  <Link to="/explore/developers" className="hover:text-accent-brand">
                    {t.footer.links.developers}
                  </Link>
                </li>
                <li>
                  <Link to="/explore/projects" className="hover:text-accent-brand">
                    {t.footer.links.projects}
                  </Link>
                </li>
                <li>
                  <Link to="/explore/developers" className="hover:text-accent-brand">
                    {t.footer.links.community}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {year} 1elat. {t.footer.rights}
          </p>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-brand text-accent-brand-foreground hover:bg-accent-brand/90"
            >
              <GithubIcon />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="X"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-brand text-accent-brand-foreground hover:bg-accent-brand/90"
            >
              <XIcon />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-brand text-accent-brand-foreground hover:bg-accent-brand/90"
            >
              <LinkedinIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
