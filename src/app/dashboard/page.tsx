import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  FileText,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Header variant="admin" title="EDUMENTUM Admin" />

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Tổng người dùng
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">1,234</div>
              <p className="text-muted-foreground text-xs">
                <span className="text-green-600">+12%</span> so với tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Khóa học</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">89</div>
              <p className="text-muted-foreground text-xs">
                <span className="text-green-600">+5</span> khóa học mới
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Bài kiểm tra
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">456</div>
              <p className="text-muted-foreground text-xs">
                <span className="text-blue-600">+23</span> bài mới
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Hoạt động</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">2,847</div>
              <p className="text-muted-foreground text-xs">
                <span className="text-green-600">+18%</span> so với tuần trước
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý người dùng</CardTitle>
              <CardDescription>
                Quản lý tài khoản, phân quyền và kiểm duyệt người dùng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Người dùng đã xác thực</p>
                    <p className="text-muted-foreground text-sm">
                      1,156 tài khoản
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Xem chi tiết
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Chờ kiểm duyệt</p>
                    <p className="text-muted-foreground text-sm">
                      23 tài khoản
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Kiểm duyệt
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quản lý nội dung</CardTitle>
              <CardDescription>
                Kiểm duyệt bài viết, khóa học và báo cáo vi phạm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Nội dung đã duyệt</p>
                    <p className="text-muted-foreground text-sm">
                      1,847 bài viết
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Xem chi tiết
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Báo cáo vi phạm</p>
                    <p className="text-muted-foreground text-sm">12 báo cáo</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Xử lý
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Theo dõi các hoạt động mới nhất trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Người dùng mới đăng ký",
                  user: "Nguyễn Văn A",
                  time: "2 phút trước",
                  type: "user",
                },
                {
                  action: "Khóa học mới được tạo",
                  user: "Giáo viên B",
                  time: "15 phút trước",
                  type: "course",
                },
                {
                  action: "Bài kiểm tra hoàn thành",
                  user: "Học sinh C",
                  time: "1 giờ trước",
                  type: "exam",
                },
                {
                  action: "Báo cáo vi phạm mới",
                  user: "Hệ thống",
                  time: "2 giờ trước",
                  type: "report",
                },
                {
                  action: "Cập nhật hệ thống",
                  user: "Admin",
                  time: "3 giờ trước",
                  type: "system",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 rounded-lg border p-4"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${activity.type === "user"
                        ? "bg-blue-500"
                        : activity.type === "course"
                          ? "bg-green-500"
                          : activity.type === "exam"
                            ? "bg-purple-500"
                            : activity.type === "report"
                              ? "bg-red-500"
                              : "bg-gray-500"
                      }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-muted-foreground text-sm">
                      bởi {activity.user}
                    </p>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
