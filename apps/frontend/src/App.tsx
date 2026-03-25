import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes";

import { Toaster } from "@/components/ui/sonner";
import { SidebarConfigProvider } from "@/context/sidebar-context";

function App() {
  return (
    <SidebarConfigProvider>
      <RouterProvider router={router} />
      <Toaster />
    </SidebarConfigProvider>
  );
}

export default App;
