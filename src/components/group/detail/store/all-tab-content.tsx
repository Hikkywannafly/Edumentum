"use client";

import { Breadcrumb } from "./breadcrumb";
import { FolderItem } from "./folder-item";
import type { Document, FolderType, ViewMode } from "./types";

interface AllTabContentProps {
  selectedFolder: string | null;
  folders: FolderType[];
  documents: Document[];
  viewMode: ViewMode;
  onFolderSelect: (folderId: string) => void;
  onNavigateBack: () => void;
}

export function AllTabContent({
  selectedFolder,
  folders,
  // documents,
  viewMode,
  onFolderSelect,
  onNavigateBack,
}: AllTabContentProps) {
  return (
    <div className="space-y-4">
      <Breadcrumb
        selectedFolder={selectedFolder}
        folders={folders}
        onNavigateBack={onNavigateBack}
      />

      {!selectedFolder && (
        <div>
          <h3 className="mb-3 font-semibold text-lg">Thư mục</h3>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-2"
            }
          >
            {folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                viewMode={viewMode}
                onClick={() => onFolderSelect(folder.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* <div>
        <h3 className="mb-3 font-semibold text-lg">
          {selectedFolder ? "Tài liệu trong thư mục" : "Tài liệu gần đây"}
        </h3>
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-2"
          }
        >
          {documents.map((doc) => (
            <DocumentItem key={doc.id} document={doc} viewMode={viewMode} />
          ))}
        </div>
      </div> */}
    </div>
  );
}
