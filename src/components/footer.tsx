import { BookOpen } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">EDUMENTUM</span>
            </div>
            <p className="text-muted-foreground">
              Nền tảng học tập thông minh cho tương lai giáo dục.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Sản phẩm</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href=" " className="hover:text-primary">
                  Tính năng
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  Khóa học
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  Cộng đồng
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  Báo cáo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Hỗ trợ</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href=" " className="hover:text-primary">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  FAQ
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  Tài liệu
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Công ty</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href=" " className="hover:text-primary">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  Tuyển dụng
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  Bảo mật
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  Điều khoản
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 EDUMENTUM. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };

