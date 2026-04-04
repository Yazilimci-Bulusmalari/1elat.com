import { LayoutDashboard, FolderOpen, Bell, TrendingUp } from "lucide-react";
import { Separator } from "~/components/ui/separator";

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your projects, activity, and notifications at a glance
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderOpen} label="Projects" value="--" />
        <StatCard icon={TrendingUp} label="Stars Received" value="--" />
        <StatCard icon={Bell} label="Notifications" value="--" />
        <StatCard icon={LayoutDashboard} label="Contributions" value="--" />
      </div>

      {/* Recent projects */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Your Projects</h2>
        <div className="flex min-h-[20vh] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Your projects will appear here</p>
        </div>
      </div>

      {/* Recent notifications */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Recent Notifications</h2>
        <div className="flex min-h-[20vh] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6">
          <Bell className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      </div>
    </div>
  );
}
