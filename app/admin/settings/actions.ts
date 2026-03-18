"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function processImageUpload(formData: FormData): Promise<string | null> {
    const file = formData.get("imageFile") as File | null;
    let imageUrl = formData.get("imageUrl") as string | null;

    if (file && file.size > 0 && file.name !== "undefined") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");
        const uploadsDir = path.join(process.cwd(), "public/uploads");
        
        // Ensure directory exists
        await mkdir(uploadsDir, { recursive: true });
        
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);
        imageUrl = `/uploads/${filename}`;
    }

    // Return the new image URL, or the existing one if no new file was uploaded
    return imageUrl || null;
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
        const imageUrl = await processImageUpload(formData);
        const finalUrl = imageUrl || (formData.get("imageUrl") as string) || "";
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await prisma.systemSetting.upsert({
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

export async function updateLoginBranding(formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);
        const finalImageUrl = imageUrl || (formData.get("login_bg_image") as string) || "";
        
        const bgColor = (formData.get("login_bg_color") as string) || "#ffffff";
        const motto = (formData.get("login_quote") as string) || "";
        const mottoAuthor = (formData.get("login_quote_author") as string) || "";

        // Find current active branding or create first one
        const current = await prisma.loginBranding.findFirst({
            where: { isActive: true }
        });

        if (current) {
            await prisma.loginBranding.update({
                where: { id: current.id },
                data: {
                    bgImage: finalImageUrl,
                    bgColor,
                    motto,
                    mottoAuthor
                }
            });
        } else {
            await prisma.loginBranding.create({
                data: {
                    bgImage: finalImageUrl,
                    bgColor,
                    motto,
                    mottoAuthor,
                    isActive: true
                }
            });
        }
        
        revalidatePath("/auth/login");
        revalidatePath("/admin/settings");
        return { success: true, imageUrl: finalImageUrl };
    } catch (error) {
        console.error("Error updating login branding:", error);
        return { success: false, error: "Failed to update login branding" };
    }
}

export async function createHeroSlide(formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);
        
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
                secondaryBtnText: formData.get("secondaryBtnText") as string,
                secondaryBtnLink: formData.get("secondaryBtnLink") as string,
            }
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
        const imageUrl = await processImageUpload(formData);

        await prisma.heroSlide.update({
            where: { id },
            data: {
                title: formData.get("title") as string,
                subtitle: formData.get("subtitle") as string,
                tagline: formData.get("tagline") as string,
                imageUrl: imageUrl || "",
                order: parseInt(formData.get("order") as string) || 0,
                isActive: formData.get("isActive") === "true",
                primaryBtnText: formData.get("primaryBtnText") as string,
                primaryBtnLink: formData.get("primaryBtnLink") as string,
                secondaryBtnText: formData.get("secondaryBtnText") as string,
                secondaryBtnLink: formData.get("secondaryBtnLink") as string,
            }
        });
        revalidatePath("/");
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating hero slide:", error);
        return { success: false, error: "Failed to update slide" };
    }
}
