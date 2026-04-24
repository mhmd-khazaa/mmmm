export type FileKind = "folder" | "image" | "pdf" | "doc" | "xml" | "video";

export type FileRecord = {
  id: string;
  name: string;
  type: FileKind;
  size: string;
  modified: string;
  totalFiles: number;
  shared: string[];
};

export const fileRecords: FileRecord[] = [
  { id: "f1", name: "Brand Assets", type: "folder", size: "1.2 GB", modified: "2026-04-17", totalFiles: 148, shared: ["AA", "MH", "LK"] },
  { id: "f2", name: "Campaign-April.pdf", type: "pdf", size: "5.4 MB", modified: "2026-04-19", totalFiles: 1, shared: ["NA"] },
  { id: "f3", name: "Landing-Hero.png", type: "image", size: "2.1 MB", modified: "2026-04-18", totalFiles: 1, shared: ["MA", "TR"] },
  { id: "f4", name: "Q2-Budget.xml", type: "xml", size: "680 KB", modified: "2026-04-14", totalFiles: 1, shared: ["FN"] },
  { id: "f5", name: "Contract-v7.doc", type: "doc", size: "1.9 MB", modified: "2026-04-09", totalFiles: 1, shared: ["HS", "RA"] },
  { id: "f6", name: "Product Video Intro", type: "video", size: "824 MB", modified: "2026-04-11", totalFiles: 3, shared: ["KD", "SA", "OM"] },
  { id: "f7", name: "Invoices", type: "folder", size: "320 MB", modified: "2026-04-03", totalFiles: 87, shared: ["AB"] },
  { id: "f8", name: "Team-Photo.jpg", type: "image", size: "7.8 MB", modified: "2026-04-18", totalFiles: 1, shared: ["YN", "WA"] },
  { id: "f9", name: "Architecture.pdf", type: "pdf", size: "11.2 MB", modified: "2026-03-28", totalFiles: 1, shared: ["TE"] },
  { id: "f10", name: "Sitemap.xml", type: "xml", size: "220 KB", modified: "2026-04-16", totalFiles: 1, shared: ["AI"] },
  { id: "f11", name: "Release-Notes.doc", type: "doc", size: "930 KB", modified: "2026-04-12", totalFiles: 1, shared: ["QA", "PM"] },
  { id: "f12", name: "Warehouse-Drone.mp4", type: "video", size: "1.6 GB", modified: "2026-04-15", totalFiles: 1, shared: ["OP", "YT"] },
  { id: "f13", name: "UI-Icons", type: "folder", size: "156 MB", modified: "2026-04-02", totalFiles: 265, shared: ["UX", "GD"] },
  { id: "f14", name: "Receipt-001.pdf", type: "pdf", size: "410 KB", modified: "2026-04-19", totalFiles: 1, shared: ["FN", "AC"] },
  { id: "f15", name: "Profile-Cards.png", type: "image", size: "4.5 MB", modified: "2026-04-06", totalFiles: 1, shared: ["MR"] },
  { id: "f16", name: "Roadmap-v3.doc", type: "doc", size: "2.3 MB", modified: "2026-04-08", totalFiles: 1, shared: ["PM", "CT"] },
  { id: "f17", name: "Internationalization.xml", type: "xml", size: "740 KB", modified: "2026-04-05", totalFiles: 1, shared: ["TR"] },
  { id: "f18", name: "Teaser-Vertical.mp4", type: "video", size: "498 MB", modified: "2026-04-13", totalFiles: 1, shared: ["SM", "MK"] }
];
