"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const [showPassword, setShowPassword] = React.useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoading, setIsLoading] = React.useState(false); // Added state
    const router = useRouter(); // Added router

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (data: LoginFormValues) => { // Changed to async and type
        setIsLoading(true);
        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                console.error("Login failed:", result.error);
                // In a real app, you'd show a toast here
            } else {
                // Fetch the session to get the role
                const response = await fetch("/api/auth/session");
                const session = await response.json();

                if (session && session.user) {
                    const role = session.user.role;
                    if (role === "ADMIN") {
                        router.push("/admin/dashboard");
                    } else {
                        router.push("/");
                    }
                } else {
                    // Fallback if session user info is missing
                    router.push("/");
                }
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-slate-500">
                    Please enter your details to access your account.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            className="pl-10"
                            {...form.register("email")}
                        />
                    </div>
                    {form.formState.errors.email && (
                        <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm font-medium text-blue-600 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            {...form.register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {form.formState.errors.password && (
                        <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id="rememberMe" {...form.register("rememberMe")} />
                    <Label
                        htmlFor="rememberMe"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Remember me
                    </Label>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 h-11"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Signing in..." : "Sign in to Account"}
                </Button>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-50 px-2 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-11 border-slate-200">
                        { }
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="mr-2 h-4 w-4" alt="Google" />
                        Google
                    </Button>
                    <Button variant="outline" className="h-11 border-slate-200">
                        { }
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="mr-2 h-4 w-4" alt="Facebook" />
                        Facebook
                    </Button>
                </div>
            </form>

            <p className="text-center text-sm text-slate-500">
{ }
{ }
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                Don't have an account?{" "}
                <Link href="/auth/signup" className="font-semibold text-blue-600 hover:underline">
                    Create an account
                </Link>
            </p>
        </div>
    );
}
