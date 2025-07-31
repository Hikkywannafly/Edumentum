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
      toast.error(error instanceof Error ? error.message : "Registration failed");
    }
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl p-8 shadow-lg">
      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="mb-2 font-bold text-2xl text-foreground">
            {t("register")}
          </h2>
          {/* <p className="text-muted-foreground text-sm">
            {t("registerDesc")}
          </p> */}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col space-y-4">

          <FormInput
            label={t("username")}
            type="text"
            placeholder="username"
            error={errors.username?.message}
            {...register("username")}
          />
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
            error={errors.password?.message}
            showPasswordToggle={true}
            {...register("password")}
          />

          <FormInput
            label={t("confirmPassword")}
            type="password"

            error={errors.confirmPassword?.message}
            showPasswordToggle={true}
            {...register("confirmPassword")}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("registering") : t("register")}
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

        {/* <p className="mt-4 text-center text-muted-foreground text-xs">
          {t("recaptchaNotice")}{" "}
          <a href="example" className="underline hover:text-foreground">
            {t("terms")}
          </a>
        </p> */}
      </div>
    </div>
  );
}
