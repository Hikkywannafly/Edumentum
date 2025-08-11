export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

export const getFileIconClassName = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  const iconConfig = {
    pdf: "h-8 w-8 text-red-500",
    docx: "h-8 w-8 text-blue-500",
    doc: "h-8 w-8 text-blue-500",
    pptx: "h-8 w-8 text-orange-500",
    ppt: "h-8 w-8 text-orange-500",
    xlsx: "h-8 w-8 text-green-500",
    xls: "h-8 w-8 text-green-500",
    json: "h-8 w-8 text-purple-500",
    md: "h-8 w-8 text-gray-500",
  };

  return iconConfig[extension as keyof typeof iconConfig] || iconConfig.md;
};

export const getAcceptedFileTypes = () => ({
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    ".pptx",
  ],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/json": [".json"],
  "text/markdown": [".md"],
});

export const FILE_UPLOAD_LIMITS = {
  maxFiles: 10,
  maxSize: 20 * 1024 * 1024, // 20MB
} as const;
