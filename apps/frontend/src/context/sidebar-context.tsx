"use client";

import {
  defaultSidebarConfig,
  SidebarContext,
  type SidebarConfig,
} from "@/context/sidebar-config";
import * as React from "react";

export function SidebarConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] =
    React.useState<SidebarConfig>(defaultSidebarConfig);

  const updateConfig = React.useCallback(
    (newConfig: Partial<SidebarConfig>) => {
      setConfig((prev) => ({ ...prev, ...newConfig }));
    },
    [],
  );

  return (
    <SidebarContext.Provider value={{ config, updateConfig }}>
      {children}
    </SidebarContext.Provider>
  );
}
