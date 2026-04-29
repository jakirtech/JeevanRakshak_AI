import { useColorScheme } from "react-native";

import colors from "@/constants/colors";
import { useAppOptional } from "@/contexts/AppContext";

/**
 * Returns the design tokens for the current color scheme.
 *
 * Resolution order:
 * 1. Manual override from AppContext.themeMode ("light" | "dark"), if set.
 * 2. The OS-level color scheme.
 * 3. Light palette as the safe default.
 */
export function useColors() {
  const scheme = useColorScheme();
  const app = useAppOptional();
  const mode = app?.themeMode ?? "system";
  const effective =
    mode === "system" ? (scheme ?? "light") : mode;
  const palette =
    effective === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}
