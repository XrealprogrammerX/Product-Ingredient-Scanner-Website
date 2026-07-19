import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, otpsTable } from "@workspace/db";
import { RegisterBody, LoginBody, SendOtpBody, VerifyOtpBody } from "@workspace/api-zod";
import { eq, and, gt } from "drizzle-orm";

const router = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password, displayName, dietaryPreferences, allergies, ingredientsToAvoid, ingredientsToAllow } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash,
    displayName,
    emailVerified: false,
    dietaryPreferences: dietaryPreferences ?? [],
    allergies: allergies ?? [],
    ingredientsToAvoid: ingredientsToAvoid ?? [],
    ingredientsToAllow: ingredientsToAllow ?? [],
  }).returning();

  // Generate and send OTP
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await db.delete(otpsTable).where(eq(otpsTable.email, email));
  await db.insert(otpsTable).values({ email, code, expiresAt });

  req.log.info({ email, code }, "OTP generated for new user — check logs to verify email");

  res.status(201).json({
    user: userToProfile(user),
    message: "Account created. Check your email for a verification code.",
  });
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  req.session.userId = user.id;

  res.json({
    user: userToProfile(user),
    message: "Logged in successfully",
  });
});

// POST /api/auth/send-otp
router.post("/auth/send-otp", async (req, res) => {
  const parsed = SendOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(404).json({ error: "No account found with that email" });
    return;
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await db.delete(otpsTable).where(eq(otpsTable.email, email));
  await db.insert(otpsTable).values({ email, code, expiresAt });

  req.log.info({ email, code }, "OTP sent — check server logs to retrieve the verification code");

  res.json({ message: "Verification code sent to your email" });
});

// POST /api/auth/verify-otp
router.post("/auth/verify-otp", async (req, res) => {
  const parsed = VerifyOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, code } = parsed.data;

  const now = new Date();
  const [otp] = await db
    .select()
    .from(otpsTable)
    .where(and(eq(otpsTable.email, email), eq(otpsTable.code, code), gt(otpsTable.expiresAt, now)))
    .limit(1);

  if (!otp) {
    res.status(400).json({ error: "Invalid or expired verification code" });
    return;
  }

  await db.update(usersTable).set({ emailVerified: true }).where(eq(usersTable.email, email));
  await db.delete(otpsTable).where(eq(otpsTable.email, email));

  res.json({ message: "Email verified successfully" });
});

// POST /api/auth/logout
router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

// GET /api/auth/me
router.get("/auth/me", async (req, res) => {
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

export default router;
