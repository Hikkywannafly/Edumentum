"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BookOpen, Menu } from "lucide-react";
import { useState } from "react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] bg-background sm:w-[400px]"
      >
        <div className="mb-6 flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">EDUMENTUM</span>
        </div>
        <nav className="flex flex-col space-y-4">
          <button
            type="button"
            className="text-left font-medium text-lg transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Tính năng
          </button>
          <button
            type="button"
            className="text-left font-medium text-lg transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Khóa học
          </button>
          <button
            type="button"
            className="text-left font-medium text-lg transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Cộng đồng
          </button>
          <button
            type="button"
            className="text-left font-medium text-lg transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Về chúng tôi
          </button>
        </nav>
        <div className="mt-8 flex flex-col space-y-4">
          <Button variant="ghost" className="w-full justify-start">
            Đăng nhập
          </Button>
          <Button className="w-full">Đăng ký</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
