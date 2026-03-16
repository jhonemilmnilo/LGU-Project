"use server";

import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    accountType: z.enum(["CITIZEN", "ADMIN"]),
});

export async function registerUser(formData: z.infer<typeof signupSchema>) {
    try {
        const validatedData = signupSchema.parse(formData);

        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            return { error: "User already exists with this email" };
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const user = await prisma.user.create({
            data: {
                name: validatedData.fullName,
                email: validatedData.email,
                password: hashedPassword,
                role: validatedData.accountType === "ADMIN" ? "ADMIN" : "USER",
            },
        });

        return { success: "Account created successfully" };
    } catch (error) {
        console.error("Signup error:", error);
        return { error: "Something went wrong during registration" };
    }
}
