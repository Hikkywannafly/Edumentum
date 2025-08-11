interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  text = "Loading...",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`flex min-h-screen items-center justify-center ${className}`}
    >
      <div className="text-center">
        <div
          className={`mx-auto animate-spin rounded-full border-primary border-b-2 ${sizeClasses[size]}`}
        />
        {text && <p className="mt-2 hidden text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}
