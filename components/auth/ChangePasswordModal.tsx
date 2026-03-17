"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
    Mail, 
    ShieldCheck, 
    Lock, 
    Check, 
    Loader2, 
    ArrowRight, 
    ArrowLeft, 
    Eye, 
    EyeOff,
    ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOTP, verifyOTPOnly, finalizePasswordChange } from "@/app/auth/actions";

const setupSchema = z.object({
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[a-z]/, "At least one lowercase letter")
        .regex(/[A-Z]/, "At least one uppercase letter")
        .regex(/[0-9]/, "At least one number")
        .regex(/[^a-zA-Z0-9]/, "At least one symbol"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type SetupValues = z.infer<typeof setupSchema>;

interface ChangePasswordModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    email: string;
    onSuccess: () => void;
}

type Step = 'identity' | 'otp' | 'password';

export function ChangePasswordModal({ isOpen, onOpenChange, email, onSuccess }: ChangePasswordModalProps) {
    const [step, setStep] = React.useState<Step>('identity');
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [timeLeft, setTimeLeft] = React.useState(60);

    const form = useForm<SetupValues>({
        resolver: zodResolver(setupSchema),
        defaultValues: {
            otp: "",
            password: "",
            confirmPassword: "",
        },
    });

    const password = form.watch("password");

    const requirements = [
        { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
        { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
        { label: "At least one digit", met: /[0-9]/.test(password) },
        { label: "At least one special symbol", met: /[^a-zA-Z0-9]/.test(password) },
    ];

    // Timer logic and Step back if timeout
    React.useEffect(() => {
        if (step === 'otp') {
            if (timeLeft > 0) {
                const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                toast.error("Verification code expired. Please request a new one.");
                setStep('identity');
            }
        }
    }, [step, timeLeft]);

    // Reset state when modal is closed
    React.useEffect(() => {
        if (!isOpen) {
            setStep('identity');
            setTimeLeft(60);
            form.reset({
                otp: "",
                password: "",
                confirmPassword: ""
            });
        }
    }, [isOpen, form]);

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return {
            mins: mins.toString().padStart(2, '0'),
            secs: secs.toString().padStart(2, '0')
        };
    };

    const handleSendOTP = async (isResend: boolean = false) => {
        setIsLoading(true);
        try {
            const result = await sendOTP(email);
            if (result.success) {
                toast.success(isResend ? "Code resent successfully" : "Verification code sent");
                setStep('otp');
                setTimeLeft(60);
            } else {
                toast.error(result.error || "Failed to send code.");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        const otp = form.getValues("otp");
        if (otp.length !== 6) {
            form.setError("otp", { message: "6 digits required" });
            return;
        }
        setIsLoading(true);
        try {
            const result = await verifyOTPOnly(email, otp);
            if (result.success) {
                setStep('password');
            } else {
                toast.error(result.error || "Invalid code.");
            }
        } catch {
            toast.error("Verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalize = async (data: SetupValues) => {
        setIsLoading(true);
        try {
            const result = await finalizePasswordChange(email, data.password);
            if (result.success) {
                toast.success("Account setup complete!");
                onSuccess();
                window.location.href = "/";
            } else {
                toast.error(result.error || "Failed to update password.");
            }
        } catch {
            toast.error("Internal server error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[380px] w-[calc(100%-2rem)] p-0 overflow-hidden bg-background dark:bg-[#0B0E14] border-none rounded-[32px] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-[100]">
                
                <AnimatePresence mode="wait">
                    {step === 'identity' && (
                        <motion.div
                            key="identity"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-8 pt-10 pb-8"
                        >
                            <DialogHeader className="mb-8 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-sky-50 dark:bg-sky-500/10 rounded-full flex items-center justify-center border border-sky-100 dark:border-sky-500/20 shadow-sm transition-transform hover:scale-105">
                                    <Mail className="w-8 h-8 text-sky-500" />
                                </div>
                                <div className="space-y-2">
                                    <DialogTitle className="text-2xl font-bold text-foreground">
                                        Verify your identity
                                    </DialogTitle>
                                    <DialogDescription className="text-sm font-medium leading-relaxed text-muted-foreground px-2">
                                        To help keep your account secure, we&apos;ll send a one-time verification code to:
                                    </DialogDescription>
                                </div>
                            </DialogHeader>

                            <div className="bg-muted/30 border border-border p-4 rounded-xl mb-8 flex items-center gap-3 group transition-all hover:border-sky-500/30">
                                <div className="w-10 h-10 bg-background dark:bg-slate-900 rounded-lg flex items-center justify-center border border-border shadow-sm">
                                    <ShieldCheck className="w-5 h-5 text-muted-foreground group-hover:text-sky-500 transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Email Address</p>
                                    <p className="text-sm font-bold text-foreground truncate">{email}</p>
                                </div>
                            </div>

                            <Button
                                onClick={() => handleSendOTP(false)}
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white hover:bg-blue-700 h-11 font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all rounded-xl text-base"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        Send Verification Code <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </motion.div>
                    )}

                    {step === 'otp' && (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8 pt-10 pb-8"
                        >
                            <DialogHeader className="mb-8 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-sky-50 dark:bg-sky-500/10 rounded-full flex items-center justify-center border border-sky-100 dark:border-sky-500/20 shadow-sm">
                                    <Mail className="w-8 h-8 text-sky-500" />
                                </div>
                                <div className="space-y-2">
                                    <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">Verify your email</DialogTitle>
                                    <DialogDescription className="text-sm font-medium max-w-[280px] mx-auto leading-relaxed text-muted-foreground">
                                        We&apos;ve sent a 6-digit code to <span className="font-bold text-foreground">{email}</span>. Please enter it below.
                                    </DialogDescription>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6">
                                <div className="relative">
                                    <Input
                                        {...form.register("otp")}
                                        placeholder="000 000"
                                        maxLength={6}
                                        className="h-14 w-full text-center text-3xl font-bold tracking-[0.4em] rounded-xl bg-muted/20 border-border shadow-inner text-foreground focus:ring-sky-500/20 focus:bg-background transition-all"
                                    />
                                </div>

                                <Button
                                    onClick={handleVerifyOTP}
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 text-white hover:bg-blue-700 h-11 font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all rounded-xl text-base"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <span className="flex items-center gap-2">
                                            Verify and Login <ArrowRight className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>

                                <div className="flex flex-col items-center gap-6">
                                    <div className="flex gap-4">
                                        <div className="text-center group">
                                            <div className="bg-muted dark:bg-slate-900/50 w-16 h-12 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-2xl group-hover:bg-sky-50 dark:group-hover:bg-sky-900/30 transition-colors shadow-sm">{formatTimer(timeLeft).mins}</div>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 block">Minutes</span>
                                        </div>
                                        <span className="text-sky-600 dark:text-sky-400 font-bold text-3xl self-start mt-1.5">:</span>
                                        <div className="text-center group">
                                            <div className="bg-muted dark:bg-slate-900/50 w-16 h-12 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-2xl group-hover:bg-sky-50 dark:group-hover:bg-sky-900/30 transition-colors shadow-sm">{formatTimer(timeLeft).secs}</div>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 block">Seconds</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-base font-medium text-muted-foreground">
                                        Didn&apos;t receive code? <button onClick={() => handleSendOTP(true)} disabled={isLoading} className={`font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer disabled:opacity-50`}>Resend code</button>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'password' && (
                        <motion.div
                            key="password"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 pt-10 pb-8"
                        >
                            <DialogHeader className="mb-6 text-center space-y-2">
                                <div className="space-y-1">
                                    <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">Reset Password</DialogTitle>
                                    <DialogDescription className="text-sm font-medium leading-relaxed text-muted-foreground px-2">
                                        Please choose a strong password to secure your Agno Municipal account.
                                    </DialogDescription>
                                </div>
                            </DialogHeader>

                            <form onSubmit={form.handleSubmit(handleFinalize)} className="space-y-6">
                                <div className="space-y-6">
                                    <div className="space-y-2.5">
                                        <Label className="text-[13px] font-bold text-muted-foreground ml-1">New Password</Label>
                                        <div className="relative group">
                                            <Input
                                                {...form.register("password")}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="h-11 px-4 rounded-xl bg-muted/20 border-border text-foreground focus:border-blue-600 focus:bg-background transition-all shadow-sm text-base"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label className="text-[13px] font-bold text-muted-foreground ml-1">Confirm Password</Label>
                                        <div className="relative group">
                                            <Input
                                                {...form.register("confirmPassword")}
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-11 px-4 rounded-xl bg-muted/20 border-border text-foreground focus:border-blue-600 focus:bg-background transition-all shadow-sm text-base"
                                            />
                                        </div>
                                        {form.formState.errors.confirmPassword && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-destructive font-bold uppercase mt-2 ml-1 leading-none italic">
                                                <ShieldAlert className="w-4 h-4" />
                                                {form.formState.errors.confirmPassword.message}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-muted/30 dark:bg-slate-900/40 border border-border rounded-[24px] p-7 space-y-4 shadow-sm">
                                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 leading-none opacity-80">Password Requirements</p>
                                    <div className="space-y-3.5">
                                        {requirements.map((req, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${req.met ? 'bg-emerald-100 dark:bg-emerald-500/20 scale-110' : 'border border-border bg-background'}`}>
                                                    {req.met ? (
                                                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[4px]" />
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 bg-muted rounded-full" />
                                                    )}
                                                </div>
                                                <span className={`text-[14px] font-semibold transition-colors duration-300 ${req.met ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 h-11 font-bold shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all rounded-xl text-base relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
