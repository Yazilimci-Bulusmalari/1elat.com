import { useParams } from "react-router";
import { FolderOpen, ExternalLink, GitBranch, Star } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export default function ProjectDetailPage() {
  const { slug } = useParams();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{slug}</h1>
            <p className="text-sm text-muted-foreground">Project detail page</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <Star className="h-4 w-4" />
            Star
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <GitBranch className="h-4 w-4" />
            Fork
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <ExternalLink className="h-4 w-4" />
            Visit
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="col-span-2 space-y-4">
          <div className="rounded-lg border p-6">
            <h2 className="mb-2 text-lg font-semibold">About</h2>
            <p className="text-sm text-muted-foreground">
              Project description and details will appear here.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h2 className="mb-2 text-lg font-semibold">README</h2>
            <p className="text-sm text-muted-foreground">
              Project README content will be rendered here.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-sm font-semibold">Details</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Stars: --</p>
              <p>Forks: --</p>
              <p>Contributors: --</p>
              <p>License: --</p>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-sm font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-1">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">placeholder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
