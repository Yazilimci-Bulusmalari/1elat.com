import { Hono } from "hono";
import { listActiveSkills } from "../services/skill.service";
import type { AppEnv } from "../types";

export const skillRoutes = new Hono<AppEnv>();

skillRoutes.get("/", async (c) => {
  const db = c.get("db");
  const skills = await listActiveSkills(db);
  return c.json({ data: skills, error: null });
});
