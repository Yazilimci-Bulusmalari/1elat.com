import type { Context, MiddlewareHandler } from "hono";
import type { ZodSchema } from "zod";
import type { AppEnv } from "../types";

export function validate(schema: ZodSchema): MiddlewareHandler<AppEnv> {
  return async (c: Context<AppEnv>, next) => {
    const body = await c.req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");

      return c.json(
        { data: null, error: { message, code: "VALIDATION_ERROR" } },
        400
      );
    }

    c.set("validatedBody", result.data);
    await next();
  };
}
