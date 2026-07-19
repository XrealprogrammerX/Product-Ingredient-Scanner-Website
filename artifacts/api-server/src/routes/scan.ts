import { Router } from "express";
import multer from "multer";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { scanLabelImage } from "../lib/scan";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are accepted"));
      return;
    }
    cb(null, true);
  },
});

/**
 * POST /api/scan/label
 * Accepts: multipart/form-data with field "label" (image file)
 * Returns: ScanResult JSON with source: "cache" | "ai_model"
 *
 * Cache-first: checks DB by SHA-256 of image bytes before calling AI.
 * AI results are validated, retried once on failure, then saved to DB.
 * Personalized matches (allergen/avoid/allow) are computed at read time
 * from the user's stored profile — never baked into the cached record.
 */
router.post("/scan/label", upload.single("label"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No image file provided. Send it as field 'label'." });
    return;
  }

  let profile = null;
  if (req.session.userId) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId))
      .limit(1);
    profile = user ?? null;
  }

  const result = await scanLabelImage(req.file.buffer, req.file.mimetype, profile);
  res.json(result);
});

export default router;
