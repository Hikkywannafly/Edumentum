import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useEffect } from "react";
import { useState } from "react";
import { toast } from "sonner";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      showPasswordToggle = false,
      className = "",
      type = "text",
      id,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType =
      showPasswordToggle && type === "password"
        ? showPassword
          ? "text"
          : "password"
        : type;
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Show toast error when error prop changes
    useEffect(() => {
      if (error) {
        toast.error(error);
      }
    }, [error]);

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-start font-medium text-foreground text-sm"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-200 ${
              error ? "border-red-500" : "border-border focus:border-blue-500"
            } ${className}`}
            {...props}
          />
          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="-translate-y-1/2 absolute top-1/2 right-3 transform text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
