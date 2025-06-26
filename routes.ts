import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedColorPalettes } from "./seed-palettes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed color palettes on startup
  await seedColorPalettes();

  // Color palette routes
  app.get("/api/color-palettes", async (req, res) => {
    try {
      const palettes = await storage.getAllColorPalettes();
      res.json(palettes);
    } catch (error) {
      console.error("Error fetching color palettes:", error);
      res.status(500).json({ message: "Failed to fetch color palettes" });
    }
  });

  app.get("/api/color-palettes/:name", async (req, res) => {
    try {
      const palette = await storage.getColorPalette(req.params.name);
      if (!palette) {
        return res.status(404).json({ message: "Color palette not found" });
      }
      res.json(palette);
    } catch (error) {
      console.error("Error fetching color palette:", error);
      res.status(500).json({ message: "Failed to fetch color palette" });
    }
  });

  app.post("/api/color-palettes", async (req, res) => {
    try {
      const palette = await storage.createColorPalette(req.body);
      res.status(201).json(palette);
    } catch (error) {
      console.error("Error creating color palette:", error);
      res.status(500).json({ message: "Failed to create color palette" });
    }
  });

  // User preference routes
  app.patch("/api/users/:id/color-palette", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { colorPalette } = req.body;
      
      const user = await storage.updateUserColorPalette(userId, colorPalette);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user color palette:", error);
      res.status(500).json({ message: "Failed to update color palette" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
