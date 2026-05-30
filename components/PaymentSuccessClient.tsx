"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  redirectUrl: string;
  status?: string | null;
}

export default function PaymentSuccessClient({ redirectUrl, status }: Props) {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.push(redirectUrl);
    }, 4000);
    return () => clearTimeout(t);
  }, [redirectUrl, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-semibold mb-2">Payment Successful</h1>
      <p className="mb-4 text-sm text-muted-foreground">{status === "PAID" ? "Your payment has been recorded and the request was marked as paid." : "We received the payment result; we'll finalize the status shortly."}</p>
      <div className="flex gap-2">
        <Button onClick={() => router.push(redirectUrl)}>Go to requests</Button>
      </div>
      <p className="mt-4 text-xs text-slate-400">Redirecting in a few seconds...</p>
    </div>
  );
}
