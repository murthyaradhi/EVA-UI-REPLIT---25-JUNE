import { users, colorPalettes, flightSearchHistory, type User, type InsertUser, type ColorPalette, type InsertColorPalette, type FlightSearchHistory, type InsertFlightSearchHistory } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserColorPalette(userId: number, colorPalette: string): Promise<User | undefined>;
  getAllColorPalettes(): Promise<ColorPalette[]>;
  createColorPalette(palette: InsertColorPalette): Promise<ColorPalette>;
  getColorPalette(name: string): Promise<ColorPalette | undefined>;
  // Flight search history methods
  saveFlightSearch(searchHistory: InsertFlightSearchHistory): Promise<FlightSearchHistory>;
  getFlightSearchHistory(userId: number): Promise<FlightSearchHistory[]>;
  updateFlightSearchFrequency(id: number): Promise<FlightSearchHistory | undefined>;
  deleteFlightSearchHistory(id: number, userId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserColorPalette(userId: number, colorPalette: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ colorPalette })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getAllColorPalettes(): Promise<ColorPalette[]> {
    return await db.select().from(colorPalettes);
  }

  async createColorPalette(palette: InsertColorPalette): Promise<ColorPalette> {
    const [newPalette] = await db
      .insert(colorPalettes)
      .values(palette)
      .returning();
    return newPalette;
  }

  async getColorPalette(name: string): Promise<ColorPalette | undefined> {
    const [palette] = await db.select().from(colorPalettes).where(eq(colorPalettes.name, name));
    return palette || undefined;
  }

  async saveFlightSearch(searchHistory: InsertFlightSearchHistory): Promise<FlightSearchHistory> {
    // Check if similar search exists and update frequency instead
    const existingSearches = await db
      .select()
      .from(flightSearchHistory)
      .where(eq(flightSearchHistory.userId, searchHistory.userId!));

    const similarSearch = existingSearches.find(search => {
      const existing = search.searchData as any;
      const current = searchHistory.searchData as any;
      return existing.from === current.from &&
             existing.to === current.to &&
             existing.tripType === current.tripType &&
             existing.travelClass === current.travelClass;
    });

    if (similarSearch) {
      const [updated] = await db
        .update(flightSearchHistory)
        .set({
          frequency: similarSearch.frequency + 1,
          lastUsed: new Date(),
        })
        .where(eq(flightSearchHistory.id, similarSearch.id))
        .returning();
      return updated;
    }

    const [newSearch] = await db
      .insert(flightSearchHistory)
      .values(searchHistory)
      .returning();
    return newSearch;
  }

  async getFlightSearchHistory(userId: number): Promise<FlightSearchHistory[]> {
    return await db
      .select()
      .from(flightSearchHistory)
      .where(eq(flightSearchHistory.userId, userId))
      .orderBy(desc(flightSearchHistory.lastUsed))
      .limit(10);
  }

  async updateFlightSearchFrequency(id: number): Promise<FlightSearchHistory | undefined> {
    const [updated] = await db
      .update(flightSearchHistory)
      .set({
        frequency: flightSearchHistory.frequency + 1,
        lastUsed: new Date(),
      })
      .where(eq(flightSearchHistory.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteFlightSearchHistory(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(flightSearchHistory)
      .where(and(
        eq(flightSearchHistory.id, id),
        eq(flightSearchHistory.userId, userId)
      ));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();