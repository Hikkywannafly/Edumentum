// app/login/page.tsx
"use client";

import { BaseLayout } from "@/components/layout";
import  WideContainer  from "@/components/layout/wide-layout";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Giả lập kiểm tra đăng nhập
    if (email === "admin@example.com" && password === "123456") {
      router.push("/dashboard"); // Chuyển hướng sau khi đăng nhập
    } else {
      setErrorMsg("Sai email hoặc mật khẩu.");
    }
  };

  return (
    <BaseLayout>
      <WideContainer>
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
            <h2 className="mb-6 text-center font-bold text-2xl">Đăng nhập</h2>

            {errorMsg && (
              <div className="mb-4 text-center text-red-500 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="mb-1 block font-medium text-sm">Email</label>
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="mb-1 block font-medium text-sm">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-blue-500 py-2 text-white transition duration-200 hover:bg-blue-600"
              >
                Đăng nhập
              </button>
            </form>
          </div>
        </div>
      </WideContainer>
    </BaseLayout>
  );
}
