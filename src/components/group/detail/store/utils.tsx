import { File, FileText, ImageIcon, Video } from "lucide-react";

export const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="h-6 w-6 text-red-500" />;
    case "docx":
      return <FileText className="h-6 w-6 text-blue-500" />;
    case "pptx":
      return <FileText className="h-6 w-6 text-orange-500" />;
    case "xlsx":
      return <FileText className="h-6 w-6 text-green-500" />;
    case "image":
      return <ImageIcon className="h-6 w-6 text-purple-500" />;
    case "video":
      return <Video className="h-6 w-6 text-pink-500" />;
    default:
      return <File className="h-6 w-6 text-gray-500" />;
  }
};
