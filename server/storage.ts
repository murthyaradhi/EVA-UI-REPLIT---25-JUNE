import { users, colorPalettes, flightSearchHistory, type User, type InsertUser, type ColorPalette, type InsertColorPalette, type FlightSearchHistory, type InsertFlightSearchHistory } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Mock data for development
const mockUsers: User[] = [
  { id: 1, username: 'demo', password: 'demo', colorPalette: 'microsoft' }
];

const mockPalettes: ColorPalette[] = [
  {
    id: 1,
    name: "microsoft",
    displayName: "Microsoft Azure",
    primary: "rgb(0, 120, 212)",
    primaryHover: "rgb(16, 110, 190)",
    secondary: "rgb(40, 120, 180)",
    accent: "rgb(70, 140, 200)",
    background: "linear-gradient(135deg, rgb(243, 246, 249) 0%, rgb(230, 240, 250) 100%)",
    surface: "rgba(255, 255, 255, 0.95)",
    text: "rgb(32, 31, 30)",
    textSecondary: "rgb(96, 94, 92)",
    border: "rgb(225, 223, 221)",
    ring: "rgb(0, 120, 212)"
  }
];

const mockFlightHistory: FlightSearchHistory[] = [];

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserColorPalette(userId: number, colorPalette: string): Promise<User | undefined>;
  getAllColorPalettes(): Promise<ColorPalette[]>;
  createColorPalette(palette: InsertColorPalette): Promise<ColorPalette>;
  getColorPalette(name: string): Promise<ColorPalette | undefined>;
  saveFlightSearch(searchHistory: InsertFlightSearchHistory): Promise<FlightSearchHistory>;
  getFlightSearchHistory(userId: number): Promise<FlightSearchHistory[]>;
  updateFlightSearchFrequency(id: number): Promise<FlightSearchHistory | undefined>;
  deleteFlightSearchHistory(id: number, userId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.warn('Using mock user data');
      return mockUsers.find(u => u.id === id);
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.warn('Using mock user data');
      return mockUsers.find(u => u.username === username);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return user;
    } catch (error) {
      console.warn('Using mock user creation');
      const newUser = { id: mockUsers.length + 1, ...insertUser };
      mockUsers.push(newUser);
      return newUser;
    }
  }

  async updateUserColorPalette(userId: number, colorPalette: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ colorPalette })
        .where(eq(users.id, userId))
        .returning();
      return user || undefined;
    } catch (error) {
      console.warn('Using mock user update');
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        user.colorPalette = colorPalette;
        return user;
      }
      return undefined;
    }
  }

  async getAllColorPalettes(): Promise<ColorPalette[]> {
    try {
      return await db.select().from(colorPalettes);
    } catch (error) {
      console.warn('Using mock palette data');
      return mockPalettes;
    }
  }

  async createColorPalette(palette: InsertColorPalette): Promise<ColorPalette> {
    try {
      const [newPalette] = await db
        .insert(colorPalettes)
        .values(palette)
        .returning();
      return newPalette;
    } catch (error) {
      console.warn('Using mock palette creation');
      const newPalette = { id: mockPalettes.length + 1, ...palette };
      mockPalettes.push(newPalette);
      return newPalette;
    }
  }

  async getColorPalette(name: string): Promise<ColorPalette | undefined> {
    try {
      const [palette] = await db.select().from(colorPalettes).where(eq(colorPalettes.name, name));
      return palette || undefined;
    } catch (error) {
      console.warn('Using mock palette data');
      return mockPalettes.find(p => p.name === name);
    }
  }

  async saveFlightSearch(searchHistory: InsertFlightSearchHistory): Promise<FlightSearchHistory> {
    try {
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
    } catch (error) {
      console.warn('Using mock flight search storage');
      const newSearch = {
        id: mockFlightHistory.length + 1,
        searchDate: new Date(),
        lastUsed: new Date(),
        frequency: 1,
        ...searchHistory
      };
      mockFlightHistory.push(newSearch);
      return newSearch;
    }
  }

  async getFlightSearchHistory(userId: number): Promise<FlightSearchHistory[]> {
    try {
      return await db
        .select()
        .from(flightSearchHistory)
        .where(eq(flightSearchHistory.userId, userId))
        .orderBy(desc(flightSearchHistory.lastUsed))
        .limit(10);
    } catch (error) {
      console.warn('Using mock flight search history');
      return mockFlightHistory.filter(h => h.userId === userId).slice(0, 10);
    }
  }

  async updateFlightSearchFrequency(id: number): Promise<FlightSearchHistory | undefined> {
    try {
      const [updated] = await db
        .update(flightSearchHistory)
        .set({
          frequency: flightSearchHistory.frequency + 1,
          lastUsed: new Date(),
        })
        .where(eq(flightSearchHistory.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.warn('Using mock flight search update');
      const search = mockFlightHistory.find(h => h.id === id);
      if (search) {
        search.frequency += 1;
        search.lastUsed = new Date();
        return search;
      }
      return undefined;
    }
  }

  async deleteFlightSearchHistory(id: number, userId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(flightSearchHistory)
        .where(and(
          eq(flightSearchHistory.id, id),
          eq(flightSearchHistory.userId, userId)
        ));
      return result.rowCount > 0;
    } catch (error) {
      console.warn('Using mock flight search deletion');
      const index = mockFlightHistory.findIndex(h => h.id === id && h.userId === userId);
      if (index > -1) {
        mockFlightHistory.splice(index, 1);
        return true;
      }
      return false;
    }
  }
}

export const storage = new DatabaseStorage();