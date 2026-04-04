import { Link, Outlet, useLocation } from "react-router";
import { cn } from "~/lib/utils";

const tabs = [
  { label: "Projects", href: "/explore/projects" },
  { label: "Developers", href: "/explore/developers" },
] as const;

export default function ExploreLayout() {
  const location = useLocation();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-6 flex gap-1 border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            to={tab.href}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              location.pathname === tab.href
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
