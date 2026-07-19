import { pgTable, serial, text, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  dietaryPreferences: jsonb("dietary_preferences").$type<string[]>().notNull().default([]),
  allergies: jsonb("allergies").$type<string[]>().notNull().default([]),
  ingredientsToAvoid: jsonb("ingredients_to_avoid").$type<string[]>().notNull().default([]),
  ingredientsToAllow: jsonb("ingredients_to_allow").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
