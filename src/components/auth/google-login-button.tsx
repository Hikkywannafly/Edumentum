"use client";

import { useGoogleAuth } from "@/hooks/use-google-auth";
import { GoogleLogin } from "@react-oauth/google";

export function GoogleLoginButton() {
  const { handleGoogleSuccess, handleGoogleError } = useGoogleAuth();

  return (
    <GoogleLogin
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
