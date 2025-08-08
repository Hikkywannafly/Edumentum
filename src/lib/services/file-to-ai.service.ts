/**
 * Service for converting files to formats suitable for AI consumption
 */

export interface FileForAI {
  type: "text" | "image" | "document";
  data: string; // base64 encoded data
  mimeType: string;
  fileName: string;
  size: number;
}

export class FileToAIService {
  /**
   * Convert a file to base64 format for AI processing
   */
  async convertFileToAI(file: File): Promise<FileForAI> {
    const base64Data = await this.fileToBase64(file);

    return {
      type: this.getFileType(file.type),
      data: base64Data,
      mimeType: file.type,
      fileName: file.name,
      size: file.size,
    };
  }

  /**
   * Convert file to base64 string
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Remove data URL prefix (data:image/png;base64,)
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to read file as base64"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Determine file type for AI processing
   */
  private getFileType(mimeType: string): "text" | "image" | "document" {
    if (mimeType.startsWith("image/")) {
      return "image";
    }

    if (mimeType.includes("text/") || mimeType.includes("json")) {
      return "text";
    }

    // PDF, Word, Excel, PowerPoint
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("word") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("presentation") ||
      mimeType.includes("document") ||
      mimeType.includes("officedocument")
    ) {
      return "document";
    }

    return "document"; // Default
  }

  /**
   * Check if file is supported for direct AI sending
   */
  isSupportedForDirectSend(file: File): boolean {
    const supportedTypes = [
      // Images
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
      // Documents
      "application/pdf",
      // Microsoft Office Documents
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
      "application/msword", // .doc
      "application/vnd.ms-excel", // .xls
      "application/vnd.ms-powerpoint", // .ppt
      // Text files
      "text/plain",
      "text/markdown",
      "text/csv",
      "application/json",
      "application/xml",
      "text/xml",
      // Other formats
      "application/rtf", // Rich Text Format
    ];

    return supportedTypes.includes(file.type);
  }

  /**
   * Get file size in MB
   */
  getFileSizeMB(file: File): number {
    return file.size / (1024 * 1024);
  }

  /**
   * Check if file size is within AI limits (typically 20MB for vision APIs)
   */
  isWithinSizeLimit(file: File, limitMB = 20): boolean {
    return this.getFileSizeMB(file) <= limitMB;
  }

  /**
   * Get list of supported file extensions for direct AI processing
   */
  getSupportedFileTypes(): { extensions: string[]; description: string } {
    return {
      extensions: [
        // Images
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
        ".tiff",
        // Documents
        ".pdf",
        ".docx",
        ".xlsx",
        ".pptx",
        ".doc",
        ".xls",
        ".ppt",
        ".rtf",
        // Text
        ".txt",
        ".md",
        ".csv",
        ".json",
        ".xml",
      ],
      description: "Images, PDFs, Microsoft Office documents, and text files",
    };
  }

  /**
   * Check if file extension is supported
   */
  isSupportedExtension(fileName: string): boolean {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
    return this.getSupportedFileTypes().extensions.includes(ext);
  }

  /**
   * Validate file for AI processing
   */
  validateFileForAI(file: File): { valid: boolean; error?: string } {
    if (!this.isSupportedForDirectSend(file)) {
      const supportedTypes = this.getSupportedFileTypes();
      return {
        valid: false,
        error: `File type "${file.type}" not supported for direct AI processing. Supported: ${supportedTypes.description}. Auto-fallback to "Parse Then Send" mode.`,
      };
    }

    if (!this.isWithinSizeLimit(file)) {
      return {
        valid: false,
        error: `File size ${this.getFileSizeMB(file).toFixed(1)}MB exceeds 20MB limit for direct AI processing.`,
      };
    }

    return { valid: true };
  }
}

export const fileToAIService = new FileToAIService();
