export interface Document {
  id: string;
  name: string;
  type: "pdf" | "docx" | "txt" | "pptx" | "xlsx" | "image" | "video";
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  folderId?: string;
  description?: string;
}

export interface FolderType {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  documentCount: number;
}

export type ViewMode = "grid" | "list";
