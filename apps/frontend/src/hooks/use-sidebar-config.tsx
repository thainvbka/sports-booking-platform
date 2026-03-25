import {
  SidebarContext,
  type SidebarContextValue,
} from "@/context/sidebar-config";
import * as React from "react";

export function useSidebarConfig(): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error(
      "useSidebarConfig must be used within a SidebarConfigProvider",
    );
  }
  return context;
}
