import { useParams } from "react-router";
import { User, MapPin, LinkIcon, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export default function UserProfilePage() {
  const { username } = useParams();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile sidebar */}
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-xl font-bold tracking-tight">@{username}</h1>
              <p className="text-sm text-muted-foreground">Developer profile</p>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            Follow
          </Button>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Location not set</span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <span>No website</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Joined recently</span>
            </div>
          </div>
        </div>

        {/* Profile content */}
        <div className="col-span-2 space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Projects</h2>
            <Separator className="mb-4" />
            <div className="flex min-h-[20vh] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6">
              <User className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No projects yet</p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Activity</h2>
            <Separator className="mb-4" />
            <div className="flex min-h-[20vh] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
