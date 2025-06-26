import { storage } from "./storage";

const defaultPalettes = [
  {
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
  },
  {
    name: "google",
    displayName: "Google Cloud",
    primary: "rgb(66, 133, 244)",
    primaryHover: "rgb(51, 103, 214)",
    secondary: "rgb(52, 168, 83)",
    accent: "rgb(251, 188, 5)",
    background: "linear-gradient(135deg, rgb(248, 249, 250) 0%, rgb(241, 243, 244) 100%)",
    surface: "rgba(255, 255, 255, 0.95)",
    text: "rgb(32, 33, 36)",
    textSecondary: "rgb(95, 99, 104)",
    border: "rgb(218, 220, 224)",
    ring: "rgb(66, 133, 244)"
  },
  {
    name: "ibm",
    displayName: "IBM Professional",
    primary: "rgb(15, 98, 254)",
    primaryHover: "rgb(0, 67, 206)",
    secondary: "rgb(8, 47, 126)",
    accent: "rgb(141, 185, 202)",
    background: "linear-gradient(135deg, rgb(250, 251, 252) 0%, rgb(244, 247, 248) 100%)",
    surface: "rgba(255, 255, 255, 0.95)",
    text: "rgb(22, 22, 22)",
    textSecondary: "rgb(110, 110, 110)",
    border: "rgb(224, 224, 224)",
    ring: "rgb(15, 98, 254)"
  },
  {
    name: "github",
    displayName: "GitHub Enterprise",
    primary: "rgb(33, 136, 56)",
    primaryHover: "rgb(26, 127, 55)",
    secondary: "rgb(79, 172, 254)",
    accent: "rgb(101, 109, 118)",
    background: "linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(246, 248, 250) 100%)",
    surface: "rgba(255, 255, 255, 0.95)",
    text: "rgb(36, 41, 47)",
    textSecondary: "rgb(101, 109, 118)",
    border: "rgb(208, 215, 222)",
    ring: "rgb(33, 136, 56)"
  },
  {
    name: "salesforce",
    displayName: "Salesforce Lightning",
    primary: "rgb(0, 161, 224)",
    primaryHover: "rgb(0, 136, 203)",
    secondary: "rgb(27, 150, 255)",
    accent: "rgb(0, 184, 217)",
    background: "linear-gradient(135deg, rgb(250, 252, 255) 0%, rgb(243, 248, 254) 100%)",
    surface: "rgba(255, 255, 255, 0.95)",
    text: "rgb(8, 7, 7)",
    textSecondary: "rgb(115, 115, 115)",
    border: "rgb(221, 219, 218)",
    ring: "rgb(0, 161, 224)"
  },
  {
    name: "corporate",
    displayName: "Corporate Gray",
    primary: "rgb(55, 65, 81)",
    primaryHover: "rgb(31, 41, 55)",
    secondary: "rgb(75, 85, 99)",
    accent: "rgb(156, 163, 175)",
    background: "linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(249, 250, 251) 100%)",
    surface: "rgba(255, 255, 255, 0.95)",
    text: "rgb(17, 24, 39)",
    textSecondary: "rgb(107, 114, 128)",
    border: "rgb(229, 231, 235)",
    ring: "rgb(55, 65, 81)"
  }
];

export async function seedColorPalettes() {
  console.log("Seeding color palettes...");
  
  try {
    for (const palette of defaultPalettes) {
      const existing = await storage.getColorPalette(palette.name);
      if (!existing) {
        await storage.createColorPalette(palette);
        console.log(`Created palette: ${palette.displayName}`);
      }
    }
    console.log("Color palettes seeding completed.");
  } catch (error) {
    console.warn("Color palette seeding failed, using defaults:", error);
  }
}