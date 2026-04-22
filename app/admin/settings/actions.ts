"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function deleteUploadedFile(imageUrl: string | null | undefined) {
    if (!imageUrl || !imageUrl.startsWith("/uploads/")) return;

    try {
        const filepath = path.join(process.cwd(), "public", imageUrl);
        if (existsSync(filepath)) {
            await unlink(filepath);
        }
    } catch (error) {
        console.error("Error deleting file:", error);
    }
}

export async function processImageUpload(formData: FormData, fieldName: string = "imageFile"): Promise<string | null> {
    const file = (formData.get(fieldName) || formData.get(fieldName + "File")) as File | null;
    
    const rawExisting = formData.get(fieldName) || formData.get("imageUrl");
    let existingUrl: string | null = null;
    
    if (typeof rawExisting === 'string') {
        existingUrl = rawExisting;
    } else if (typeof formData.get("imageUrl") === 'string') {
        existingUrl = formData.get("imageUrl") as string;
    }

    if (file && file.size > 0 && file.name !== "undefined") {
        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `${Date.now()}_${file.name.replaceAll(" ", "_")}`;
            const uploadsDir = path.join(process.cwd(), "public", "uploads");
            
            await mkdir(uploadsDir, { recursive: true });
            
            const filepath = path.join(uploadsDir, filename);
            await writeFile(filepath, buffer);
            
            // Delete old file if it exists and is different from the new one
            if (existingUrl && existingUrl.startsWith("/uploads/")) {
                await deleteUploadedFile(existingUrl);
            }

            return `/uploads/${filename}`;
        } catch (error) {
            console.error("Error processing image upload:", error);
            return existingUrl; // Fallback to existing if upload fails
        }
    }

    // Return the existing URL if no new file was uploaded
    return existingUrl && typeof existingUrl === 'string' ? existingUrl : null;
}
export async function processFileUpload(formData: FormData, fieldName: string): Promise<string | null> {
    const file = formData.get(fieldName) as File | null;
    const existingUrl = formData.get(fieldName + "Url")?.toString() || null;

    if (file && file.size > 0 && file.name !== "undefined") {
        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `${Date.now()}_${file.name.replaceAll(" ", "_")}`;
            const uploadsDir = path.join(process.cwd(), "public", "uploads");
            
            await mkdir(uploadsDir, { recursive: true });
            
            const filepath = path.join(uploadsDir, filename);
            await writeFile(filepath, buffer);
            
            // Delete old file if it exists
            if (existingUrl && existingUrl.startsWith("/uploads/")) {
                await deleteUploadedFile(existingUrl);
            }

            return `/uploads/${filename}`;
        } catch (error) {
            console.error("Error processing file upload:", error);
            return existingUrl;
        }
    }

    return existingUrl;
}

export async function updateSystemSetting(key: string, value: string) {
    try {
        await prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        revalidatePath("/");
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating system setting:", error);
        return { success: false, error: "Failed to update setting" };
    }
}

export async function updateLogoSetting(formData: FormData) {
    try {
        const oldSetting = await prisma.systemSetting.findUnique({ where: { key: "site_logo" } });
        const imageUrl = await processImageUpload(formData);
        const finalUrl = imageUrl || (formData.get("imageUrl") as string) || "";
        
        if (imageUrl && oldSetting?.value && oldSetting.value !== imageUrl) {
            await deleteUploadedFile(oldSetting.value);
        }

        await prisma.systemSetting.upsert({
            where: { key: "site_logo" },
            update: { value: finalUrl },
            create: { key: "site_logo", value: finalUrl }
        });
        
        revalidatePath("/");
        revalidatePath("/admin/settings");
        return { success: true, imageUrl: finalUrl };
    } catch (error) {
        console.error("Error updating logo:", error);
        return { success: false, error: "Failed to update logo" };
    }
}

export async function createHeroSlide(formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);
        
        const session = await getServerSession(authOptions);
        const role = (session?.user as any)?.role;
        const managedBarangay = (session?.user as any)?.managedBarangay;

        await prisma.heroSlide.create({
            data: {
                title: formData.get("title") as string,
                subtitle: formData.get("subtitle") as string,
                tagline: formData.get("tagline") as string,
                imageUrl: imageUrl || "",
                order: parseInt(formData.get("order") as string) || 0,
                isActive: formData.get("isActive") === "true",
                primaryBtnText: formData.get("primaryBtnText") as string,
                primaryBtnLink: formData.get("primaryBtnLink") as string,
                barangay: role === "BARANGAY_ADMIN" ? managedBarangay : null,
            } as any
        });
        revalidatePath("/");
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error creating hero slide:", error);
        return { success: false, error: "Failed to create slide" };
    }
}

export async function deleteHeroSlide(id: string) {
    try {
        const slide = await prisma.heroSlide.findUnique({ where: { id } });
        if (slide?.imageUrl) {
            await deleteUploadedFile(slide.imageUrl);
        }
        await prisma.heroSlide.delete({ where: { id } });
        revalidatePath("/");
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error deleting hero slide:", error);
        return { success: false, error: "Failed to delete slide" };
    }
}

export async function updateHeroSlide(id: string, formData: FormData) {
    try {
        const oldSlide = await prisma.heroSlide.findUnique({ where: { id } });
        const imageUrl = await processImageUpload(formData);

        if (imageUrl && oldSlide?.imageUrl && oldSlide.imageUrl !== imageUrl) {
            await deleteUploadedFile(oldSlide.imageUrl);
        }

        const session = await getServerSession(authOptions);
        const role = (session?.user as any)?.role;
        const managedBarangay = (session?.user as any)?.managedBarangay;

        await prisma.heroSlide.update({
            where: { id },
            data: {
                title: formData.get("title") as string,
                subtitle: formData.get("subtitle") as string,
                tagline: formData.get("tagline") as string,
                imageUrl: imageUrl || (formData.get("imageUrl") as string) || "",
                order: parseInt(formData.get("order") as string) || 0,
                isActive: formData.get("isActive") === "true",
                primaryBtnText: formData.get("primaryBtnText") as string,
                primaryBtnLink: formData.get("primaryBtnLink") as string,
                barangay: role === "BARANGAY_ADMIN" ? managedBarangay : null,
            } as any
        });
        revalidatePath("/");
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating hero slide:", error);
        return { success: false, error: "Failed to update slide" };
    }
}

export async function updateTreasurySettings(formData: FormData) {
    try {
        const qrUrl = await processImageUpload(formData, "gcashQr");
        const accountName = formData.get("gcashAccountName") as string;
        const accountNumber = formData.get("gcashAccountNumber") as string;

        console.log("--- Treasury Settings Update ---");
        console.log("QR URL:", qrUrl);
        console.log("Account Name:", accountName);
        console.log("Account Number:", accountNumber);

        if (qrUrl !== null && qrUrl !== undefined) {
            await prisma.systemSetting.upsert({
                where: { key: "gcash_qr_url" },
                update: { value: qrUrl },
                create: { key: "gcash_qr_url", value: qrUrl }
            });
        }

        if (accountName !== null && accountName !== undefined) {
            await prisma.systemSetting.upsert({
                where: { key: "gcash_account_name" },
                update: { value: accountName },
                create: { key: "gcash_account_name", value: accountName }
            });
        }

        if (accountNumber !== null && accountNumber !== undefined) {
            await prisma.systemSetting.upsert({
                where: { key: "gcash_account_number" },
                update: { value: accountNumber },
                create: { key: "gcash_account_number", value: accountNumber }
            });
        }

        revalidatePath("/");
        revalidatePath("/admin/settings");
        revalidatePath("/admin/treasury/payment-settings");
        revalidatePath("/user/services/requests/[id]");
        
        return { 
            success: true, 
            qrUrl: qrUrl || (formData.get("imageUrl") as string) 
        };
    } catch (error) {
        console.error("Error updating treasury settings:", error);
        return { success: false, error: "Failed to update treasury settings" };
    }
}

// End of settings actions
