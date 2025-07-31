import {
  type AuthResponse,
  type LoginFormData,
  type RegisterFormData,
  type RoleFormData,
  authResponseSchema,
  loginSchema,
  registerSchema,
  roleSelectionSchema,
} from "@/lib/schemas/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class AuthAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
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

  async login(credentials: LoginFormData): Promise<AuthResponse> {
    // Validate input
    const validatedData = loginSchema.parse(credentials);

    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(validatedData),
    });
    console.log("auth test login", response);
    return authResponseSchema.parse(response);
  }

  async register(userData: RegisterFormData): Promise<AuthResponse> {
    // Validate input
    const validatedData = registerSchema.parse(userData);

    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password,
      }),
    });
    console.log("auth test register", validatedData, response);
    // Validate response
    return authResponseSchema.parse(response);
  }

  async googleAuth(token: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
    });

    // Validate response
    return authResponseSchema.parse(response);
  }

  async selectRole(roleData: RoleFormData): Promise<AuthResponse> {
    const validatedData = roleSelectionSchema.parse(roleData);

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token available");
    }
    const apiData = {
      roleName: validatedData.roleId,
    };
    const requestConfig = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    };
    const url = `${API_BASE_URL}/guest/set-user-role`;
    const response = await fetch(url, requestConfig);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data as AuthResponse;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });

    // Validate response
    return authResponseSchema.parse(response);
  }
}

export const authAPI = new AuthAPI();
