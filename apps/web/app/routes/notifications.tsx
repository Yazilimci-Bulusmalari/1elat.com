import { Bell } from "lucide-react";
import { Separator } from "~/components/ui/separator";

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Stay up to date with your projects and community
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8">
        <Bell className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      </div>
    </div>
  );
}
