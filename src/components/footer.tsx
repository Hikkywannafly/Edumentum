import Link from "@/components/link";

const Footer = () => {
  return (
    <div className="flex w-full items-center justify-between border-t border-dashed pt-2">
      <div className="px-[2px] text-muted-foreground text-xs">
        Built with{" "}
        <Link
          href="https://nextjs.org/"
          text="Next.js"
          className="underline decoration-wavy underline-offset-2 hover:text-foreground"
        />
      </div>
    </div>
  );
};

export { Footer };
