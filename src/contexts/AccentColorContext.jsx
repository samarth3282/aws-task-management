import { createContext, useContext, useEffect, useState } from "react";

export const accentColors = {
  amber: { name: "Amber", hex: "#f0a63a" },
  teal: { name: "Teal", hex: "#49d3bd" },
  coral: { name: "Coral", hex: "#FA7275" },
  cyan: { name: "Cyan", hex: "#22D3EE" },
  violet: { name: "Violet", hex: "#8B5CF6" },
  custom: { name: "Custom", hex: "#f0a63a" }
};

const AccentColorContext = createContext(undefined);

export function AccentColorProvider({ children }) {
  const [accentColor, setAccentColorState] = useState("amber");

  useEffect(() => {
    const stored = localStorage.getItem("taskflow-accent");
    const storedCustom = localStorage.getItem("taskflow-accent-custom");
    if (stored === "custom" && storedCustom) {
      setAccentColorState(stored);
      applyColor(storedCustom);
      accentColors.custom.hex = storedCustom;
    } else if (stored && accentColors[stored]) {
      setAccentColorState(stored);
      applyColor(accentColors[stored].hex);
    } else {
      applyColor(accentColors.amber.hex);
    }
  }, []);

  const applyColor = (hex) => {
    document.documentElement.style.setProperty("--accent-primary", hex);

    // Add glow mapping for selection/highlights
    let r = 240, g = 166, b = 58;
    if (hex.startsWith('#') && hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    document.documentElement.style.setProperty("--accent-glow", `rgba(${r}, ${g}, ${b}, 0.18)`);
  };

  const setAccentColor = (color, customHex = null) => {
    setAccentColorState(color);
    localStorage.setItem("taskflow-accent", color);

    if (color === "custom" && customHex) {
      localStorage.setItem("taskflow-accent-custom", customHex);
      applyColor(customHex);
      accentColors.custom.hex = customHex;
    } else {
      applyColor(accentColors[color].hex);
    }
  };

  const setAccentColorAnimated = async (color, x, y, customHex = null) => {
    setAccentColor(color, customHex);
  };

  return (
    <AccentColorContext.Provider value={{ accentColor, setAccentColor, setAccentColorAnimated }}>
      {children}
    </AccentColorContext.Provider>
  );
}

export function useAccentColor() {
  const context = useContext(AccentColorContext);
  if (context === undefined) {
    throw new Error("useAccentColor must be used within AccentColorProvider");
  }
  return context;
}
