import { Hono } from "hono";
import {
  listActiveCategories,
  listActiveProjectTypes,
  listActiveProjectStages,
} from "../services/lookup.service";
import type { AppEnv } from "../types";

export const lookupRoutes = new Hono<AppEnv>();

lookupRoutes.get("/", async (c) => {
  const db = c.get("db");
  const [categories, types, stages] = await Promise.all([
    listActiveCategories(db),
    listActiveProjectTypes(db),
    listActiveProjectStages(db),
  ]);
  return c.json({ data: { categories, types, stages }, error: null });
});
