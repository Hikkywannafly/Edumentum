"use client";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { useAuth } from "@/contexts/auth-context";
import { type LoginFormData, loginSchema } from "@/lib/schemas/auth";
import { getLocaleFromPathname } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Facebook, Github } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginForm() {
  const t = useTranslations("LoginPage");
  const { login, isLoading } = useAuth();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success(t("loginSuccess") || "Login successful!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl p-6 shadow-lg sm:p-8 ">
      <div className="-z-10 absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <div>
        <h2 className="mb-2 font-bold text-2xl text-foreground">
          {t("login")}
        </h2>
        {/* <p className="text-muted-foreground text-sm">{t("loginDesc")}</p> */}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          label={t("email")}
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register("email")}
        />

        <FormInput
          label={t("password")}
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          showPasswordToggle={true}
          {...register("password")}
        />

        <div className="text-right">
          <a
            href="reset-password"
            className="font-medium text-blue-600 text-sm transition-colors hover:text-blue-800"
          >
            {t("forgotPassword")}
          </a>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("loggingIn") : t("login")}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-gray-200 border-t dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500 dark:bg-gray-900">
            {t("orContinueWith")}
          </span>
        </div>
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="flex items-center justify-center rounded-xl border-gray-200 py-3 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
        >
          <div className="h-5 w-5 rounded bg-gradient-to-br from-red-400 to-red-600" />
        </Button>
        <Button
          variant="outline"
          className="flex items-center justify-center rounded-xl border-gray-200 py-3 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
        >
          <Facebook className="h-5 w-5 text-blue-600" />
        </Button>
        <Button
          variant="outline"
          className="flex items-center justify-center rounded-xl border-gray-200 py-3 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
        >
          <Github className="h-5 w-5" />
        </Button>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-gray-600 text-sm">
        {t("noAccount")}{" "}
        <Link
          href={`/${locale}/register`}
          className="font-semibold text-blue-600 transition-colors hover:text-blue-800"
        >
          {t("register")}
        </Link>
      </p>
    </div>
  );
}
