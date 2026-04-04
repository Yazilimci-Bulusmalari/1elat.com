import { redirect } from "react-router";
import { UserCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { getAuthUser } from "../lib/auth";

export async function loader({ request, context }: { request: Request; context: { cloudflare?: { env?: { API_URL?: string } } } }) {
  const apiUrl = context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";
  const user = await getAuthUser(request, apiUrl);
  if (!user) return redirect("/auth/login");
  return { user };
}

export default function OnboardingPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <UserCircle className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Complete your profile</h1>
            <p className="text-sm text-muted-foreground">
              Tell us a bit about yourself to get started
            </p>
          </div>
        </div>

        <Separator />

        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="your-username"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              placeholder="A short bio about yourself..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Profession</label>
            <div className="flex flex-wrap gap-2">
              {["Frontend", "Backend", "Fullstack", "Mobile", "DevOps", "Design", "Data", "Other"].map(
                (prof) => (
                  <label
                    key={prof}
                    className="flex cursor-pointer items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm transition-colors hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                  >
                    <input type="checkbox" name="professions" value={prof.toLowerCase()} className="sr-only" />
                    {prof}
                  </label>
                ),
              )}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Complete Setup
          </Button>
        </form>
      </div>
    </div>
  );
}
