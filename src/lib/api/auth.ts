import { authResponseSchema, loginSchema, registerSchema, roleSchema, type AuthResponse, type LoginFormData, type RegisterFormData, type RoleFormData } from "@/lib/schemas/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

class AuthAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
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
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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

    // Validate response
    return authResponseSchema.parse(response);
  }

  async register(userData: RegisterFormData): Promise<AuthResponse> {
    // Validate input
    const validatedData = registerSchema.parse(userData);
    
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: validatedData.email,
        password: validatedData.password,
      }),
    });

    // Validate response
    return authResponseSchema.parse(response);
  }

  async googleAuth(code: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    // Validate response
    return authResponseSchema.parse(response);
  }

  async selectRole(roleData: RoleFormData): Promise<AuthResponse> {
    // Validate input
    const validatedData = roleSchema.parse(roleData);
    
    const response = await this.request<AuthResponse>("/auth/select-role", {
      method: "POST",
      body: JSON.stringify(validatedData),
    });

    // Validate response
    return authResponseSchema.parse(response);
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