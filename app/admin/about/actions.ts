"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { processImageUpload, deleteUploadedFile } from "@/app/admin/settings/actions";

export async function getAboutPage() {
    return await prisma.aboutPage.findFirst();
}

export async function upsertAboutPage(formData: FormData) {
    try {
        const existing = await prisma.aboutPage.findFirst();
        
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
            await prisma.aboutPage.update({
                where: { id: existing.id },
                data
            });
        } else {
            await prisma.aboutPage.create({
                data
            });
        }

        revalidatePath("/about");
        revalidatePath("/admin/about");
        return { success: true };
    } catch (error: any) {
        console.error("Error upserting about page:", error);
        return { success: false, error: `Failed: ${error.message || error.toString()}` };
    }
}
