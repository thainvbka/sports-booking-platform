import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes";

import { Toaster } from "@/components/ui/sonner";
import { SidebarConfigProvider } from "@/context/sidebar-context";
import { useThemeStore } from "@/store/useThemeStore";

function App() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <SidebarConfigProvider>
      <RouterProvider router={router} />
      <Toaster />
    </SidebarConfigProvider>
  );
}

export default App;

