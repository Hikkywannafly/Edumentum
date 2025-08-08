import type {
  GetGroupsAPIResponse,
  GroupRequest,
  GroupResponse,
} from "../../types/group";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class GroupAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const accessToken = localStorage.getItem("accessToken");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };
    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getGroups(): Promise<GroupResponse[]> {
    const response = await this.request<GetGroupsAPIResponse>(
      "/student/groups/public",
    );
    console.log(response.data);
    return response.data;
  }

  async createGroup(createGroup: GroupRequest): Promise<GroupResponse> {
    const response = await this.request<GroupResponse>("/student/groups", {
      method: "POST",
      body: JSON.stringify(createGroup),
    });

    return response;
  }

  async getMyGroups(): Promise<GroupResponse[]> {
    const response = await this.request<GetGroupsAPIResponse>(
      "/student/groups/my-group",
    );
    console.log(response.data);
    return response.data;
  }
}

export const groupAPI = new GroupAPI();
