import { Outlet, redirect } from "react-router";
import { getAuthUser } from "../lib/auth";

export async function loader({ request, context }: { request: Request; context: { cloudflare?: { env?: { API_URL?: string } } } }) {
  const apiUrl = context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";
  const user = await getAuthUser(request, apiUrl);
  if (!user) return redirect("/auth/login");
  return { user };
}

export default function AuthLayout() {
  return <Outlet />;
}
