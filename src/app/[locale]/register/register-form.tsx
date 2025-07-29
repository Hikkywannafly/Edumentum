"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {
  const t = useTranslations("RegisterPage");
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
      setErrorMsg(t("error.passwordNotMatch"));
      return;
    }

    // Xử lý đăng ký ở đây...
    if (email && password) {
      router.push("dashboard"); // hoặc trang đăng nhập
    }
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-border p-8 shadow-lg">
      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="mb-2 font-bold text-2xl text-foreground">
            {t("register")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("registerDesc")}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-red-600 text-sm dark:border-red-400 dark:bg-red-900 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label
              className="mb-2 block font-medium text-foreground text-sm"
              htmlFor="email"
            >
              {t("email")}
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <label
              className="mb-2 block font-medium text-foreground text-sm"
              htmlFor="password"
            >
              {t("password")}
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
              className="mb-2 block font-medium text-foreground text-sm"
              htmlFor="password-confirmation"
            >
              {t("confirmPassword")}
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••••"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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

          <Button type="submit" className="w-full">
            {t("register")}
          </Button>
        </form>

        <p className="mt-6 text-center text-muted-foreground text-sm">
          {t("alreadyAccount")}{" "}
          <a
            href="login"
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            {t("login")}
          </a>
        </p>

        <p className="mt-4 text-center text-muted-foreground text-xs">
          {t("recaptchaNotice")}{" "}
          <a href="example" className="underline hover:text-gray-600">
            {t("terms")}
          </a>
        </p>
      </div>
    </div>
  );
}
