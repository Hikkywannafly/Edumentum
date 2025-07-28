"use client";

import { BaseLayout } from "@/components/layout";
import WideContainer from "@/components/layout/wide-layout";
import { Eye, EyeOff, Facebook } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "tungnt@softech.vn" && password === "123456789") {
      router.push("/dashboard");
    } else {
      setErrorMsg("Sai email hoặc mật khẩu.");
    }
  };

  return (
    <BaseLayout>
      <WideContainer>
        <div className="flex min-h-screen flex-col md:flex-row">
          {/* Left side */}
          <div className="flex w-full flex-col justify-center bg-white px-6 py-12 sm:px-10 md:w-1/2 md:px-12 md:py-16">
            <div className="mx-auto max-w-lg md:mx-0">
              <h1 className="mb-8 font-bold text-3xl text-gray-900 leading-tight sm:text-4xl">
                Nền tảng học tập <br />
                trực tuyến dành riêng <br />
                <span className="text-blue-600 underline underline-offset-4">
                  cho học sinh
                </span>
              </h1>

              <div className="space-y-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-gray-700 text-sm">
                  + Học theo lộ trình
                </div>
                <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-gray-700 text-sm">
                  + Cá nhân hóa học tập
                </div>
                <div className="rounded-lg border border-purple-100 bg-purple-50 px-4 py-3 text-gray-700 text-sm">
                  + Cộng đồng học tập rộng lớn
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex w-full items-center justify-center bg-gray-50 px-6 py-12 sm:px-10 md:w-1/2 md:px-12 md:py-16">
            <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8">
              <div>
                <h2 className="mb-2 font-bold text-2xl text-gray-900">
                  Đăng nhập
                </h2>
                <p className="text-gray-600 text-sm">
                  Học lập trình cùng với hàng triệu người với Edumentum
                </p>
              </div>

              {errorMsg && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-red-600 text-sm">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div>
                  <label
                    className="mb-2 block font-medium text-gray-700 text-sm"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="nhathao743@example.com"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="-translate-y-1/2 absolute top-1/2 right-3 mt-0 transform text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="text-right">
                  <a
                    href="reset-password"
                    className="text-blue-600 text-sm hover:text-blue-800 hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  Đăng nhập
                </button>
              </form>

              <div className="mt-6 text-center text-gray-500 text-sm">
                Hoặc tiếp tục với
              </div>

              <div className="mt-4 flex justify-center space-x-4">
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg border border-gray-300 p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <div className="h-5 w-5 rounded bg-blue-500" />
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg border border-gray-300 p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <Facebook className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg border border-gray-300 p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <div className="h-5 w-5 rounded bg-gray-800" />
                </button>
              </div>

              <p className="mt-6 text-center text-gray-600 text-sm">
                Nếu bạn chưa có tài khoản, vui lòng{" "}
                <a
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Đăng ký
                </a>
              </p>

              <p className="mt-4 text-center text-gray-400 text-xs">
                Trang này được bảo vệ bởi reCAPTCHA và áp dụng{" "}
                <a href="example" className="underline hover:text-gray-600">
                  Điều khoản sử dụng
                </a>
              </p>
            </div>
          </div>
        </div>
      </WideContainer>
    </BaseLayout>
  );
}
