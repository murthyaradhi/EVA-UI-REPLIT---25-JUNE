import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  colorPalette: text("color_palette").default("blue"),
});

export const colorPalettes = pgTable("color_palettes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  primary: text("primary").notNull(),
  primaryHover: text("primary_hover").notNull(),
  secondary: text("secondary").notNull(),
  accent: text("accent").notNull(),
  background: text("background").notNull(),
  surface: text("surface").notNull(),
  text: text("text").notNull(),
  textSecondary: text("text_secondary").notNull(),
  border: text("border").notNull(),
  ring: text("ring").notNull(),
});

export const flightSearchHistory = pgTable("flight_search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  searchData: json("search_data").notNull(),
  searchDate: timestamp("search_date").defaultNow(),
  frequency: integer("frequency").default(1),
  lastUsed: timestamp("last_used").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  colorPalette: true,
});

export const insertColorPaletteSchema = createInsertSchema(colorPalettes).omit({
  id: true,
});

export const insertFlightSearchHistorySchema = createInsertSchema(flightSearchHistory).omit({
  id: true,
  searchDate: true,
  lastUsed: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ColorPalette = typeof colorPalettes.$inferSelect;
export type InsertColorPalette = z.infer<typeof insertColorPaletteSchema>;
export type FlightSearchHistory = typeof flightSearchHistory.$inferSelect;
export type InsertFlightSearchHistory = z.infer<typeof insertFlightSearchHistorySchema>;
