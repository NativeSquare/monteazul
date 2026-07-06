"use client";

import { OTPForm } from "@/components/app/auth/otp-form";
import { useConvexAuth } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Email-verification step of the entrepreneur sign-up. Reuses the shared OTP
 * form; once the account is verified and signed in, it lands on « Mi negocio ».
 */
export default function VerificarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useConvexAuth();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.replace("/registro");
    }
  }, [email, router]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/mi-negocio");
    }
  }, [isAuthenticated, router]);

  if (!email) {
    return null;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <OTPForm email={email} />
      </div>
    </div>
  );
}
