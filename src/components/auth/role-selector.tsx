"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { ROLE_OPTIONS } from "@/lib/schemas/auth";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RoleSelector() {
  const t = useTranslations("RoleSelector");
  const { selectRole, isLoading } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    try {
      setError("");
      await selectRole(selectedRole);
      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to select role");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-red-600 text-sm dark:border-red-400 dark:bg-red-900 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {ROLE_OPTIONS.map((role) => (
              <div
                key={role.id}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary ${selectedRole === role.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                  }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{t(`roles.${role.name}.title`)}</h3>
                    <p className="text-muted-foreground text-sm">
                      {t(`roles.${role.name}.description`)}
                    </p>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${selectedRole === role.id
                        ? "border-primary bg-primary"
                        : "border-border"
                      }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleRoleSelect}
            disabled={!selectedRole || isLoading}
            className="w-full"
          >
            {isLoading ? t("selecting") : t("continue")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
