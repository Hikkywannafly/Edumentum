"use client";

import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export function useGoogleAuth() {
  const { googleAuth } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        await googleAuth(credentialResponse.credential);
        toast.success("Google login successful!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Google login failed",
      );
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed");
  };

  return {
    handleGoogleSuccess,
    handleGoogleError,
  };
}
