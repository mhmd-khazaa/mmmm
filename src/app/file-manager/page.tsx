import { Suspense } from "react";
import FileManagerScreen from "@/app/file-manager/file-manager-screen";

export const metadata = {
  title: "File Manager",
};

export default function FileManagerPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading file manager...</div>}>
      <FileManagerScreen />
    </Suspense>
  );
}
