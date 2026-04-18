import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "react-router";
import type { LinksFunction, MetaFunction } from "react-router";
import { Navbar } from "~/components/navbar";
import { Footer } from "~/components/footer";
import { getAuthUser } from "./lib/auth";
import { I18nProvider, getLang } from "./lib/i18n";
import { getTheme } from "./lib/theme";
import "./app.css";

const THEME_COLOR_DARK = "#171717";
const THEME_COLOR_LIGHT = "#ffffff";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", sizes: "any" },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/favicon-16x16.png",
  },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
];

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const theme = data?.theme ?? "dark";
  return [
    {
      name: "theme-color",
      content: theme === "dark" ? THEME_COLOR_DARK : THEME_COLOR_LIGHT,
    },
  ];
};

export async function loader({
  request,
  context,
}: {
  request: Request;
  context: { cloudflare?: { env?: { API_URL?: string } } };
}) {
  const apiUrl = context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";
  const user = await getAuthUser(request, apiUrl);
  const lang = getLang(request);
  const theme = getTheme(request);
  return { user, apiUrl, lang, theme };
}

const DASHBOARD_PREFIXES = ["/dashboard", "/projects", "/settings", "/notifications"];

function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default function Root() {
  const { user, apiUrl, lang, theme } = useLoaderData<typeof loader>();
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith("/auth");
  const isDashboard = isDashboardRoute(location.pathname);
  const showShell = !isAuthRoute && !isDashboard;

  return (
    <html lang={lang} className={theme === "dark" ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>1elat</title>
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <I18nProvider lang={lang}>
          {showShell && <Navbar user={user} apiUrl={apiUrl} theme={theme} />}
          <main>
            <Outlet />
          </main>
          {showShell && <Footer />}
        </I18nProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
