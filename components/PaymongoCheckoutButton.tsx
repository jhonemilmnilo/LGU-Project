"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  amount?: number;
  type?: "gcash" | "grab_pay" | "qrph" | "dob" | "bank_transfer" | "maya" | "paymaya" | "bank";
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  transactionId?: string | null;
  onBeforeCheckout?: () => Promise<boolean>;
}

export default function PaymongoCheckoutButton({ amount = 0, type = "gcash", label = "Pay with GCash", className, style, transactionId, onBeforeCheckout }: Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Invalid amount for checkout");
      return;
    }
    setLoading(true);
    try {
      if (onBeforeCheckout) {
        const proceed = await onBeforeCheckout();
        if (!proceed) {
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/paymongo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          type,
          transactionId: transactionId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const err = data?.error || data?.errors || "Failed to initialize payment";
        toast.error(typeof err === "string" ? err : (err[0]?.detail || "Failed to initialize payment"));
        return;
      }
      const checkoutUrl = data?.data?.attributes?.checkout_url || data?.data?.attributes?.redirect?.checkout_url || data?.data?.attributes?.redirect?.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Payment initialization failed");
        console.error("PayMongo response:", data);
      }
    } catch (err) {
      console.error("PayMongo initiate error:", err);
      toast.error("Network error while initializing payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleConfirm} disabled={loading} className={className} style={style}>
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Processing...
        </div>
      ) : (
        label
      )}
    </Button>
  );
}
