"use client";

import { useEffect } from "react";
import { Provider } from "jotai";
import { siteConfig } from "@/config/site.config";
// import hideRechartsConsoleError from "@core/utils/recharts-console-error";

// hideRechartsConsoleError();

export function ThemeProvider({ children }: React.PropsWithChildren<{}>) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", String(siteConfig.mode));
  }, []);

  return <>{children}</>;
}

export function JotaiProvider({ children }: React.PropsWithChildren<{}>) {
  return <Provider>{children}</Provider>;
}
