"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Facebook } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const t = useTranslations("LoginPage");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "tungnt@softech.vn" && password === "123456789") {
      router.push("dashboard");
    } else {
      setErrorMsg(t("error.invalidCredentials"));
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border p-6 shadow-lg sm:p-8">
      <div>
        <h2 className="mb-2 font-bold text-2xl text-foreground">{t("login")}</h2>
        <p className="text-muted-foreground text-sm">{t("loginDesc")}</p>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-red-600 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
            className="-translate-y-1/2 absolute top-[68%] right-3 mt-0 transform text-gray-400 hover:text-gray-600"
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
            {t("forgotPassword")}
          </a>
        </div>
        <Button type="submit" className="w-full">
          {t("login")}
        </Button>
      </form>

      <div className="mt-6 text-center text-gray-500 text-sm">
        {t("orContinueWith")}
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <Button variant="outline" className="flex items-center justify-center">
          <div className="h-5 w-5 rounded bg-blue-500" />
        </Button>
        <Button variant="outline" className="flex items-center justify-center">
          <Facebook className="h-5 w-5" />
        </Button>
        <Button variant="outline" className="flex items-center justify-center">
          <div className="h-5 w-5 rounded bg-gray-800" />
        </Button>
      </div>

      <p className="mt-6 text-center text-gray-600 text-sm">
        {t("noAccount")}{" "}
        <a
          href="register"
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {t("register")}
        </a>
      </p>
      <p className="mt-4 text-center text-gray-400 text-xs">
        {t("recaptchaNotice")}{" "}
        <a href="example" className="underline hover:text-gray-600">
          {t("terms")}
        </a>
      </p>
    </div>
  );
}
