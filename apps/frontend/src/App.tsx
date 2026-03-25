import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes";

import { Toaster } from "@/components/ui/sonner";
import { SidebarConfigProvider } from "@/context/sidebar-context";
import { ThemeProvider } from "@/context/theme-context";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="sports-booking-theme">
      <SidebarConfigProvider>
        <RouterProvider router={router} />
        <Toaster />
      </SidebarConfigProvider>
    </ThemeProvider>
  );
}

export default App;
