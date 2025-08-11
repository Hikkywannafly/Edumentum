"use client";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { useAuth } from "@/contexts/auth-context";
import { type RegisterFormData, registerSchema } from "@/lib/schemas/auth";
import { getLocaleFromPathname } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function RegisterForm() {
  const t = useTranslations("RegisterPage");
  const router = useRouter();
  const pathname = usePathname();
  const { register: registerUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.username, data.email, data.password);
      console.log("registerUser", data);
      toast.success(t("registerSuccess") || "Registration successful!");
      const locale = getLocaleFromPathname(pathname);
      router.push(`/${locale}/setup`);
    } catch (error) {
      console.log("error", error);
      toast.error(
        error instanceof Error ? error.message : "Registration failed",
      );
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl p-6 shadow-lg sm:p-8">
      <div className="-z-10 absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="mb-2 font-bold text-2xl text-foreground">
            {t("register")}
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Create your account to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            label={t("username")}
            type="text"
            placeholder="Choose a username"
            error={errors.username?.message}
            {...register("username")}
          />

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
            placeholder="Create a password"
            error={errors.password?.message}
            showPasswordToggle={true}
            {...register("password")}
          />

          <FormInput
            label={t("confirmPassword")}
            type="password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            showPasswordToggle={true}
            {...register("confirmPassword")}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("registering") : t("register")}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-gray-600 text-sm">
          {t("alreadyAccount")}{" "}
          <a
            href="login"
            className="font-semibold text-purple-600 transition-colors hover:text-purple-800"
          >
            {t("login")}
          </a>
        </p>
      </div>
    </div>
  );
}
