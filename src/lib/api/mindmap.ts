const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// MindMapType enum theo backend
export type MindMapType =
  | "STUDY_NOTES"
  | "PROJECT_PLANNING"
  | "CONCEPT_MAPPING"
  | "BRAINSTORMING"
  | "LESSON_PLAN"
  | "RESEARCH"
  | "PRESENTATION"
  | "PERSONAL";

export interface FileProps {
  id: string;
  name: string;
  data: string;
  type: MindMapType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFileRequest {
  name: string;
  data: string;
  type: MindMapType;
}

export interface UpdateFileRequest {
  name?: string;
  data: string;
  type: MindMapType;
}

export interface UpdateFileNameRequest {
  name: string;
}

class MindmapAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No access token found. Please login first.");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  private async handleResponse(response: Response, operation: string) {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${operation} failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/mindmaps/files`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return true;
      }

      return false;
    } catch (_) {
      return false;
    }
  }

  async getFiles(): Promise<FileProps[]> {
    try {
      console.log("Fetching mindmap files...");
      const response = await fetch(`${API_BASE_URL}/student/mindmaps/files`, {
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response, "Fetch files");
      const files = result.data || result;
      console.log("Files fetched successfully:", files);
      return files;
    } catch (error) {
      console.error("Error fetching files:", error);
      throw error;
    }
  }

  async getFilesByType(type: MindMapType): Promise<FileProps[]> {
    try {
      console.log("Fetching mindmap files by type:", type);
      const response = await fetch(
        `${API_BASE_URL}/student/mindmaps/files/type/${type.toLowerCase()}`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      const result = await this.handleResponse(response, "Fetch files by type");
      const files = result.data || result;
      console.log("Files by type fetched successfully:", files);
      return files;
    } catch (error) {
      console.error("Error fetching files by type:", error);
      throw error;
    }
  }

  async createFile(request: CreateFileRequest): Promise<FileProps> {
    try {
      console.log("Creating file with data:", request);

      const response = await fetch(`${API_BASE_URL}/student/mindmaps/files`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      const result = await this.handleResponse(response, "Create file");
      const file = result.data || result;
      console.log("File created successfully:", file);
      return file;
    } catch (error) {
      console.error("Error creating file:", error);
      throw error;
    }
  }

  async updateFile(id: string, request: UpdateFileRequest): Promise<void> {
    try {
      console.log("Updating file:", id, "with data:", request);

      const response = await fetch(
        `${API_BASE_URL}/student/mindmaps/files/${id}`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request),
        },
      );

      await this.handleResponse(response, "Update file");
      console.log("File updated successfully");
    } catch (error) {
      console.error("Error updating file:", error);
      throw error;
    }
  }

  async updateFileName(
    id: string,
    request: UpdateFileNameRequest,
  ): Promise<void> {
    try {
      console.log("Updating file name:", id, "with name:", request.name);

      const response = await fetch(
        `${API_BASE_URL}/student/mindmaps/files/${id}/name`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request),
        },
      );

      await this.handleResponse(response, "Update file name");
      console.log("File name updated successfully");
    } catch (error) {
      console.error("Error updating file name:", error);
      throw error;
    }
  }

  async deleteFile(id: string): Promise<void> {
    try {
      console.log("Deleting file:", id);
      const response = await fetch(
        `${API_BASE_URL}/student/mindmaps/files/${id}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        },
      );

      await this.handleResponse(response, "Delete file");
      console.log("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  async getFileById(id: string): Promise<FileProps> {
    try {
      console.log("Fetching file by ID:", id);
      const response = await fetch(
        `${API_BASE_URL}/student/mindmaps/files/${id}`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      const result = await this.handleResponse(response, "Fetch file");
      const file = result.data || result;
      console.log("File fetched successfully:", file);
      return file;
    } catch (error) {
      console.error("Error fetching file:", error);
      throw error;
    }
  }
}

export const mindmapAPI = new MindmapAPI();
