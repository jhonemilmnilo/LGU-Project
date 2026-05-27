"use server";

import prisma from "@/lib/db/prisma";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export async function sendOTP(email: string) {
    try {
        const ip = await getClientIp();
        const emailClean = email.trim().toLowerCase();
        // Rate limit: Max 3 OTP requests per hour per email + IP
        const limitKey = `otp:send:${emailClean}:${ip}`;
        const limitCheck = await isRateLimited(limitKey, 3, 3600000); // 1 hour window

        if (!limitCheck.success) {
            const minutesLeft = Math.ceil(((limitCheck.resetTime?.getTime() || 0) - Date.now()) / 60000);
            return { 
                success: false, 
                error: `Too many OTP requests. Please try again after ${minutesLeft} minute(s).` 
            };
        }

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
        const ip = await getClientIp();
        const emailClean = email.trim().toLowerCase();
        // Rate limit: Max 10 verification attempts per 15 mins per email + IP
        const limitKey = `otp:verify:${emailClean}:${ip}`;
        const limitCheck = await isRateLimited(limitKey, 10, 900000); // 15 mins window

        if (!limitCheck.success) {
            const minutesLeft = Math.ceil(((limitCheck.resetTime?.getTime() || 0) - Date.now()) / 60000);
            return { 
                success: false, 
                error: `Too many verification attempts. Try again after ${minutesLeft} minute(s).` 
            };
        }

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

export async function checkEmailExists(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
            select: { id: true }
        });
        return { success: true, exists: !!user };
    } catch (error) {
        console.error("checkEmailExists Error:", error);
        return { success: false, error: "Failed to check email" };
    }
}
