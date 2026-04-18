import { useState, useEffect, useCallback } from "react";
import { Outlet, redirect, useLoaderData, useLocation } from "react-router";
import { Menu } from "lucide-react";
import { getAuthUser } from "../lib/auth";
import { getTheme } from "../lib/theme";
import { getLang } from "../lib/i18n";
import { DashboardSidebar } from "~/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "~/components/layout/dashboard-topbar";
import { Button } from "~/components/ui/button";

export async function loader({
  request,
  context,
}: {
  request: Request;
  context: { cloudflare?: { env?: { API_URL?: string } } };
}) {
  const apiUrl = context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";
  const user = await getAuthUser(request, apiUrl);
  if (!user) return redirect("/auth/login");
  const theme = getTheme(request);
  const lang = getLang(request);
  return { user, apiUrl, theme, lang };
}

export default function AuthLayout() {
  const { user, apiUrl, theme } = useLoaderData<typeof loader>();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobile}
          onKeyDown={(e) => e.key === "Escape" && closeMobile()}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 h-full
          transition-transform duration-200
          md:relative md:z-auto md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <DashboardSidebar
          user={user}
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
          apiUrl={apiUrl}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar user={user} apiUrl={apiUrl} theme={theme}>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </DashboardTopbar>
        <div className="flex-1 overflow-auto bg-background px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
