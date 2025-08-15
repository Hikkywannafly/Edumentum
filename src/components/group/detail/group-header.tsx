import { Gift, LucideSettings, Store } from "lucide-react";
import { LocalizedLink } from "../../localized-link";
import { Button } from "../../ui";

interface GroupHeaderProps {
  name?: string;
  description?: string;
  id?: number;
  onOpenSettings?: () => void; // thêm prop mới
  onOpenGift?: () => void; // thêm prop mới
}

export default function GroupHeader({
  name = "Nhóm chưa có tên",
  description = "",
  id,
  onOpenSettings,
  onOpenGift,
}: GroupHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-bold text-3xl text-gray-900 dark:text-gray-50">
          {name}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {description || "Không có mô tả"}
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={onOpenGift} variant="outline">
          <Gift className="h-4 w-4" />
        </Button>
        <LocalizedLink href={`/group/${id}/store`}>
          <Button variant="outline">
            <Store className="h-4 w-4" />
            Kho lưu trữ
          </Button>
        </LocalizedLink>
        <Button onClick={onOpenSettings} aria-label="Cài đặt nhóm">
          <LucideSettings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
