# Contributing to EDUMENTUM

## Code Formatting Standards

Để đảm bảo code nhất quán giữa các thành viên trong team, hãy tuân thủ các quy tắc sau:

### 1. Cài đặt Extensions

Cài đặt các VS Code extensions được khuyến nghị:
- **Biome** - Code formatter và linter chính
- **Tailwind CSS IntelliSense** - Hỗ trợ Tailwind CSS
- **Prettier** - Backup formatter
- **TypeScript** - Hỗ trợ TypeScript

### 2. Cấu hình Editor

Đảm bảo VS Code sử dụng đúng cấu hình:
- Format on Save: **Bật**
- Default Formatter: **Biome**
- Tab Size: **2 spaces**
- Insert Spaces: **Bật**
- End of Line: **LF**

### 3. Quy tắc Formatting

#### Indentation
- Sử dụng **2 spaces** cho indentation
- Không sử dụng tabs

#### Line Length
- Giới hạn 80 ký tự mỗi dòng
- Tự động wrap khi vượt quá

#### Quotes
- Sử dụng **double quotes** cho strings
- Sử dụng **single quotes** cho JSX attributes khi cần

#### Semicolons
- **Luôn** sử dụng semicolons ở cuối statements

#### Trailing Commas
- Sử dụng trailing commas trong objects và arrays

### 4. Commands

Trước khi commit, chạy các lệnh sau:

```bash
# Format code
pnpm format

# Lint và fix
pnpm lint:fix

# Type check
pnpm typecheck

# Kiểm tra tất cả
pnpm check
```

### 5. Git Hooks

Project sử dụng Husky để tự động format code trước khi commit:
- Pre-commit: Format và lint code
- Commit-msg: Kiểm tra commit message format

### 6. File Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # Reusable components
│   ├── ui/       # Base UI components
│   └── features/ # Feature-specific components
├── hooks/        # Custom React hooks
├── lib/          # Utility functions
└── types/        # TypeScript type definitions
```

### 7. Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Files**: kebab-case (e.g., `user-profile.tsx`)
- **Functions**: camelCase (e.g., `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `UserProfileProps`)

### 8. Import Order

1. React imports
2. Third-party libraries
3. Internal components
4. Hooks
5. Utilities
6. Types
7. Styles

### 9. Common Issues & Solutions

#### Lỗi thụt đầu dòng
```bash
# Fix formatting
pnpm format
```

#### Lỗi import không sử dụng
```bash
# Auto-fix imports
pnpm lint:fix
```

#### Lỗi TypeScript
```bash
# Check types
pnpm typecheck
```

### 10. IDE Setup

#### VS Code
1. Cài đặt extensions từ `.vscode/extensions.json`
2. Reload VS Code
3. Đảm bảo Biome là default formatter

#### WebStorm/IntelliJ
1. Cài đặt Biome plugin
2. Cấu hình formatter settings
3. Enable format on save

### 11. Troubleshooting

Nếu gặp lỗi formatting:
1. Chạy `pnpm format`
2. Chạy `pnpm lint:fix`
3. Kiểm tra `.editorconfig` settings
4. Restart editor

### 12. Team Workflow

1. **Pull latest changes**: `git pull origin main`
2. **Create feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** và format code
4. **Test locally**: `pnpm dev`
5. **Commit changes**: `git commit -m "feat: add new feature"`
6. **Push branch**: `git push origin feature/your-feature`
7. **Create Pull Request**

---

**Lưu ý**: Luôn chạy `pnpm format` và `pnpm lint:fix` trước khi commit để đảm bảo code nhất quán!
