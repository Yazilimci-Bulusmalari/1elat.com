import { Outlet, redirect, useLoaderData } from "react-router";
import { getAuthUser } from "../lib/auth";
import { DashboardSidebar } from "~/components/layout/dashboard-sidebar";

export async function loader({
  request,
  context,
}: {
  request: Request;
  context: { cloudflare?: { env?: { API_URL?: string } } };
}) {
  const apiUrl = context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";
  const user = await getAuthUser(request, apiUrl);
  if (!user) return redirect("/auth/login");
  return { user };
}

export default function AuthLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full">
      <DashboardSidebar user={user} />
      <div className="min-w-0 flex-1 overflow-auto bg-background px-4 py-6 lg:px-8 lg:py-8">
        <Outlet />
      </div>
    </div>
  );
}
