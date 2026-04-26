import { Metadata } from "next";

export const siteConfig = {
  title: "App Name",
  description: "App description.",
  logo: "/logo-short.svg",
  icon: "/logo-short.svg",
  mode: "light" as const,
};

export const metaObject = (title?: string, description: string = siteConfig.description): Metadata => ({
  title: title ? `${title} - ${siteConfig.title}` : siteConfig.title,
  description,
});
