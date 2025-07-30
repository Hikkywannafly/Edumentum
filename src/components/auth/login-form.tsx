"use client";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { useAuth } from "@/contexts/auth-context";
import { type LoginFormData, loginSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Facebook } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginForm() {
  const t = useTranslations("LoginPage");
  const router = useRouter();
  const { login, isLoading } = useAuth();

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
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl p-6 shadow-lg sm:p-8 ">
      <div>
        <h2 className="mb-2 font-bold text-2xl text-foreground">{t("login")}</h2>
        <p className="text-muted-foreground text-sm">{t("loginDesc")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <FormInput
          label={t("email")}
          type="email"
          placeholder="your@email.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <FormInput
          label={t("password")}
          type="password"
          placeholder="••••••••••"
          error={errors.password?.message}
          showPasswordToggle={true}
          {...register("password")}
        />

        <div className="text-right">
          <a
            href="reset-password"
            className="text-blue-600 text-sm hover:text-blue-800 hover:underline"
          >
            {t("forgotPassword")}
          </a>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("loggingIn") : t("login")}
        </Button>
      </form>

      <div className="mt-6 text-center text-muted-foreground text-sm">
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

      <p className="mt-6 text-center text-muted-foreground text-sm">
        {t("noAccount")}{" "}
        <a
          href="register"
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {t("register")}
        </a>
      </p>
      <p className="mt-4 text-center text-muted-foreground text-xs">
        {t("recaptchaNotice")}{" "}
        <a href="example" className="underline hover:text-foreground">
          {t("terms")}
        </a>
      </p>
    </div>
  );
}
