import { UserSearch, Filter } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export default function ExploreDevelopersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Explore Developers</h1>
          <p className="text-sm text-muted-foreground">
            Find and connect with developers in the community
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <Separator />

      {/* Placeholder filter bar */}
      <div className="flex gap-2">
        {["All", "Frontend", "Backend", "Fullstack", "Mobile", "DevOps"].map((tag) => (
          <Button key={tag} variant="secondary" size="sm" className="text-xs">
            {tag}
          </Button>
        ))}
      </div>

      {/* Placeholder grid */}
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8">
        <UserSearch className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Developers will appear here</p>
      </div>
    </div>
  );
}
