"use client";

import { useMemo, useState } from "react";
import { PiPaperclip, PiTrash } from "react-icons/pi";
import { useModal } from "@/app/shared/modal-views/use-modal";

export default function FileUploadModal() {
  const { closeModal } = useModal();
  const [files, setFiles] = useState<File[]>([]);

  const totalSizeLabel = useMemo(() => {
    const bytes = files.reduce((sum, f) => sum + f.size, 0);
    if (bytes > 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  }, [files]);

  return (
    <div className="w-full max-w-xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-700">Upload Files</h3>
        <button onClick={closeModal} className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100">Close</button>
      </div>

      <label className="mb-4 flex min-h-36 cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const incoming = Array.from(e.target.files || []);
            setFiles((prev) => [...prev, ...incoming]);
            e.currentTarget.value = "";
          }}
        />
        <span className="inline-flex items-center gap-2">
          <PiPaperclip className="h-5 w-5" />
          Drop files here or click to choose
        </span>
      </label>

      <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
        <span>{files.length} file(s)</span>
        <span>Total: {totalSizeLabel}</span>
      </div>

      <div className="custom-scrollbar max-h-52 space-y-2 overflow-auto">
        {files.map((file, idx) => (
          <div key={`${file.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <div className="truncate pr-3 text-sm text-gray-700">{file.name}</div>
            <button
              onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
              className="rounded p-1 text-red-600 hover:bg-red-50"
            >
              <PiTrash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={() => setFiles([])}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          onClick={closeModal}
          className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Done
        </button>
      </div>
    </div>
  );
}
