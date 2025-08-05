"use client";

import { useGoogleAuth } from "@/hooks/use-google-auth";
import { GoogleLogin } from "@react-oauth/google";
import type React from "react";

export function GoogleLoginButton({
  className,
}: { className?: React.HTMLAttributes<HTMLDivElement>["className"] }) {
  const { handleGoogleSuccess, handleGoogleError } = useGoogleAuth();

  return (
    <GoogleLogin
      containerProps={{ className }}
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      useOneTap
      theme="outline"
      size="large"
      text="continue_with"
      shape="rectangular"
    />
  );
}
