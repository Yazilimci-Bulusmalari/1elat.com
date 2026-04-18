import { Hono } from "hono";
import { updateUserSchema } from "@1elat/shared";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getUserById,
  getUserByUsername,
  updateUser,
  isUsernameTaken,
} from "../services/user.service";
import { ConflictError, NotFoundError } from "../lib/errors";
import type { AppEnv } from "../types";
import type { UpdateUserInput } from "@1elat/shared";

export const userRoutes = new Hono<AppEnv>();

userRoutes.get("/me", authRequired, async (c) => {
  const db = c.get("db");
  const userId = c.get("userId");
  const user = await getUserById(db, userId);
  if (!user) throw new NotFoundError("User");
  return c.json({ data: user, error: null });
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

userRoutes.get("/:username", async (c) => {
  const db = c.get("db");
  const username = c.req.param("username");
  const user = await getUserByUsername(db, username);
  if (!user) throw new NotFoundError("User");

  // Public profilde role gizlenir (admin keşfini zorlastirma).
  const { githubId, googleId, role, ...publicData } = user;
  return c.json({ data: publicData, error: null });
});
