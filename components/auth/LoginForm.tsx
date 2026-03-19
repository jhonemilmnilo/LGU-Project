"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
    onSuccess?: () => void;
    themeColor?: string;
}

export function LoginForm({ onSuccess, themeColor = "#2563eb" }: LoginFormProps) {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showChangeModal, setShowChangeModal] = React.useState(false);
    const [userEmail, setUserEmail] = React.useState("");
    const router = useRouter();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error(result.error || "Invalid credentials");
                return;
            }

            // Fetch the session to get user info
            const response = await fetch("/api/auth/session");
            const session = await response.json();

            if (session && session.user) {
                const { role, isPasswordChanged } = session.user;

                // Check if user needs to change password
                if (isPasswordChanged === false) {
                    setUserEmail(data.email);
                    setShowChangeModal(true);
                    return;
                }

                // Normal redirect based on role
                if (role === "ADMIN") {
                    router.push("/admin/dashboard");
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
    };

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
                                {...form.register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-4 opacity-40 hover:opacity-100 focus:outline-none"
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

                    <div className="flex items-center space-x-3">
                        <Checkbox id="rememberMe" {...form.register("rememberMe")} className="w-5 h-5 border-slate-300 dark:border-white/10" />
                        <Label
                            htmlFor="rememberMe"
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 cursor-pointer select-none"
                        >
                            Remember me
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full text-white h-14 rounded-2xl font-black uppercase tracking-tighter italic text-xl shadow-2xl active:scale-[0.97] transition-all duration-300"
                        style={{ backgroundColor: themeColor, boxShadow: `0 25px 50px -12px ${themeColor}33` }}
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? "Authenticating..." : "Sign in"}
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
