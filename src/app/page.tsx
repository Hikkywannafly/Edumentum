import BaseLayout from "@/components/layout/base-layout";
import WideContainer from "@/components/layout/wide-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Award,
  BarChart3,
  BookOpen,
  FileText,
  Lightbulb,
  MessageSquare,
  Play,
  Settings,
  Target,
  Users,
} from "lucide-react";

export default function HomePage() {
  return (
    <BaseLayout>
      {/* Hero Section */}
      <WideContainer padding>
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            🚀 Nền tảng học tập thông minh
          </Badge>
          <h1 className="mb-6 font-bold text-4xl tracking-tight md:text-6xl">
            Học tập cá nhân hóa
            <span className="block text-primary">cho tương lai</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl">
            EDUMENTUM - Hệ thống hỗ trợ học tập toàn diện với lộ trình cá nhân
            hóa, cộng đồng tương tác và phân tích thông minh cho giáo viên và
            học sinh.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="px-8 text-lg">
              <Play className="mr-2 h-5 w-5" />
              Bắt đầu học ngay
            </Button>
            <Button variant="outline" size="lg" className="px-8 text-lg">
              <Users className="mr-2 h-5 w-5" />
              Tham gia cộng đồng
            </Button>
          </div>
        </div>
      </WideContainer>

      {/* Features Section */}
      <WideContainer padding>
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-bold text-3xl md:text-4xl">
            Tính năng nổi bật
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
            Khám phá những công cụ mạnh mẽ giúp việc học tập trở nên hiệu quả và
            thú vị hơn
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Học theo lộ trình</CardTitle>
              <CardDescription>
                Lộ trình học tập được cá nhân hóa từ cơ bản đến nâng cao, theo
                dõi tiến độ chi tiết cho từng bài học.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Lightbulb className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Cá nhân hóa học tập</CardTitle>
              <CardDescription>
                Gợi ý bài học phù hợp, tạo quiz và flashcard cá nhân dựa trên
                kết quả học tập của bạn.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Tạo kỳ thi thông minh</CardTitle>
              <CardDescription>
                Tạo đề thi trắc nghiệm, tự luận với chấm điểm tự động và xuất
                báo cáo chi tiết.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Cộng đồng học tập</CardTitle>
              <CardDescription>
                Diễn đàn hỏi đáp, chia sẻ kiến thức và tương tác với cộng đồng
                học tập năng động.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <BarChart3 className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Báo cáo & thống kê</CardTitle>
              <CardDescription>
                Biểu đồ tiến trình học tập, thống kê kết quả và so sánh hiệu
                suất theo nhóm.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                <Settings className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Quản trị hệ thống</CardTitle>
              <CardDescription>
                Quản lý người dùng, kiểm duyệt nội dung và theo dõi toàn bộ hoạt
                động hệ thống.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </WideContainer>

      {/* User Roles Section */}
      <WideContainer padding>
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-bold text-3xl md:text-4xl">
            Dành cho mọi đối tượng
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
            EDUMENTUM được thiết kế để phục vụ nhu cầu học tập của học sinh,
            giảng dạy của giáo viên và quản lý của admin
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Học Sinh</CardTitle>
              <CardDescription>
                Tham gia khóa học, theo dõi tiến trình, tạo quiz cá nhân, làm
                bài kiểm tra và tham gia cộng đồng học tập.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Bắt đầu học
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Giáo Viên</CardTitle>
              <CardDescription>
                Tạo bài học, đề thi, quản lý lớp học, đánh giá kết quả học sinh
                và tương tác trong cộng đồng.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Tạo khóa học
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Quản Trị Viên</CardTitle>
              <CardDescription>
                Quản lý người dùng, kiểm duyệt nội dung, cấu hình hệ thống và
                theo dõi toàn bộ hoạt động.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Quản lý hệ thống
              </Button>
            </CardContent>
          </Card>
        </div>
      </WideContainer>

      {/* CTA Section */}
      <WideContainer padding classNames="text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 font-bold text-3xl md:text-4xl">
            Sẵn sàng bắt đầu hành trình học tập?
          </h2>
          <p className="mb-8 text-muted-foreground text-xl">
            Tham gia EDUMENTUM ngay hôm nay để trải nghiệm nền tảng học tập
            thông minh và hiệu quả nhất.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="px-8 text-lg">
              Đăng ký miễn phí
            </Button>
            <Button variant="outline" size="lg" className="px-8 text-lg">
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
      </WideContainer>
    </BaseLayout>
  );
}
