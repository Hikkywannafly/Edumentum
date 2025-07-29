import { BaseLayout } from "@/components/layout";
import WideContainer from "@/components/layout/wide-layout";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import RegisterForm from "./register-form";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("RegisterPage");

  return (
    <BaseLayout>
      <WideContainer>
        <div className="flex min-h-screen">
          {/* Left side: Info */}
          <div className="flex flex-1 flex-col justify-center px-12 py-16">
            <div className="max-w-lg">
              <h1 className="mb-8 font-bold text-4xl text-gray-900 leading-tight">
                {t("title")} <br />
                <span className="text-blue-600 underline underline-offset-4">
                  Edumentum
                </span>
              </h1>
              <p className="text-gray-600">
                {t("subtitle")}
              </p>
            </div>
          </div>

          {/* Right side: Register form */}
          <div className="flex flex-1 items-center justify-center bg-gray-50 px-8 py-16">
            <RegisterForm />
          </div>
        </div>
      </WideContainer>
    </BaseLayout>
  );
}
