import { useState, useCallback } from "react";

export interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Simple toast implementation using console for now
// Can be replaced with a proper toast library later
export function useToast() {
  const toast = useCallback(({ title, description, variant }: Toast) => {
    const message = description ? `${title}: ${description}` : title;

    if (variant === "destructive") {
      console.error(message);
    } else {
      console.log(message);
    }

    // TODO: Replace with actual toast UI component
    // For now, we'll just log to console
  }, []);

  return { toast };
}
