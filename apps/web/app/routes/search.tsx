import { Search as SearchIcon } from "lucide-react";
import { Separator } from "~/components/ui/separator";

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3">
        <SearchIcon className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Search</h1>
          <p className="text-sm text-muted-foreground">
            Search projects, developers, and more
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="space-y-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="flex h-10 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8">
          <SearchIcon className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Search results will appear here</p>
        </div>
      </div>
    </div>
  );
}
