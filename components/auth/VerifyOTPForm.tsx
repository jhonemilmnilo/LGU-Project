"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendOTP, verifyOTPOnly } from "@/app/auth/actions";

const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

type FormValues = z.infer<typeof otpSchema>;

interface VerifyOTPFormProps {
    email: string;
    themeColor?: string;
}

export function VerifyOTPForm({ email, themeColor = "#2563eb" }: VerifyOTPFormProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [timeLeft, setTimeLeft] = React.useState(120);
    const [isOtpFocused, setIsOtpFocused] = React.useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });

    const handleSendOTP = React.useCallback(async (isResend: boolean = false) => {
        setIsLoading(true);
        try {
            const result = await sendOTP(email);
            if (result.success) {
                toast.success(isResend ? "Code resent successfully" : "Verification code sent to your email");
                setTimeLeft(120);
                
                // Persist state in sessionStorage
                sessionStorage.setItem("setup_email", email);
                sessionStorage.setItem("setup_timer_expiry", (Date.now() + 120 * 1000).toString());
            } else {
                toast.error(result.error || "Failed to send code.");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [email]);

    // Timer logic
    React.useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            toast.error("Verification code expired. Please request a new one.");
            sessionStorage.removeItem("setup_timer_expiry");
            sessionStorage.removeItem("setup_email");
        }
    }, [timeLeft]);

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return {
            mins: mins.toString().padStart(2, '0'),
            secs: secs.toString().padStart(2, '0')
        };
    };

    // Auto-send OTP when the page mounts
    React.useEffect(() => {
        const storedEmail = sessionStorage.getItem("setup_email");
        const storedExpiry = sessionStorage.getItem("setup_timer_expiry");

        if (storedEmail === email && storedExpiry) {
            const remaining = Math.ceil((parseInt(storedExpiry, 10) - Date.now()) / 1000);
            if (remaining > 0) {
                setTimeLeft(remaining);
                return;
            }
        }

        // Send OTP if no active timer is stored
        handleSendOTP(false);
    }, [email, handleSendOTP]);

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        try {
            const result = await verifyOTPOnly(email, data.otp);
            if (result.success && result.token) {
                // Clear sessionStorage active state since verification is done
                sessionStorage.removeItem("setup_timer_expiry");
                sessionStorage.removeItem("setup_email");
                
                // Redirect user to the new setup page
                window.location.href = `/auth/setup-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(result.token)}`;
            } else {
                form.setError("otp", { message: result.error || "Invalid OTP" });
                toast.error(result.error || "Invalid OTP");
            }
        } catch {
            toast.error("An error occurred during verification");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic text-slate-900 dark:text-white uppercase leading-none">
                    Verify Identity
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    We&apos;ve sent a 6-digit code to <span className="font-bold text-slate-900 dark:text-white">{email}</span>. Please enter it below.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="relative">
                    <Input
                        placeholder="000 000"
                        maxLength={6}
                        className="h-14 w-full text-center text-3xl font-bold tracking-[0.4em] rounded-xl bg-white dark:bg-black/20 border-slate-300 dark:border-white/10 shadow-inner text-slate-900 dark:text-white focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-background transition-all"
                        style={{
                            borderColor: isOtpFocused ? themeColor : undefined,
                            boxShadow: isOtpFocused ? `0 0 0 1px ${themeColor}` : undefined
                        }}
                        onFocus={() => setIsOtpFocused(true)}
                        {...form.register("otp", {
                            onBlur: () => setIsOtpFocused(false)
                        })}
                        disabled={isLoading}
                    />
                    {form.formState.errors.otp && (
                        <p className="text-sm text-red-500 font-medium mt-1 text-center">{form.formState.errors.otp.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-white h-14 rounded-2xl font-black uppercase tracking-tighter italic text-xl shadow-2xl active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2"
                    style={{ backgroundColor: themeColor, boxShadow: `0 25px 50px -12px ${themeColor}33` }}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <span className="flex items-center gap-2">
                            Verify and Setup Password <ArrowRight className="w-4 h-4" />
                        </span>
                    )}
                </Button>

                <div className="flex flex-col items-center gap-6 pt-2">
                    <div className="flex gap-4">
                        <div className="text-center group">
                            <div className="bg-slate-100 dark:bg-slate-900/50 w-16 h-12 rounded-xl flex items-center justify-center font-bold text-2xl group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors shadow-sm" style={{ color: themeColor }}>
                                {formatTimer(timeLeft).mins}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">Minutes</span>
                        </div>
                        <span className="font-bold text-3xl self-start mt-1.5" style={{ color: themeColor }}>:</span>
                        <div className="text-center group">
                            <div className="bg-slate-100 dark:bg-slate-900/50 w-16 h-12 rounded-xl flex items-center justify-center font-bold text-2xl group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors shadow-sm" style={{ color: themeColor }}>
                                {formatTimer(timeLeft).secs}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">Seconds</span>
                        </div>
                    </div>

                    <p className="text-sm font-semibold text-slate-400">
                        Didn&apos;t receive code?{" "}
                        <button
                            type="button"
                            onClick={() => handleSendOTP(true)}
                            disabled={isLoading || timeLeft > 60}
                            className="font-bold hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            style={{ color: themeColor }}
                        >
                            Resend code {timeLeft > 60 && `(${timeLeft - 60}s)`}
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
}
