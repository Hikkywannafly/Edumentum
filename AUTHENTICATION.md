# Hệ thống Authentication với Zod Validation và React Hook Form

## Tổng quan

Hệ thống authentication đã được tích hợp với Zod validation và React Hook Form, hỗ trợ:
- Đăng nhập/Đăng ký với validation
- Đăng nhập Google
- Chọn role (Student/Teacher)
- Bảo vệ routes
- Type safety với TypeScript
- Form management với React Hook Form

## Cấu trúc Files

```
src/
├── lib/
│   ├── schemas/
│   │   └── auth.ts              # Zod schemas cho validation
│   └── api/
│       └── auth.ts              # API client cho authentication
├── contexts/
│   └── auth-context.tsx         # Auth context và hooks
├── components/
│   ├── auth/
│   │   ├── role-selector.tsx    # Component chọn role
│   │   └── auth-guard.tsx       # Component bảo vệ routes
│   └── ui/
│       ├── form-input.tsx       # Reusable form input component
│       └── index.ts             # UI components exports
├── app/
│   └── [locale]/
│       ├── login/
│       │   ├── page.tsx         # Trang đăng nhập
│       │   └── login-form.tsx   # Form đăng nhập với React Hook Form
│       ├── register/
│       │   ├── page.tsx         # Trang đăng ký
│       │   └── register-form.tsx # Form đăng ký với React Hook Form
│       └── role-selector/
│           └── page.tsx         # Trang chọn role
└── middleware.ts                # Middleware bảo vệ routes
```

## Dependencies

```bash
pnpm add zod react-hook-form @hookform/resolvers
```

## API Endpoints

### 1. Đăng nhập
```
POST /api/v1/auth/login
Body: { email: string, password: string }
```

### 2. Đăng ký
```
POST /api/v1/auth/register
Body: { email: string, password: string }
```

### 3. Đăng nhập Google
```
POST /api/v1/auth/google
Body: { code: string }
```

### 4. Chọn Role
```
POST /api/v1/auth/select-role
Body: { roleId: number }
```

### 5. Refresh Token
```
POST /api/v1/auth/refresh
Body: { refreshToken: string }
```

## Response Format

```typescript
{
  "data": {
    "accessToken": "jwt_token_here",
    "user": {
      "userId": 9,
      "username": "johndoe1",
      "gmail": "johndoe1@gmail.com",
      "roles": ["ROLE_STUDENT"],
      "isActive": true
    },
    "refreshToken": "refresh_token_here"
  },
  "message": "User registered successfully",
  "status": "success"
}
```

## Zod Schemas

### Login Schema
```typescript
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
```

### Register Schema
```typescript
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

### Role Schema
```typescript
const roleSchema = z.object({
  roleId: z.number().refine((val) => val === 2 || val === 3, {
    message: "Please select a valid role",
  }),
});
```

## React Hook Form Integration

### 1. Form Setup với Zod Resolver

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";

const {
  register,
  handleSubmit,
  formState: { errors },
  setError,
} = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    email: "",
    password: "",
  },
});
```

### 2. Form Input Component

```tsx
import { FormInput } from "@/components/ui/form-input";

<FormInput
  label="Email"
  type="email"
  placeholder="your@email.com"
  error={errors.email?.message}
  showPasswordToggle={true}
  {...register("email")}
/>
```

### 3. Form Submission

```tsx
const onSubmit = async (data: LoginFormData) => {
  try {
    await login(data.email, data.password);
    router.push("/dashboard");
  } catch (error) {
    setError("root", {
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
};

<form onSubmit={handleSubmit(onSubmit)}>
  {/* form fields */}
</form>
```

## Cách sử dụng

### 1. Sử dụng Auth Context

```tsx
import { useAuth } from "@/contexts/auth-context";

function MyComponent() {
  const {
    user,
    isAuthenticated,
    hasRole,
    login,
    register,
    logout
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login("user@example.com", "password123");
      // Redirect to dashboard
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.username}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 2. Bảo vệ Routes với AuthGuard

```tsx
import { AuthGuard } from "@/components/auth/auth-guard";

// Trang yêu cầu authentication và role
function DashboardPage() {
  return (
    <AuthGuard requireAuth={true} requireRole={true}>
      <div>Dashboard content</div>
    </AuthGuard>
  );
}

// Trang chỉ yêu cầu authentication
function ProfilePage() {
  return (
    <AuthGuard requireAuth={true} requireRole={false}>
      <div>Profile content</div>
    </AuthGuard>
  );
}
```

### 3. Sử dụng API Client

```tsx
import { authAPI } from "@/lib/api/auth";

// Đăng nhập
const response = await authAPI.login({
  email: "user@example.com",
  password: "password123"
});

// Đăng ký
const response = await authAPI.register({
  email: "user@example.com",
  password: "password123",
  confirmPassword: "password123"
});

// Chọn role
const response = await authAPI.selectRole({
  roleId: 2 // ROLE_STUDENT
});
```

## Flow Authentication

1. **User truy cập trang** → Middleware kiểm tra
2. **Nếu chưa đăng nhập** → Redirect to `/login`
3. **User đăng nhập** → React Hook Form validation → API call
4. **Nếu thành công** → Lưu token và user info
5. **Kiểm tra role** → Nếu chưa có role → Redirect to `/role-selector`
6. **Chọn role** → API call để gán role
7. **Hoàn thành** → Redirect to `/dashboard`

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Features

### ✅ Đã hoàn thành:
- [x] Zod validation cho tất cả forms
- [x] React Hook Form integration
- [x] Reusable FormInput component
- [x] Type-safe API client
- [x] Auth context với localStorage persistence
- [x] Role-based access control
- [x] Protected routes với middleware
- [x] Loading states và error handling
- [x] Dark mode support
- [x] Internationalization (i18n)
- [x] Responsive design
- [x] Password visibility toggle
- [x] Form validation với real-time feedback

### 🔄 Cần thêm:
- [ ] Google OAuth integration
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Remember me functionality
- [ ] Session timeout handling
- [ ] Rate limiting
- [ ] CSRF protection

## Performance Optimizations

1. **Server Components**: Sử dụng cho layout, navigation
2. **Client Components**: Chỉ cho interactive parts
3. **Zod validation**: Runtime type checking
4. **React Hook Form**: Efficient form state management
5. **LocalStorage**: Persistent auth state
6. **Middleware**: Route protection at edge

## Security Considerations

1. **HTTPS only**: Đảm bảo API calls qua HTTPS
2. **Token storage**: Access token trong memory, refresh token trong httpOnly cookie
3. **Input validation**: Zod validation cho tất cả inputs
4. **Error handling**: Không expose sensitive information
5. **Rate limiting**: Implement ở API level
6. **CSRF protection**: Sử dụng CSRF tokens

## Troubleshooting

### Lỗi thường gặp:

1. **"Invalid email address"** → Kiểm tra format email
2. **"Password must be at least 6 characters"** → Tăng độ dài password
3. **"Passwords don't match"** → Đảm bảo confirm password khớp
4. **"Please select a valid role"** → Chọn role 2 (Student) hoặc 3 (Teacher)

### Debug:

```tsx
// Kiểm tra auth state
const { user, isAuthenticated, hasRole } = useAuth();
console.log({ user, isAuthenticated, hasRole });

// Kiểm tra localStorage
console.log("Access Token:", localStorage.getItem("accessToken"));
console.log("User:", localStorage.getItem("user"));

// Kiểm tra form state
const { formState } = useForm();
console.log("Form errors:", formState.errors);
console.log("Form values:", formState.values);
```

## Best Practices

### 1. Form Validation
- Sử dụng Zod schemas cho type-safe validation
- Implement real-time validation với React Hook Form
- Hiển thị error messages rõ ràng và accessible

### 2. Error Handling
- Catch và handle tất cả API errors
- Sử dụng `setError` để hiển thị form-level errors
- Implement retry logic cho network failures

### 3. UX/UI
- Loading states cho tất cả async operations
- Disable buttons khi form đang submit
- Clear error messages khi user bắt đầu type
- Password visibility toggle cho better UX

### 4. Security
- Validate input ở cả client và server
- Sanitize user input
- Implement proper session management
- Use secure token storage
