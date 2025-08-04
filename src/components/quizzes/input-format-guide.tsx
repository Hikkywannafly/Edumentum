"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Download, FileText } from "lucide-react";
import { useState } from "react";

export function InputFormatGuide() {
  const [copied, setCopied] = useState(false);

  const templateExample = `# Quiz Title: Lịch sử Việt Nam Cơ bản
# Description: Kiểm tra kiến thức về lịch sử Việt Nam

## Question 1
**Type:** MULTIPLE_CHOICE
**Difficulty:** EASY
**Points:** 10
**Question:** Trong cuộc khai thác thuộc địa lần thứ hai ở Đông Dương 1919-1929, thực dân Pháp tập trung đầu tư vào
**Answers:**
- A. Ngành chế tạo máy ✓
- B. Công nghiệp luyện kim
- C. Đồn điền cao su
- D. Công nghiệp hóa chất
**Explanation:** Pháp tập trung đầu tư vào ngành chế tạo máy trong cuộc khai thác thuộc địa lần thứ hai.

## Question 2
**Type:** TRUE_FALSE
**Difficulty:** MEDIUM
**Points:** 5
**Question:** Việt Nam giành độc lập vào năm 1945
**Answers:**
- True ✓
- False
**Explanation:** Ngày 2/9/1945, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập.

## Question 3
**Type:** FILL_BLANK
**Difficulty:** HARD
**Points:** 15
**Question:** Thủ đô của Việt Nam là _____
**Correct Answer:** Hà Nội
**Explanation:** Hà Nội là thủ đô của Việt Nam từ năm 1010.`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(templateExample);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([templateExample], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz-template.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Input Format Guide
        </CardTitle>
        <CardDescription>
          Hướng dẫn format để tạo quiz từ file text
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Format Rules */}
        <div className="space-y-3">
          <h4 className="font-medium">Format Rules:</h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">#</Badge>
              <span className="text-sm">Quiz title và description</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">##</Badge>
              <span className="text-sm">Bắt đầu câu hỏi mới</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">**Type:**</Badge>
              <span className="text-sm">
                Loại câu hỏi (MULTIPLE_CHOICE, TRUE_FALSE, FILL_BLANK,
                FREE_RESPONSE)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">**Difficulty:**</Badge>
              <span className="text-sm">Độ khó (EASY, MEDIUM, HARD)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">**Points:**</Badge>
              <span className="text-sm">Điểm số cho câu hỏi</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">✓</Badge>
              <span className="text-sm">Đánh dấu đáp án đúng</span>
            </div>
          </div>
        </div>

        {/* Template Example */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Template Example:</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          <div className="rounded-md bg-gray-50 p-4">
            <pre className="overflow-x-auto whitespace-pre-wrap text-sm">
              {templateExample}
            </pre>
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-md bg-blue-50 p-4">
          <h4 className="mb-2 font-medium text-blue-900">💡 Tips:</h4>
          <ul className="space-y-1 text-blue-800 text-sm">
            <li>• Sử dụng ✓ để đánh dấu đáp án đúng</li>
            <li>• Mỗi câu hỏi phải có ít nhất 1 đáp án đúng</li>
            <li>• FILL_BLANK cần có Correct Answer</li>
            <li>• FREE_RESPONSE không cần answers, chỉ cần explanation</li>
            <li>• Có thể sử dụng HTML tags trong question text</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
