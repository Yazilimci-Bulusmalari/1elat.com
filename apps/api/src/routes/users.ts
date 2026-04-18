import { Hono } from "hono";
import {
  updateUserSchema,
  updateUserSkillsSchema,
  updateOpenToWorkSchema,
} from "@1elat/shared";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getUserById,
  getUserByUsername,
  updateUser,
  isUsernameTaken,
} from "../services/user.service";
import {
  replaceUserSkills,
  getUserSkills,
  getUserSkillCount,
  updateOpenToWork,
} from "../services/skill.service";
import { listDevelopers } from "../services/developer.service";
import { ConflictError, NotFoundError, ValidationError } from "../lib/errors";
import type { AppEnv } from "../types";
import type { UpdateUserInput } from "@1elat/shared";

export const userRoutes = new Hono<AppEnv>();

userRoutes.get("/me", authRequired, async (c) => {
  const db = c.get("db");
  const userId = c.get("userId");
  const user = await getUserById(db, userId);
  if (!user) throw new NotFoundError("User");

  const skills = await getUserSkills(db, userId);
  return c.json({ data: { ...user, skills }, error: null });
});

userRoutes.put("/me", authRequired, validate(updateUserSchema), async (c) => {
  const db = c.get("db");
  const userId = c.get("userId");
  const body = c.get("validatedBody") as UpdateUserInput;

  if (body.username) {
    const taken = await isUsernameTaken(db, body.username, userId);
    if (taken) {
      throw new ConflictError("Username is already taken");
    }
  }

  const updated = await updateUser(db, userId, body);
  if (!updated) throw new NotFoundError("User");

  return c.json({ data: updated, error: null });
});

userRoutes.put(
  "/me/skills",
  authRequired,
  validate(updateUserSkillsSchema),
  async (c) => {
    const db = c.get("db");
    const userId = c.get("userId");
    const { skillIds } = c.get("validatedBody") as { skillIds: string[] };

    await replaceUserSkills(db, userId, skillIds);
    const skills = await getUserSkills(db, userId);

    return c.json({ data: skills, error: null });
  }
);

userRoutes.patch(
  "/me/open-to-work",
  authRequired,
  validate(updateOpenToWorkSchema),
  async (c) => {
    const db = c.get("db");
    const userId = c.get("userId");
    const { isOpenToWork } = c.get("validatedBody") as {
      isOpenToWork: boolean;
    };

    if (isOpenToWork) {
      const skillCount = await getUserSkillCount(db, userId);
      if (skillCount === 0) {
        throw new ValidationError(
          "Yetkinlik eklemeden calismaya acik durumuna gecilemez"
        );
      }
    }

    await updateOpenToWork(db, userId, isOpenToWork);
    return c.json({ data: { isOpenToWork }, error: null });
  }
);

userRoutes.get("/", async (c) => {
  const db = c.get("db");

  const search = c.req.query("search");
  const openToWorkParam = c.req.query("openToWork");
  const skillIdsParam = c.req.query("skillIds");
  const page = parseInt(c.req.query("page") ?? "1", 10);
  const limit = parseInt(c.req.query("limit") ?? "12", 10);

  const skillIds = skillIdsParam
    ? skillIdsParam.split(",").filter(Boolean)
    : undefined;

  const result = await listDevelopers(db, {
    search: search || undefined,
    openToWork: openToWorkParam === "true" ? true : undefined,
    skillIds,
    page: Math.max(1, page),
    limit: Math.min(50, Math.max(1, limit)),
  });

  return c.json({
    data: {
      developers: result.developers,
      total: result.total,
      page,
      limit,
    },
    error: null,
  });
});

userRoutes.get("/:username", async (c) => {
  const db = c.get("db");
  const username = c.req.param("username");
  const user = await getUserByUsername(db, username);
  if (!user) throw new NotFoundError("User");

  const skills = await getUserSkills(db, user.id);

  const { githubId, googleId, role, ...publicData } = user;
  return c.json({ data: { ...publicData, skills }, error: null });
});
