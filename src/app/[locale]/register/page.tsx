"use client";

import { BaseLayout } from "@/components/layout";
import WideContainer from "@/components/layout/wide-layout";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    // Xử lý đăng ký ở đây...
    if (email && password) {
      router.push("/dashboard"); // hoặc trang đăng nhập
    }
  };

  return (
    <BaseLayout>
      <WideContainer>
        <div className="flex min-h-screen">
          {/* Left side: Info */}
          <div className="flex flex-1 flex-col justify-center px-12 py-16">
            <div className="max-w-lg">
              <h1 className="mb-8 font-bold text-4xl text-gray-900 leading-tight">
                Bắt đầu hành trình học tập <br />
                của bạn với{" "}
                <span className="text-blue-600 underline underline-offset-4">
                  Edumentum
                </span>
              </h1>
              <p className="text-gray-600">
                Tham gia cộng đồng hàng triệu học sinh khác.
              </p>
            </div>
          </div>

          {/* Right side: Register form */}
          <div className="flex flex-1 items-center justify-center bg-gray-50 px-8 py-16">
            <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
              <div className="relative z-10">
                <div className="mb-6">
                  <h2 className="mb-2 font-bold text-2xl text-gray-900">
                    Đăng ký
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Tạo tài khoản để học tập miễn phí
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-red-600 text-sm">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label
                      className="mb-2 block font-medium text-gray-700 text-sm"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="relative">
                    <label
                      className="mb-2 block font-medium text-gray-700 text-sm"
                      htmlFor="password"
                    >
                      Mật khẩu
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="-translate-y-1/2 absolute top-1/2 right-3 mt-4 transform text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <label
                      className="mb-2 block font-medium text-gray-700 text-sm"
                      htmlFor="password-confirmation"
                    >
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="-translate-y-1/2 absolute top-1/2 right-3 mt-4 transform text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    Đăng ký
                  </button>
                </form>

                <p className="mt-6 text-center text-gray-600 text-sm">
                  Đã có tài khoản?{" "}
                  <a
                    href="/login"
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Đăng nhập
                  </a>
                </p>

                <p className="mt-4 text-center text-gray-400 text-xs">
                  Bằng việc đăng ký, bạn đồng ý với{" "}
                  <a href="example" className="underline hover:text-gray-600">
                    Điều khoản sử dụng
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </WideContainer>
    </BaseLayout>
  );
}
