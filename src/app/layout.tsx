import type { Metadata } from "next";
import { inter, lexendDeca } from "@/app/fonts";
import { cn } from "@/lib/utils";
import NextProgress from "@/components/next-progress";
import Toaster from "@/components/toaster";
import DashboardLayout from "@/layouts/dashboard/layout";
import { ThemeProvider, JotaiProvider } from "@/providers/theme-provider";
import GlobalDrawer from "@/providers/global-drawer";
import GlobalModal from "@/providers/global-modal";

import "./globals.css";

export const metadata: Metadata = {
  title: "App Name",
  description: "Write your app description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(inter.variable, lexendDeca.variable, "font-inter")}
      >
        <ThemeProvider>
          <NextProgress />
          <JotaiProvider>
            <DashboardLayout>{children}</DashboardLayout>
            <GlobalDrawer />
            <GlobalModal />
          </JotaiProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
