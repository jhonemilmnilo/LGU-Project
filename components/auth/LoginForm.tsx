"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock, ShieldAlert, Timer } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LockoutState {
    phase: 1 | 2 | 3;
    attemptsLeft: number;
    cooldownUntil: number | null;
}

const STORAGE_KEY = "emapandan_login_lockout";
const DEFAULT_STATE: LockoutState = {
    phase: 1,
    attemptsLeft: 3,
    cooldownUntil: null,
};

interface LoginFormProps {
    onSuccess?: () => void;
    themeColor?: string;
}

export function LoginForm({ themeColor = "#2563eb" }: LoginFormProps) {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showChangeModal, setShowChangeModal] = React.useState(false);
    const [userEmail, setUserEmail] = React.useState("");
    const router = useRouter();

    const [lockout, setLockout] = React.useState<LockoutState>(DEFAULT_STATE);
    const [timeLeft, setTimeLeft] = React.useState<number>(0); // remaining seconds

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    // Load lockout state from localStorage on component mount
    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored) as LockoutState;
                    if (
                        [1, 2, 3].includes(parsed.phase) &&
                        typeof parsed.attemptsLeft === "number"
                    ) {
                        setLockout(parsed);
                        
                        if (parsed.cooldownUntil) {
                            const remaining = Math.ceil((parsed.cooldownUntil - Date.now()) / 1000);
                            if (remaining > 0) {
                                setTimeLeft(remaining);
                            } else {
                                // Cooldown expired while away
                                const updated = { ...parsed, cooldownUntil: null };
                                setLockout(updated);
                                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error parsing lockout state:", e);
                }
            }
        }
    }, []);

    // Timer countdown for active lockout
    React.useEffect(() => {
        if (!lockout.cooldownUntil) {
            setTimeLeft(0);
            return;
        }

        const interval = setInterval(() => {
            const remaining = Math.ceil((lockout.cooldownUntil! - Date.now()) / 1000);
            if (remaining <= 0) {
                // Cooldown complete
                const updated = {
                    ...lockout,
                    cooldownUntil: null,
                };
                setLockout(updated);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                setTimeLeft(0);
                toast.success("Cooldown complete. You can now try to sign in again!");
                clearInterval(interval);
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lockout.cooldownUntil, lockout]);

    const handleFailedAttempt = React.useCallback(() => {
        let nextPhase = lockout.phase;
        let nextAttempts = lockout.attemptsLeft - 1;
        let nextCooldown: number | null = null;

        if (nextAttempts <= 0) {
            // Cooldown trigger and phase advancement
            if (lockout.phase === 1) {
                nextCooldown = Date.now() + 3 * 60 * 1000; // 3 mins
                nextPhase = 2;
                nextAttempts = 2;
                toast.error("Too many failed attempts! Form is locked for 3 minutes.");
            } else if (lockout.phase === 2) {
                nextCooldown = Date.now() + 5 * 60 * 1000; // 5 mins
                nextPhase = 3;
                nextAttempts = 1;
                toast.error("Too many failed attempts! Form is locked for 5 minutes.");
            } else {
                nextCooldown = Date.now() + 10 * 60 * 1000; // 10 mins
                nextPhase = 1;
                nextAttempts = 3;
                toast.error("Too many failed attempts! Form is locked for 10 minutes.");
            }
        } else {
            toast.error(`Invalid credentials. You have ${nextAttempts} attempt${nextAttempts > 1 ? "s" : ""} left.`);
        }

        const newState: LockoutState = {
            phase: nextPhase,
            attemptsLeft: nextAttempts,
            cooldownUntil: nextCooldown,
        };

        setLockout(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }, [lockout]);

    const handleSuccessAttempt = React.useCallback(() => {
        setLockout(DEFAULT_STATE);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const onSubmit = React.useCallback(async (data: LoginFormValues) => {
        if (lockout.cooldownUntil && Date.now() < lockout.cooldownUntil) {
            toast.error("Security cooldown active. Please wait.");
            return;
        }

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                handleFailedAttempt();
                return;
            }

            // Fetch the session to get user info
            const response = await fetch("/api/auth/session");
            const session = await response.json();

            if (session && session.user) {
                handleSuccessAttempt();
                const { role, isPasswordChanged } = session.user;

                // Check if user needs to change password
                if (isPasswordChanged === false) {
                    setUserEmail(data.email);
                    setShowChangeModal(true);
                    return;
                }

                // Normal redirect based on role
                if (role === "ADMIN" || role === "CONTENT_ADMIN") {
                    router.push("/admin/dashboard");
                } else if (role === "USER") {
                    router.push("/");
                } else {
                    router.push("/");
                }
                toast.success("Logged in successfully");
            } else {
                router.push("/");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
            console.error("Login error:", error);
        }
    }, [lockout, handleFailedAttempt, handleSuccessAttempt, router]);

    const handlePasswordChangeSuccess = () => {
        setShowChangeModal(false);
        toast.success("Password changed! Redirecting...");
    };

    return (
        <>
            <div className="space-y-6 md:space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic text-slate-900 dark:text-white uppercase leading-none">Welcome back</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Please enter your details to access your account.
                    </p>
                </div>

                {timeLeft > 0 && (
                    <div className="p-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-pulse">
                        <div className="p-2 bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg">
                            <ShieldAlert className="h-5 w-5 animate-bounce" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black uppercase tracking-wider text-red-600 dark:text-red-400 leading-none">Security Lockout Active</h4>
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-normal mt-1">
                                Too many failed attempts! Para iwas spam, please wait for <span className="font-extrabold text-red-600 dark:text-red-400">{Math.floor(timeLeft / 60)}m {timeLeft % 60}s</span> bago sumubok ulit.
                            </p>
                        </div>
                    </div>
                )}

                {timeLeft === 0 && lockout.attemptsLeft < (lockout.phase === 1 ? 3 : lockout.phase === 2 ? 2 : 1) && (
                    <div className="p-4 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                        <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 leading-none">Warning: Remaining Attempts</h4>
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-normal mt-1">
                                Careful! You have <span className="font-extrabold text-amber-600 dark:text-amber-400">{lockout.attemptsLeft} attempt{lockout.attemptsLeft > 1 ? "s" : ""} remaining</span> bago ma-lockout ang account mo.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-4 h-4 w-4 text-slate-400 dark:text-slate-600" />
                            <Input
                                id="login-email"
                                type="email"
                                placeholder="name@example.com"
                                className="pl-10 h-12 bg-white dark:bg-black/20 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white shadow-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                                disabled={timeLeft > 0 || form.formState.isSubmitting}
                                {...form.register("email")}
                            />
                        </div>
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500 font-medium mt-1">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="login-password" className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest">Password</Label>
                            <Link
                                href="/auth/forgot-password"
                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-4 h-4 w-4 text-slate-400 dark:text-slate-600" />
                            <Input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-12 bg-white dark:bg-black/20 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white shadow-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                                disabled={timeLeft > 0 || form.formState.isSubmitting}
                                {...form.register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-4 opacity-40 hover:opacity-100 focus:outline-none"
                                disabled={timeLeft > 0}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {form.formState.errors.password && (
                            <p className="text-sm text-red-500 font-medium mt-1">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full text-white h-14 rounded-2xl font-black uppercase tracking-tighter italic text-xl shadow-2xl active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2"
                        style={{ backgroundColor: themeColor, boxShadow: `0 25px 50px -12px ${themeColor}33` }}
                        disabled={timeLeft > 0 || form.formState.isSubmitting}
                    >
                        {timeLeft > 0 ? (
                            <>
                                <Timer className="h-5 w-5 animate-spin" />
                                Locked ({Math.floor(timeLeft / 60)}m {timeLeft % 60}s)
                            </>
                        ) : form.formState.isSubmitting ? (
                            "Authenticating..."
                        ) : (
                            "Sign in"
                        )}
                    </Button>
                </form>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                    <Link 
                        href="/" 
                        className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-colors group"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to landing page
                    </Link>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={showChangeModal}
                onOpenChange={setShowChangeModal}
                email={userEmail}
                onSuccess={handlePasswordChangeSuccess}
            />
        </>
    );
}
