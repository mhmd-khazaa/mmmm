import { metaObject } from "@/config/site.config";

export const metadata = metaObject("Dashboard");

export default function DashboardPage() {
  return (
    <section className="space-y-2 p-2">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-700">
        Dashboard
      </h1>
      <p className="text-sm text-gray-500">
        Welcome back. Replace this page with your real dashboard content.
      </p>
    </section>
  );
}
