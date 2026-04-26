"use client";

import { useEffect } from "react";
import { Provider as JotaiRoot } from "jotai";
import { siteConfig } from "@/config/site.config";

export function ThemeProvider({ children }: React.PropsWithChildren<{}>) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", String(siteConfig.mode));
  }, []);

  return <>{children}</>;
}

export function JotaiProvider({ children }: React.PropsWithChildren<{}>) {
  return <JotaiRoot>{children}</JotaiRoot>;
}
