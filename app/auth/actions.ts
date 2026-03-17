"use server";

import prisma from "@/lib/db/prisma";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function sendOTP(email: string) {
    try {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            },
        });

        if (error) {
            console.error("Supabase OTP Error:", error.message);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("OTP Action Error:", error);
        return { success: false, error: "Failed to send OTP" };
    }
}

export async function verifyOTPOnly(email: string, otp: string) {
    try {
        // Try 'signup' first for new users
        let { error: verifyError } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'signup'
        });

        if (verifyError) {
            // Fallback to 'email' type
            const { error: retryError } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email'
            });
            verifyError = retryError;
        }

        if (verifyError) {
            console.error("Supabase Verify Error:", verifyError.message);
            return { success: false, error: "Invalid or expired OTP" };
        }

        return { success: true };
    } catch (error) {
        console.error("Verification Error:", error);
        return { success: false, error: "Failed to verify identity" };
    }
}

export async function finalizePasswordChange(email: string, newPassword: string) {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                isPasswordChanged: true
            }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Finalize Error:", error);
        return { success: false, error: "Failed to update password" };
    }
}
