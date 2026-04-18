import { Link, useLoaderData } from "react-router";
import { Star } from "lucide-react";
import type { Route } from "./+types/_index";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { PhoneMockup } from "~/components/phone-mockup";
import { useT } from "~/lib/i18n";

export async function loader({ context }: Route.LoaderArgs) {
  try {
    const apiUrl = context.cloudflare.env.API_URL;
    const res = await fetch(`${apiUrl}/`);
    const data = (await res.json()) as { message: string; version: string };
    return { api: data };
  } catch (e) {
    console.error("API fetch failed:", e);
    return { api: null };
  }
}

const AVATAR_INITIALS = ["AB", "CD", "EF"] as const;

export default function Index(): React.ReactElement {
  useLoaderData<typeof loader>();
  const t = useT();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-8">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            {t.home.hero.title}
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            {t.home.hero.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex -space-x-2">
              {AVATAR_INITIALS.map((init) => (
                <Avatar
                  key={init}
                  className="h-9 w-9 border-2 border-background"
                >
                  <AvatarFallback className="bg-muted text-xs">
                    {init}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {t.home.hero.socialProof.users}
              </span>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-accent-brand text-accent-brand"
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {t.home.hero.socialProof.rating}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              nativeButton={false}
              className="bg-accent-brand text-accent-brand-foreground hover:bg-accent-brand/90 h-12 px-8 text-base font-semibold"
              render={<Link to="/auth/login" />}
            >
              {t.home.hero.cta}
            </Button>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <PhoneMockup />
        </div>
      </div>
    </div>
  );
}
