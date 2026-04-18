export type Theme = "light" | "dark";

function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) === name) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return null;
}

export function getTheme(request: Request): Theme {
  const value = parseCookie(request.headers.get("cookie"), "theme");
  if (value === "light" || value === "dark") return value;
  return "dark";
}
