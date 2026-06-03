import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/useThemeStore";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    // Check if the current theme is dark (or if it is set to system and the system preference is dark)
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    // Toggle to the opposite
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative size-9 rounded-full border-border/60 bg-background/50 transition-all duration-300 hover:bg-muted hover:text-foreground hover:scale-105 active:scale-95 focus-visible:ring-ring cursor-pointer"
      aria-label="Chuyển đổi giao diện Sáng/Tối"
    >
      {/* Sun icon: visible in light mode, rotates and shrinks to 0 in dark mode */}
      <Sun className="size-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
      
      {/* Moon icon: shrunk to 0 in light mode, rotates and grows to 100 in dark mode */}
      <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-indigo-400" />
    </Button>
  );
}
