import { FolderPlus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center gap-3">
        <FolderPlus className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-sm text-muted-foreground">
            Share your project with the developer community
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <form className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Project name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="My Awesome Project"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="What does your project do?"
            rows={4}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="repoUrl" className="text-sm font-medium">
            Repository URL
          </label>
          <input
            id="repoUrl"
            name="repoUrl"
            type="url"
            placeholder="https://github.com/username/repo"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "Node.js", "Python", "Rust", "Go", "AI/ML", "Web3"].map((tag) => (
              <label
                key={tag}
                className="flex cursor-pointer items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm transition-colors hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/10"
              >
                <input type="checkbox" name="tags" value={tag.toLowerCase()} className="sr-only" />
                {tag}
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full">
          Create Project
        </Button>
      </form>
    </div>
  );
}
