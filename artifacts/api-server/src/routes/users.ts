import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { UpdateProfileBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router = Router();

function userToProfile(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    dietaryPreferences: (user.dietaryPreferences as string[]) ?? [],
    allergies: (user.allergies as string[]) ?? [],
    ingredientsToAvoid: (user.ingredientsToAvoid as string[]) ?? [],
    ingredientsToAllow: (user.ingredientsToAllow as string[]) ?? [],
    createdAt: user.createdAt.toISOString(),
  };
}

// GET /api/users/profile
router.get("/users/profile", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json(userToProfile(user));
});

// PUT /api/users/profile
router.put("/users/profile", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (parsed.data.displayName !== undefined) updates.displayName = parsed.data.displayName;
  if (parsed.data.dietaryPreferences !== undefined) updates.dietaryPreferences = parsed.data.dietaryPreferences;
  if (parsed.data.allergies !== undefined) updates.allergies = parsed.data.allergies;
  if (parsed.data.ingredientsToAvoid !== undefined) updates.ingredientsToAvoid = parsed.data.ingredientsToAvoid;
  if (parsed.data.ingredientsToAllow !== undefined) updates.ingredientsToAllow = parsed.data.ingredientsToAllow;

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.session.userId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(userToProfile(updated));
});

export default router;
