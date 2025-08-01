"use client";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import ThinLayout from "../layout/thin-layout";

export function QuizzesContent() {
  const t = useTranslations("Quizzes");

  return (
    <ThinLayout classNames=" flex-1 space-y-6 p-6">
      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="max-w-md flex-1">
          <div className="relative">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("searchPlaceholder")} className="pl-8" />
          </div>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-transparent"
        >
          <Filter className="h-4 w-4" />
          {t("filters")}
        </Button>
      </div>

      {/* Stats */}

      <Card className="border-2 border-dashed">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">{t("createCTA.title")}</h3>
              <p className="text-muted-foreground text-sm">
                {t("createCTA.description")}
              </p>
            </div>
            <LocalizedLink href="quizzes/create">
              <Button>{t("createCTA.button")}</Button>
            </LocalizedLink>
          </div>
        </CardContent>
      </Card>
    </ThinLayout>
  );
}
