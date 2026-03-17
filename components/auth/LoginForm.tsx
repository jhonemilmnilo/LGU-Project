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

export function LoginForm() {
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
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                    <p className="text-slate-500">
                        Please enter your details to access your account.
                    </p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="login-email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                id="login-email"
                                type="email"
                                placeholder="name@example.com"
                                className="pl-10 h-11"
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
                            <Label htmlFor="login-password">Password</Label>
                            <Link
                                href="/auth/forgot-password"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-11"
                                {...form.register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
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

                    <div className="flex items-center space-x-2">
                        <Checkbox id="rememberMe" {...form.register("rememberMe")} />
                        <Label
                            htmlFor="rememberMe"
                            className="text-sm font-medium leading-none cursor-pointer select-none"
                        >
                            Remember me
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 h-11 font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? "Signing in..." : "Sign in to Account"}
                    </Button>
                </form>
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
