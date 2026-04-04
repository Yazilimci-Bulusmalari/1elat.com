import { useLoaderData } from "react-router";
import type { Route } from "./+types/_index";

export async function loader({ context }: Route.LoaderArgs) {
  try {
    const apiUrl = context.cloudflare.env.API_URL;
    const res = await fetch(`${apiUrl}/`);
    const data = (await res.json()) as { message: string; version: string };
    return { api: data };
  } catch (e) {
    console.error("API fetch failed:", e);
    return { api: null };
  }
}

export default function Index() {
  const { api } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold tracking-tight">
        1elat — developer collaboration platform
      </h1>
      {api ? (
        <p className="text-muted-foreground">
          API: {api.message} (v{api.version})
        </p>
      ) : (
        <p className="text-muted-foreground">API not connected</p>
      )}
    </div>
  );
}
