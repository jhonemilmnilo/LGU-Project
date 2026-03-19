"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { processImageUpload, deleteUploadedFile } from "@/app/admin/settings/actions";

export async function getAboutPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma as any).aboutPage.findFirst();
}

export async function upsertAboutPage(formData: FormData) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existing = await (prisma as any).aboutPage.findFirst();
        
        let mayorImageUrl = formData.get("mayorImageUrl")?.toString() || "";
        
        // Let's try to upload if there is a file
        const uploadedImageUrl = await processImageUpload(formData, "mayorImageFile");
        if (uploadedImageUrl && typeof uploadedImageUrl === "string" && uploadedImageUrl !== mayorImageUrl) {
            mayorImageUrl = uploadedImageUrl;
        }

        // If the old image URL in the DB is different from the newly finalized mayorImageUrl
        // (which means they uploaded a new image OR explicitly reset/deleted the image),
        // we should delete the old file from the server storage to save space.
        if (existing?.mayorImageUrl && existing.mayorImageUrl !== mayorImageUrl) {
            await deleteUploadedFile(existing.mayorImageUrl);
        }

        const data = {
            history: formData.get("history")?.toString() || "",
            mission: formData.get("mission")?.toString() || "",
            vision: formData.get("vision")?.toString() || "",
            coreValues: formData.get("coreValues")?.toString() || "",
            mayorMessage: formData.get("mayorMessage")?.toString() || "",
            geographyOrDemographics: formData.get("geographyOrDemographics")?.toString() || "",
            mayorImageUrl: mayorImageUrl.length > 0 ? mayorImageUrl : null,
        };

        if (existing) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (prisma as any).aboutPage.update({
                where: { id: existing.id },
                data
            });
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (prisma as any).aboutPage.create({
                data
            });
        }

        revalidatePath("/about");
        revalidatePath("/admin/about");
        return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error upserting about page:", error);
        return { success: false, error: `Failed: ${error.message || error.toString()}` };
    }
}

export async function getPastMayors() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma as any).pastMayor.findMany({
        orderBy: { order: 'asc' } // Or you could order by termStart later if preferred
    });
}

export async function upsertPastMayor(id: string | null, formData: FormData) {
    try {
        let imageUrl = formData.get("imageUrl")?.toString() || "";
        
        const uploadedImageUrl = await processImageUpload(formData, "imageFile");
        if (uploadedImageUrl && typeof uploadedImageUrl === "string" && uploadedImageUrl !== imageUrl) {
            imageUrl = uploadedImageUrl;
        }

        const data = {
            name: formData.get("name")?.toString() || "",
            termStart: formData.get("termStart")?.toString() || "",
            termEnd: formData.get("termEnd")?.toString() || "",
            description: formData.get("description")?.toString() || "",
            order: parseInt(formData.get("order")?.toString() || "0"),
            imageUrl: imageUrl || null
        };

        if (id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const existing = await (prisma as any).pastMayor.findUnique({ where: { id } });
            if (existing?.imageUrl && existing.imageUrl !== imageUrl) {
                await deleteUploadedFile(existing.imageUrl);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (prisma as any).pastMayor.update({
                where: { id },
                data
            });
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (prisma as any).pastMayor.create({
                data
            });
        }

        revalidatePath("/about");
        revalidatePath("/admin/about");
        return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error saving past mayor:", error);
        return { success: false, error: error.message };
    }
}

export async function deletePastMayor(id: string) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existing = await (prisma as any).pastMayor.findUnique({ where: { id } });
        if (existing?.imageUrl) {
            await deleteUploadedFile(existing.imageUrl);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).pastMayor.delete({
            where: { id }
        });
        
        revalidatePath("/about");
        revalidatePath("/admin/about");
        return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error deleting past mayor:", error);
        return { success: false, error: error.message };
    }
}
