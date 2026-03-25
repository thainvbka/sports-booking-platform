import { ThemeProviderContext } from "@/context/theme-provider-context";
import * as React from "react";

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (!context) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
