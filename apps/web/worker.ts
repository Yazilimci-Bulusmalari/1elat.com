import { createRequestHandler } from "@react-router/cloudflare";
// @ts-expect-error - server build is generated at build time
import * as serverBuild from "./build/server/index.js";

const handleRequest = createRequestHandler({
  build: serverBuild,
  mode: "production",
});

export default {
  async fetch(
    request: Request,
    env: Record<string, unknown>,
    ctx: ExecutionContext
  ): Promise<Response> {
    return handleRequest({
      request,
      env,
      waitUntil: ctx.waitUntil.bind(ctx),
      passThroughOnException: ctx.passThroughOnException.bind(ctx),
    } as unknown as EventContext<unknown, string, unknown>);
  },
};
