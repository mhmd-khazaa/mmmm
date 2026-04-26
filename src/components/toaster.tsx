"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        success: { duration: 3500 },
        error: { duration: 5000 },
      }}
    />
  );
}
