"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, Info } from "lucide-react";

export default function GroupNoteCard() {
  const groupName = "Học tiếng Hàn cấp tốc";

  const groupNote = {
    generalNote:
      "Nhóm dành cho các bạn luyện tập giao tiếp và từ vựng mỗi ngày.",
    reports: [
      {
        date: "2025-08-01",
        content: "Có 10 thành viên mới tham gia trong tháng 7.",
      },
      {
        date: "2025-08-10",
        content: "Tổ chức buổi học online vào thứ 7 tuần này.",
      },
    ],
    reminders: [
      "Không spam quảng cáo.",
      "Giữ thái độ tôn trọng khi tham gia thảo luận.",
    ],
  };

  return (
    <Card className="rounded-xl border dark:border-gray-700">
      <CardHeader className="rounded-t-xl pb-3 dark:bg-blue-900">
        <CardTitle className="flex items-center gap-2 font-semibold text-blue-700 text-lg dark:text-blue-300">
          <Info className="h-5 w-5" /> {groupName} - Notes & Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-6 py-5 text-gray-800 dark:text-gray-300">
        <section>
          <h4 className="mb-2 border-gray-300 border-b pb-1 font-semibold text-lg dark:border-gray-600">
            General Note
          </h4>
          <p className="text-base leading-relaxed">{groupNote.generalNote}</p>
        </section>

        <section>
          <h4 className="mb-2 flex items-center gap-2 border-gray-300 border-b pb-1 font-semibold text-lg dark:border-gray-600">
            <Calendar className="h-5 w-5 text-blue-500" /> Reports
          </h4>
          {groupNote.reports.length > 0 ? (
            <ul className="space-y-3 text-sm">
              {groupNote.reports.map((report, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-blue-50 dark:hover:bg-blue-800"
                >
                  <span className="min-w-[70px] font-mono text-blue-600 text-xs dark:text-blue-400">
                    {report.date}
                  </span>
                  <p className="flex-1">{report.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic dark:text-gray-500">
              No reports available.
            </p>
          )}
        </section>

        <section>
          <h4 className="mb-2 flex items-center gap-2 border-gray-300 border-b pb-1 font-semibold text-lg dark:border-gray-600">
            <Bell className="h-5 w-5 text-yellow-500" /> Reminders
          </h4>
          {groupNote.reminders.length > 0 ? (
            <ul className="list-inside list-disc space-y-1 text-gray-700 text-sm dark:text-gray-400">
              {groupNote.reminders.map((reminder, idx) => (
                <li key={idx}>{reminder}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic dark:text-gray-500">
              No reminders set.
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
