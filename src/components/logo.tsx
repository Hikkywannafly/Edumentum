import type React from "react";

const Logo: React.FC<{ className?: string }> = ({
  className = "w-12 h-12",
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        rx="20"
        fill="hsl(var(--secondary))"
      />
      <circle cx="50" cy="50" r="20" fill="hsl(var(--primary))" />
    </svg>
  );
};

export default Logo;
