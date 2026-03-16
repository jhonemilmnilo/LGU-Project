"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { User, Mail, Lock, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerUser } from "@/app/auth/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const signupSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    accountType: z.enum(["CITIZEN", "ADMIN"]),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
} as const;

export function SignupForm() {
    const router = useRouter();
    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            accountType: "CITIZEN",
        },
    });

    const onSubmit = async (data: SignupFormValues) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const formData = new FormData();

            const result = await registerUser(data);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success("Account created successfully!");
            router.push("/auth/login");
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            console.error(error);
        }
    };

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <motion.div variants={itemVariants} className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
                <p className="text-slate-500">
                    Join our community and access local government services with ease.
                </p>
            </motion.div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            id="fullName"
                            placeholder="John Doe"
                            className="pl-10"
                            {...form.register("fullName")}
                        />
                    </div>
                    {form.formState.errors.fullName && (
                        <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            className="pl-10"
                            {...form.register("email")}
                        />
                    </div>
                    {form.formState.errors.email && (
                        <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            {...form.register("password")}
                        />
                    </div>
                    {form.formState.errors.password && (
                        <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select
                        onValueChange={(value) => form.setValue("accountType", value as "CITIZEN" | "ADMIN")}
                        defaultValue="CITIZEN"
                    >
                        <SelectTrigger className="h-11">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <SelectValue placeholder="Select type" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CITIZEN">Citizen</SelectItem>
                            <SelectItem value="ADMIN">Administrator</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 h-11 transition-all"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? "Creating account..." : "Sign Up"}
                    </Button>
                </motion.div>
            </form>

            <motion.p variants={itemVariants} className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
                    Log in here
                </Link>
            </motion.p>
        </motion.div>
    );
}
