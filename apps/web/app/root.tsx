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
import { getAuthUser } from "./lib/auth";
import "./app.css";

/** Matches `.dark` `--background` oklch(0.145 0 0) for install / browser chrome. */
const THEME_COLOR = "#171717";

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

export const meta: MetaFunction = () => [
  { name: "theme-color", content: THEME_COLOR },
];

export async function loader({ request, context }: { request: Request; context: { cloudflare?: { env?: { API_URL?: string } } } }) {
  const apiUrl = context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";
  const user = await getAuthUser(request, apiUrl);
  return { user, apiUrl };
}

export default function Root() {
  const { user, apiUrl } = useLoaderData<typeof loader>();
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith("/auth");

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>1elat</title>
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {!isAuthRoute && <Navbar user={user} apiUrl={apiUrl} />}
        <main>
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
