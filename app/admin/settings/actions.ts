"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

async function processImageUpload(formData: FormData): Promise<string | null> {
    const file = formData.get("imageFile") as File | null;
    let imageUrl = formData.get("imageUrl") as string | null;

    if (file && file.size > 0 && file.name !== "undefined") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");
        const filepath = path.join(process.cwd(), "public/uploads", filename);
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
