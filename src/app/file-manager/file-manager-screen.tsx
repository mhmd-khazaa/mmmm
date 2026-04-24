"use client";

import { useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  PiMagnifyingGlassBold,
  PiGridFour,
  PiListBullets,
  PiArrowLineDownBold,
  PiStar,
  PiStarFill,
  PiTrash,
} from "react-icons/pi";
import { useModal } from "@/app/shared/modal-views/use-modal";
import FileUploadModal from "@/app/file-manager/file-upload-modal";
import { fileRecords, type FileKind } from "@/app/file-manager/file-data";

const typeLabel: Record<FileKind, string> = {
  folder: "Folder",
  image: "Image",
  pdf: "PDF",
  doc: "Doc",
  xml: "XML",
  video: "Video",
};

const typeEmoji: Record<FileKind, string> = {
  folder: "📁",
  image: "🖼️",
  pdf: "📕",
  doc: "📄",
  xml: "🧾",
  video: "🎬",
};

function isInDateFilter(dateText: string, filter: string) {
  if (filter === "all") return true;
  const d = new Date(dateText + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (filter === "today") return d.getTime() === today.getTime();
  if (filter === "yesterday") return d.getTime() === yesterday.getTime();
  if (filter === "last7") {
    const min = new Date(today);
    min.setDate(today.getDate() - 7);
    return d >= min && d <= today;
  }
  if (filter === "thisYear") return d.getFullYear() === today.getFullYear();
  return true;
}

export default function FileManagerScreen() {
  const { openModal } = useModal();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | FileKind>("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [deletedIds, setDeletedIds] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(12);

  const layout = (searchParams.get("layout") || "list").toLowerCase();
  const isGrid = layout === "grid";

  const stats = useMemo(() => {
    const active = fileRecords.filter((r) => !deletedIds[r.id]);
    return {
      total: active.length,
      folders: active.filter((x) => x.type === "folder").length,
      images: active.filter((x) => x.type === "image").length,
      videos: active.filter((x) => x.type === "video").length,
    };
  }, [deletedIds]);

  const filtered = useMemo(() => {
    return fileRecords
      .filter((r) => !deletedIds[r.id])
      .filter((r) => (typeFilter === "all" ? true : r.type === typeFilter))
      .filter((r) => isInDateFilter(r.modified, dateFilter))
      .filter((r) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          r.name.toLowerCase().includes(q) ||
          typeLabel[r.type].toLowerCase().includes(q) ||
          r.size.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.modified < b.modified ? 1 : -1));
  }, [dateFilter, deletedIds, search, typeFilter]);

  const shownGrid = filtered.slice(0, visibleCount);

  const setLayout = (next: "grid" | "list") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("layout", next);
    router.push(`${pathname}?${params.toString()}`);
  };

  const removeRow = (id: string) => {
    setDeletedIds((prev) => ({ ...prev, [id]: true }));
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-700">File Manager</h2>
          <p className="mt-1 text-sm text-gray-500">Home / File Manager / List</p>
        </div>
        <button
          onClick={() => openModal({ view: <FileUploadModal />, size: "md", customSize: 680 })}
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <PiArrowLineDownBold className="mr-1.5 h-4 w-4" /> Upload
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-50">
          <p className="text-sm text-gray-500">Total Files</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-700">{stats.total}</h3>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-50">
          <p className="text-sm text-gray-500">Folders</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-700">{stats.folders}</h3>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-50">
          <p className="text-sm text-gray-500">Images</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-700">{stats.images}</h3>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-50">
          <p className="text-sm text-gray-500">Videos</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-700">{stats.videos}</h3>
        </article>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-50">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-700">All Files</h4>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <PiMagnifyingGlassBold className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by file name..."
                className="h-9 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none ring-gray-300 focus:ring-2"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | FileKind)}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm"
            >
              <option value="all">All types</option>
              <option value="folder">Folder</option>
              <option value="image">Image</option>
              <option value="pdf">PDF</option>
              <option value="doc">Doc</option>
              <option value="xml">XML</option>
              <option value="video">Video</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm"
            >
              <option value="all">Last Modified: All</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7">Last 7 days</option>
              <option value="thisYear">This year</option>
            </select>

            <div className="flex items-center gap-1 rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setLayout("list")}
                className={`rounded p-1.5 ${!isGrid ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                aria-label="List view"
              >
                <PiListBullets className="h-4 w-4" />
              </button>
              <button
                onClick={() => setLayout("grid")}
                className={`rounded p-1.5 ${isGrid ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                aria-label="Grid view"
              >
                <PiGridFour className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {isGrid ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {shownGrid.map((item) => (
                <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="text-2xl" aria-hidden>{typeEmoji[item.type]}</div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="rounded p-1 text-orange-500 hover:bg-orange-50"
                        aria-label="Toggle favorite"
                      >
                        {favorites[item.id] ? <PiStarFill className="h-4 w-4" /> : <PiStar className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => removeRow(item.id)}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        aria-label="Delete file"
                      >
                        <PiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h5 className="truncate text-sm font-semibold text-gray-900">{item.name}</h5>
                  <p className="mt-1 text-xs text-gray-500">{item.size} • {item.totalFiles} files • {typeLabel[item.type]}</p>
                </article>
              ))}
            </div>

            {filtered.length > shownGrid.length && (
              <div className="mt-5 text-center">
                <button
                  onClick={() => setVisibleCount((n) => n + 8)}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="overflow-auto rounded-lg border border-gray-200">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Size</th>
                  <th className="px-3 py-2">Modified</th>
                  <th className="px-3 py-2">Shared</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-gray-200">
                    <td className="px-3 py-2 font-medium text-gray-900">
                      <span className="mr-2">{typeEmoji[item.type]}</span>
                      {item.name}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{typeLabel[item.type]}</td>
                    <td className="px-3 py-2 text-gray-600">{item.size}</td>
                    <td className="px-3 py-2 text-gray-600">{item.modified}</td>
                    <td className="px-3 py-2">
                      <div className="flex -space-x-1">
                        {item.shared.slice(0, 3).map((s) => (
                          <span key={s} className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-gray-800 text-[10px] font-semibold text-white">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="rounded p-1 text-orange-500 hover:bg-orange-50"
                          aria-label="Toggle favorite"
                        >
                          {favorites[item.id] ? <PiStarFill className="h-4 w-4" /> : <PiStar className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => removeRow(item.id)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                          aria-label="Delete file"
                        >
                          <PiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-gray-500">
                      No files found with current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
