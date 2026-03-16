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

export async function addDining(formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const newDining = await prisma.dining.create({
            data: {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                address: formData.get("address") as string,
                cuisineType: formData.get("cuisineType") as string,
                openingHours: formData.get("openingHours") as string,
                contactNumber: formData.get("contactNumber") as string,
                facebookUrl: formData.get("facebookUrl") as string,
                imageUrl: imageUrl,
                latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
                longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
                googleMapsUrl: formData.get("googleMapsUrl") as string,
                isPublished: true,
            },
        });

        revalidatePath("/admin/dining");
        return { success: true, dining: newDining };
    } catch (error) {
        console.error("Failed to add dining:", error);
        return { success: false, error: "Failed to create dining entry." };
    }
}

export async function deleteDining(id: string) {
    try {
        await prisma.dining.delete({
            where: { id }
        });
        revalidatePath("/admin/dining");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete dining:", error);
        return { success: false, error: "Failed to delete dining entry." };
    }
}

export async function updateDining(id: string, formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const updatedDining = await prisma.dining.update({
            where: { id },
            data: {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                address: formData.get("address") as string,
                cuisineType: formData.get("cuisineType") as string,
                openingHours: formData.get("openingHours") as string,
                contactNumber: formData.get("contactNumber") as string,
                facebookUrl: formData.get("facebookUrl") as string,
                imageUrl: imageUrl,
                latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
                longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
                googleMapsUrl: formData.get("googleMapsUrl") as string,
            },
        });

        revalidatePath("/admin/dining");
        return { success: true, dining: updatedDining };
    } catch (error) {
        console.error("Failed to update dining:", error);
        return { success: false, error: "Failed to update dining entry." };
    }
}

export async function toggleDiningStatus(id: string, isPublished: boolean) {
    try {
        await prisma.dining.update({
            where: { id },
            data: { isPublished }
        });
        revalidatePath("/admin/dining");
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update dining status." };
    }
}

// ----------------------------------------
// ACCOMMODATION (TULUYAN) ACTIONS
// ----------------------------------------

export async function addAccommodation(formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const newAccommodation = await prisma.accommodation.create({
            data: {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                address: formData.get("address") as string,
                type: formData.get("type") as string,
                priceRange: formData.get("priceRange") as string,
                amenities: formData.get("amenities") as string,
                contactNumber: formData.get("contactNumber") as string,
                websiteUrl: formData.get("websiteUrl") as string,
                imageUrl: imageUrl,
                latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
                longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
                googleMapsUrl: formData.get("googleMapsUrl") as string,
                isPublished: true,
            },
        });

        revalidatePath("/admin/accommodation");
        return { success: true, accommodation: newAccommodation };
    } catch (error) {
        console.error("Failed to add accommodation:", error);
        return { success: false, error: "Failed to create accommodation entry." };
    }
}

export async function deleteAccommodation(id: string) {
    try {
        await prisma.accommodation.delete({
            where: { id }
        });
        revalidatePath("/admin/accommodation");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete accommodation:", error);
        return { success: false, error: "Failed to delete accommodation entry." };
    }
}

export async function updateAccommodation(id: string, formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const updatedAccommodation = await prisma.accommodation.update({
            where: { id },
            data: {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                address: formData.get("address") as string,
                type: formData.get("type") as string,
                priceRange: formData.get("priceRange") as string,
                amenities: formData.get("amenities") as string,
                contactNumber: formData.get("contactNumber") as string,
                websiteUrl: formData.get("websiteUrl") as string,
                imageUrl: imageUrl,
                latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
                longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
                googleMapsUrl: formData.get("googleMapsUrl") as string,
            },
        });

        revalidatePath("/admin/accommodation");
        return { success: true, accommodation: updatedAccommodation };
    } catch (error) {
        console.error("Failed to update accommodation:", error);
        return { success: false, error: "Failed to update accommodation entry." };
    }
}

export async function toggleAccommodationStatus(id: string, isPublished: boolean) {
    try {
        await prisma.accommodation.update({
            where: { id },
            data: { isPublished }
        });
        revalidatePath("/admin/accommodation");
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update accommodation status." };
    }
}

// ----------------------------------------
// TOURISM SPOT (PLACE TO VISIT) ACTIONS
// ----------------------------------------

export async function addTourismSpot(formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const newSpot = await prisma.tourismSpot.create({
            data: {
                name: formData.get("name") as string,
                category: formData.get("category") as string,
                description: formData.get("description") as string,
                address: formData.get("address") as string,
                entranceFee: formData.get("entranceFee") as string,
                bestTimeToVisit: formData.get("bestTimeToVisit") as string,
                contactNumber: formData.get("contactNumber") as string,
                imageUrl: imageUrl,
                latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
                longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
                googleMapsUrl: formData.get("googleMapsUrl") as string,
                isPublished: true,
            },
        });

        revalidatePath("/admin/tourism");
        return { success: true, tourismSpot: newSpot };
    } catch (error) {
        console.error("Failed to add tourism spot:", error);
        return { success: false, error: "Failed to create tourism spot entry." };
    }
}

export async function deleteTourismSpot(id: string) {
    try {
        await prisma.tourismSpot.delete({
            where: { id }
        });
        revalidatePath("/admin/tourism");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete tourism spot:", error);
        return { success: false, error: "Failed to delete tourism spot entry." };
    }
}

export async function updateTourismSpot(id: string, formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const updatedSpot = await prisma.tourismSpot.update({
            where: { id },
            data: {
                name: formData.get("name") as string,
                category: formData.get("category") as string,
                description: formData.get("description") as string,
                address: formData.get("address") as string,
                entranceFee: formData.get("entranceFee") as string,
                bestTimeToVisit: formData.get("bestTimeToVisit") as string,
                contactNumber: formData.get("contactNumber") as string,
                imageUrl: imageUrl,
                latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
                longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
                googleMapsUrl: formData.get("googleMapsUrl") as string,
            },
        });

        revalidatePath("/admin/tourism");
        return { success: true, tourismSpot: updatedSpot };
    } catch (error) {
        console.error("Failed to update tourism spot:", error);
        return { success: false, error: "Failed to update tourism spot entry." };
    }
}

export async function toggleTourismSpotStatus(id: string, isPublished: boolean) {
    try {
        await prisma.tourismSpot.update({
            where: { id },
            data: { isPublished }
        });
        revalidatePath("/admin/tourism");
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update tourism spot status." };
    }
}

// ----------------------------------------
// EVENT ACTIONS
// ----------------------------------------

export async function addEvent(formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const newEvent = await prisma.event.create({
            data: {
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                category: formData.get("category") as string,
                startDate: new Date(formData.get("startDate") as string),
                endDate: new Date(formData.get("endDate") as string),
                venueName: formData.get("venueName") as string,
                address: formData.get("address") as string,
                contactNumber: formData.get("contactNumber") as string,
                imageUrl: imageUrl,
                latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
                longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
                googleMapsUrl: formData.get("googleMapsUrl") as string,
                reminders: (formData.get("reminders") as string)?.split("\n").map(r => r.trim()).filter(r => r !== "") || [],
                isPublished: true,
            },
        });

        revalidatePath("/admin/events");
        return { success: true, event: newEvent };
    } catch (error) {
        console.error("Failed to add event:", error);
        return { success: false, error: "Failed to create event entry." };
    }
}

export async function updateEvent(id: string, formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                category: formData.get("category") as string,
                startDate: new Date(formData.get("startDate") as string),
                endDate: new Date(formData.get("endDate") as string),
                venueName: formData.get("venueName") as string,
                address: formData.get("address") as string,
                contactNumber: formData.get("contactNumber") as string,
                imageUrl: imageUrl,
                latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
                longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
                googleMapsUrl: formData.get("googleMapsUrl") as string,
            },
        });

        revalidatePath("/admin/events");
        return { success: true, event: updatedEvent };
    } catch (error) {
        console.error("Failed to update event:", error);
        return { success: false, error: "Failed to update event entry." };
    }
}

export async function deleteEvent(id: string) {
    try {
        await prisma.event.delete({
            where: { id }
        });
        revalidatePath("/admin/events");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete event:", error);
        return { success: false, error: "Failed to delete event entry." };
    }
}

export async function toggleEventStatus(id: string, isPublished: boolean) {
    try {
        await prisma.event.update({
            where: { id },
            data: { isPublished }
        });
        revalidatePath("/admin/events");
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update event status." };
    }
}

// ----------------------------------------
// NEWS ACTIONS
// ----------------------------------------

export async function addNews(formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const newNews = await prisma.news.create({
            data: {
                title: formData.get("title") as string,
                content: formData.get("content") as string,
                author: formData.get("author") as string | null,
                category: formData.get("category") as string,
                publishDate: new Date(formData.get("publishDate") as string || Date.now()),
                imageUrl: imageUrl,
                isPublished: true,
            },
        });

        revalidatePath("/admin/news");
        return { success: true, news: newNews };
    } catch (error) {
        console.error("Failed to add news:", error);
        return { success: false, error: "Failed to create news entry." };
    }
}

export async function updateNews(id: string, formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const updatedNews = await prisma.news.update({
            where: { id },
            data: {
                title: formData.get("title") as string,
                content: formData.get("content") as string,
                author: formData.get("author") as string | null,
                category: formData.get("category") as string,
                publishDate: new Date(formData.get("publishDate") as string || Date.now()),
                imageUrl: imageUrl,
            },
        });

        revalidatePath("/admin/news");
        return { success: true, news: updatedNews };
    } catch (error) {
        console.error("Failed to update news:", error);
        return { success: false, error: "Failed to update news entry." };
    }
}

export async function deleteNews(id: string) {
    try {
        await prisma.news.delete({
            where: { id }
        });
        revalidatePath("/admin/news");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete news:", error);
        return { success: false, error: "Failed to delete news entry." };
    }
}

export async function toggleNewsStatus(id: string, isPublished: boolean) {
    try {
        await prisma.news.update({
            where: { id },
            data: { isPublished }
        });
        revalidatePath("/admin/news");
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update news status." };
    }
}

// ----------------------------------------
// JOB POSTING ACTIONS
// ----------------------------------------

export async function addJob(formData: FormData) {
    try {
        const newJob = await prisma.job.create({
            data: {
                title: formData.get("title") as string,
                department: formData.get("department") as string,
                description: formData.get("description") as string,
                qualifications: formData.get("qualifications") as string,
                requirements: formData.get("requirements") as string,
                salary: formData.get("salary") as string | null,
                employmentType: formData.get("employmentType") as string,
                deadline: formData.get("deadline") ? new Date(formData.get("deadline") as string) : null,
                isActive: true, // Default to true when created
            },
        });

        revalidatePath("/admin/jobs");
        return { success: true, job: newJob };
    } catch (error) {
        console.error("Failed to add job:", error);
        return { success: false, error: "Failed to create job entry." };
    }
}

export async function updateJob(id: string, formData: FormData) {
    try {
        const updatedJob = await prisma.job.update({
            where: { id },
            data: {
                title: formData.get("title") as string,
                department: formData.get("department") as string,
                description: formData.get("description") as string,
                qualifications: formData.get("qualifications") as string,
                requirements: formData.get("requirements") as string,
                salary: formData.get("salary") as string | null,
                employmentType: formData.get("employmentType") as string,
                deadline: formData.get("deadline") ? new Date(formData.get("deadline") as string) : null,
            },
        });

        revalidatePath("/admin/jobs");
        return { success: true, job: updatedJob };
    } catch (error) {
        console.error("Failed to update job:", error);
        return { success: false, error: "Failed to update job entry." };
    }
}

export async function deleteJob(id: string) {
    try {
        await prisma.job.delete({
            where: { id }
        });
        revalidatePath("/admin/jobs");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete job:", error);
        return { success: false, error: "Failed to delete job entry." };
    }
}

export async function toggleJobStatus(id: string, isActive: boolean) {
    try {
        await prisma.job.update({
            where: { id },
            data: { isActive }
        });
        revalidatePath("/admin/jobs");
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update job status." };
    }
}

// ----------------------------------------
// COUNCIL MEMBERS (OFFICIALS) ACTIONS
// ----------------------------------------

export async function addOfficial(formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        // Convert the order field to an integer safely
        const orderValue = formData.get("order") as string;
        const parsedOrder = orderValue ? parseInt(orderValue, 10) : 0;

        const newOfficial = await prisma.official.create({
            data: {
                name: formData.get("name") as string,
                position: formData.get("position") as string,
                contactNumber: formData.get("contactNumber") as string | null,
                facebookUrl: formData.get("facebookUrl") as string | null,
                bio: formData.get("bio") as string | null,
                termStart: formData.get("termStart") ? new Date(formData.get("termStart") as string) : null,
                termEnd: formData.get("termEnd") ? new Date(formData.get("termEnd") as string) : null,
                order: isNaN(parsedOrder) ? 0 : parsedOrder,
                imageUrl: imageUrl,
                isActive: true,
            },
        });

        revalidatePath("/admin/officials");
        return { success: true, official: newOfficial };
    } catch (error) {
        console.error("Failed to add official:", error);
        return { success: false, error: "Failed to create official entry." };
    }
}

export async function updateOfficial(id: string, formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const orderValue = formData.get("order") as string;
        const parsedOrder = orderValue ? parseInt(orderValue, 10) : 0;

        const updatedOfficial = await prisma.official.update({
            where: { id },
            data: {
                name: formData.get("name") as string,
                position: formData.get("position") as string,
                contactNumber: formData.get("contactNumber") as string | null,
                facebookUrl: formData.get("facebookUrl") as string | null,
                bio: formData.get("bio") as string | null,
                termStart: formData.get("termStart") ? new Date(formData.get("termStart") as string) : null,
                termEnd: formData.get("termEnd") ? new Date(formData.get("termEnd") as string) : null,
                order: isNaN(parsedOrder) ? 0 : parsedOrder,
                imageUrl: imageUrl,
            },
        });

        revalidatePath("/admin/officials");
        return { success: true, official: updatedOfficial };
    } catch (error) {
        console.error("Failed to update official:", error);
        return { success: false, error: "Failed to update official entry." };
    }
}

export async function deleteOfficial(id: string) {
    try {
        await prisma.official.delete({
            where: { id }
        });
        revalidatePath("/admin/officials");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete official:", error);
        return { success: false, error: "Failed to delete official entry." };
    }
}

export async function toggleOfficialStatus(id: string, isActive: boolean) {
    try {
        await prisma.official.update({
            where: { id },
            data: { isActive }
        });
        revalidatePath("/admin/officials");
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update official status." };
    }
}

// ----------------------------------------
// HOTLINE DIRECTORY ACTIONS
// ----------------------------------------

export async function addHotline(formData: FormData) {
    try {
        const orderValue = formData.get("order") as string;
        const parsedOrder = orderValue ? parseInt(orderValue, 10) : 0;

        const newHotline = await prisma.hotline.create({
            data: {
                name: formData.get("name") as string,
                category: formData.get("category") as string,
                mobileNumber: formData.get("mobileNumber") as string | null,
                telephone: formData.get("telephone") as string | null,
                address: formData.get("address") as string | null,
                order: isNaN(parsedOrder) ? 0 : parsedOrder,
                isActive: true,
            },
        });

        revalidatePath("/admin/hotlines");
        return { success: true, hotline: newHotline };
    } catch (error) {
        console.error("Failed to add hotline:", error);
        return { success: false, error: "Failed to create hotline entry." };
    }
}

export async function updateHotline(id: string, formData: FormData) {
    try {
        const orderValue = formData.get("order") as string;
        const parsedOrder = orderValue ? parseInt(orderValue, 10) : 0;

        const updatedHotline = await prisma.hotline.update({
            where: { id },
            data: {
                name: formData.get("name") as string,
                category: formData.get("category") as string,
                mobileNumber: formData.get("mobileNumber") as string | null,
                telephone: formData.get("telephone") as string | null,
                address: formData.get("address") as string | null,
                order: isNaN(parsedOrder) ? 0 : parsedOrder,
            },
        });

        revalidatePath("/admin/hotlines");
        return { success: true, hotline: updatedHotline };
    } catch (error) {
        console.error("Failed to update hotline:", error);
        return { success: false, error: "Failed to update hotline entry." };
    }
}

export async function deleteHotline(id: string) {
    try {
        await prisma.hotline.delete({
            where: { id }
        });
        revalidatePath("/admin/hotlines");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete hotline:", error);
        return { success: false, error: "Failed to delete hotline entry." };
    }
}

export async function toggleHotlineStatus(id: string, isActive: boolean) {
    try {
        await prisma.hotline.update({
            where: { id },
            data: { isActive }
        });
        revalidatePath("/admin/hotlines");
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update hotline status." };
    }
}

// ----------------------------------------
// PROJECTS MODULE ACTIONS
// ----------------------------------------

export async function addProject(formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const project = await prisma.project.create({
            data: {
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                category: formData.get("category") as string,
                status: formData.get("status") as string,
                location: formData.get("location") as string,
                budget: (formData.get("budget") as string) || null,
                contractor: (formData.get("contractor") as string) || null,
                startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string) : null,
                endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string) : null,
                progress: parseInt(formData.get("progress") as string || "0", 10),
                imageUrl: imageUrl,
                isPublished: true,
            }
        });

        revalidatePath("/admin/projects");
        return { success: true, project };
    } catch (error) {
        console.error("Failed to add project:", error);
        return { success: false, error: "Failed to create project entry." };
    }
}

export async function updateProject(id: string, formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const project = await prisma.project.update({
            where: { id },
            data: {
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                category: formData.get("category") as string,
                status: formData.get("status") as string,
                location: formData.get("location") as string,
                budget: (formData.get("budget") as string) || null,
                contractor: (formData.get("contractor") as string) || null,
                startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string) : null,
                endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string) : null,
                progress: parseInt(formData.get("progress") as string || "0", 10),
                imageUrl: imageUrl,
            }
        });

        revalidatePath("/admin/projects");
        return { success: true, project };
    } catch (error) {
        console.error("Failed to update project:", error);
        return { success: false, error: "Failed to update project entry." };
    }
}

export async function deleteProject(id: string) {
    try {
        await prisma.project.delete({
            where: { id }
        });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete project:", error);
        return { success: false, error: "Failed to delete project entry." };
    }
}

export async function toggleProjectStatus(id: string, isPublished: boolean) {
    try {
        await prisma.project.update({
            where: { id },
            data: { isPublished }
        });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update project publication status." };
    }
}
// ----------------------------------------
// HOUSEHOLD MAP ACTIONS (Admin Only)
// ----------------------------------------

export async function addHousehold(formData: FormData) {
    try {
        const household = await prisma.household.create({
            data: {
                headOfFamily: formData.get("headOfFamily") as string,
                barangay: formData.get("barangay") as string,
                latitude: parseFloat(formData.get("latitude") as string),
                longitude: parseFloat(formData.get("longitude") as string),
                householdSize: parseInt(formData.get("householdSize") as string, 10),
                contactNumber: (formData.get("contactNumber") as string) || null,
                riskLevel: (formData.get("riskLevel") as string) || "Safe",
                specialSectors: (formData.get("specialSectors") as string) || null,
                notes: (formData.get("notes") as string) || null,
            }
        });

        revalidatePath("/admin/households");
        return { success: true, household };
    } catch (error) {
        console.error("Failed to add household:", error);
        return { success: false, error: "Failed to create household entry." };
    }
}

export async function updateHousehold(id: string, formData: FormData) {
    try {
        const household = await prisma.household.update({
            where: { id },
            data: {
                headOfFamily: formData.get("headOfFamily") as string,
                barangay: formData.get("barangay") as string,
                latitude: parseFloat(formData.get("latitude") as string),
                longitude: parseFloat(formData.get("longitude") as string),
                householdSize: parseInt(formData.get("householdSize") as string, 10),
                contactNumber: (formData.get("contactNumber") as string) || null,
                riskLevel: (formData.get("riskLevel") as string) || "Safe",
                specialSectors: (formData.get("specialSectors") as string) || null,
                notes: (formData.get("notes") as string) || null,
            }
        });

        revalidatePath("/admin/households");
        return { success: true, household };
    } catch (error) {
        console.error("Failed to update household:", error);
        return { success: false, error: "Failed to update household entry." };
    }
}

export async function deleteHousehold(id: string) {
    try {
        await prisma.household.delete({
            where: { id }
        });
        revalidatePath("/admin/households");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete household:", error);
        return { success: false, error: "Failed to delete household entry." };
    }
}

// ==========================================
// RESIDENT REGISTRATION ACTIONS
// ==========================================

export async function addResident(formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const resident = await prisma.resident.create({
            data: {
                firstName: formData.get("firstName") as string,
                lastName: formData.get("lastName") as string,
                middleName: formData.get("middleName") as string || null,
                dateOfBirth: new Date(formData.get("dateOfBirth") as string),
                gender: formData.get("gender") as string,
                civilStatus: formData.get("civilStatus") as string,
                bloodType: formData.get("bloodType") as string || null,
                contactNumber: formData.get("contactNumber") as string || null,
                email: formData.get("email") as string || null,
                barangay: formData.get("barangay") as string,
                address: formData.get("address") as string,
                occupation: formData.get("occupation") as string || null,
                emergencyContactName: formData.get("emergencyContactName") as string || null,
                emergencyContactNumber: formData.get("emergencyContactNumber") as string || null,
                imageUrl: imageUrl,
            }
        });

        revalidatePath("/admin/residents");
        return { success: true, data: resident };
    } catch (error) {
        console.error("Error adding resident:", error);
        return { success: false, error: "Failed to add resident" };
    }
}

export async function updateResident(id: string, formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);

        const dataToUpdate: {
            firstName: string;
            lastName: string;
            middleName: string | null;
            dateOfBirth: Date;
            gender: string;
            civilStatus: string;
            bloodType: string | null;
            contactNumber: string | null;
            email: string | null;
            barangay: string;
            address: string;
            occupation: string | null;
            emergencyContactName: string | null;
            emergencyContactNumber: string | null;
            imageUrl?: string | null;
        } = {
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            middleName: formData.get("middleName") as string || null,
            dateOfBirth: new Date(formData.get("dateOfBirth") as string),
            gender: formData.get("gender") as string,
            civilStatus: formData.get("civilStatus") as string,
            bloodType: formData.get("bloodType") as string || null,
            contactNumber: formData.get("contactNumber") as string || null,
            email: formData.get("email") as string || null,
            barangay: formData.get("barangay") as string,
            address: formData.get("address") as string,
            occupation: formData.get("occupation") as string || null,
            emergencyContactName: formData.get("emergencyContactName") as string || null,
            emergencyContactNumber: formData.get("emergencyContactNumber") as string || null,
        };

        if (imageUrl !== null) {
            dataToUpdate.imageUrl = imageUrl;
        }

        const resident = await prisma.resident.update({
            where: { id },
            data: dataToUpdate
        });

        revalidatePath("/admin/residents");
        return { success: true, data: resident };
    } catch (error) {
        console.error("Error updating resident:", error);
        return { success: false, error: "Failed to update resident" };
    }
}

export async function deleteResident(id: string) {
    try {
        await prisma.resident.delete({
            where: { id }
        });

        revalidatePath("/admin/residents");
        return { success: true };
    } catch (error) {
        console.error("Error deleting resident:", error);
        return { success: false, error: "Failed to delete resident" };
    }
}

// ----------------------------------------
// DISASTER HAZARD MAPPING ACTIONS
// ----------------------------------------

export async function getDisasterZones() {
    try {
        const zoneDelegate = prisma.disasterZone;
        if (!zoneDelegate) {
            console.warn("disasterZone delegate missing on prisma instance");
            return { success: false, error: "Database model not recognized yet." };
        }
        const rawZones = await zoneDelegate.findMany({
            orderBy: { createdAt: "desc" }
        });

        // Ensure shapes are always parsed correctly
        const zones = rawZones.map((z) => ({
            ...z,
            shapes: typeof z.shapes === 'string'
                ? JSON.parse(z.shapes)
                : (z.shapes || [])
        }));

        return { success: true, zones };
    } catch (error) {
        console.error("Failed to fetch disaster zones:", error);
        return { success: false, error: "Failed to fetch disaster zones." };
    }
}

export async function addDisasterZone(data: {
    type: string;
    typeColor: string;
    riskLevel: string;
    riskColor: string;
    shapes: [number, number][][];
}) {
    try {
        const zoneDelegate = prisma.disasterZone;
        if (!zoneDelegate) throw new Error("disasterZone model not found");

        const zone = await zoneDelegate.create({
            data: {
                type: data.type,
                typeColor: data.typeColor,
                riskLevel: data.riskLevel,
                riskColor: data.riskColor,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                shapes: data.shapes as any,
            }
        });

        revalidatePath("/admin/disasters");
        return { success: true, zone };
    } catch (error) {
        console.error("Failed to add disaster zone:", error);
        return { success: false, error: "Failed to create disaster zone." };
    }
}

export async function updateDisasterZone(id: string, data: {
    type?: string;
    typeColor?: string;
    riskLevel?: string;
    riskColor?: string;
    shapes?: [number, number][][];
}) {
    try {
        const zoneDelegate = prisma.disasterZone;
        if (!zoneDelegate) throw new Error("disasterZone model not found");

        const updateData: {
            type?: string;
            typeColor?: string;
            riskLevel?: string;
            riskColor?: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            shapes?: any;
        } = {};
        if (data.type) updateData.type = data.type;
        if (data.typeColor) updateData.typeColor = data.typeColor;
        if (data.riskLevel) updateData.riskLevel = data.riskLevel;
        if (data.riskColor) updateData.riskColor = data.riskColor;
        if (data.shapes) updateData.shapes = data.shapes;

        const zone = await zoneDelegate.update({
            where: { id },
            data: updateData
        });

        revalidatePath("/admin/disasters");
        return { success: true, zone };
    } catch (error) {
        console.error("Failed to update disaster zone:", error);
        return { success: false, error: "Failed to update disaster zone." };
    }
}

export async function deleteDisasterZone(id: string) {
    try {
        const zoneDelegate = prisma.disasterZone;
        if (!zoneDelegate) throw new Error("disasterZone model not found");

        await zoneDelegate.delete({
            where: { id }
        });
        revalidatePath("/admin/disasters");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete disaster zone:", error);
        return { success: false, error: "Failed to delete disaster zone." };
    }
}

// ----------------------------------------
// DISASTER MAP ACTIONS
// ----------------------------------------

export async function addDisasterMap(formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapDelegate = (prisma as any).disasterMap;
        
        // If not found, it might be due to server cache. We'll try to access it via general prisma call
        // but the best fix is a server restart.
        if (!mapDelegate) throw new Error("Database model 'disasterMap' not found. YOU MUST RESTART THE NPM DEV SERVER (Ctrl+C, then npm run dev) to load the new database schema.");

        const newMap = await mapDelegate.create({
            data: {
                title: formData.get("title") as string,
                location: formData.get("location") as string || null,
                description: formData.get("description") as string || null,
                imagePath: imageUrl,
                riskLevel: formData.get("riskLevel") as string || null,
                isPublished: true,
            },
        });

        revalidatePath("/admin/disasters");
        return { success: true, disasterMap: newMap };
    } catch (error) {
        console.error("Failed to add disaster map:", error);
        return { success: false, error: "Failed to create disaster map entry." };
    }
}

export async function updateDisasterMap(id: string, formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapDelegate = (prisma as any).disasterMap;
        if (!mapDelegate) throw new Error("Database model 'disasterMap' not found. Please restart your dev server.");

        const updatedMap = await mapDelegate.update({
            where: { id },
            data: {
                title: formData.get("title") as string,
                location: formData.get("location") as string || null,
                description: formData.get("description") as string || null,
                imagePath: imageUrl || undefined,
                riskLevel: formData.get("riskLevel") as string || null,
            },
        });

        revalidatePath("/admin/disasters");
        return { success: true, disasterMap: updatedMap };
    } catch (error) {
        console.error("Failed to update disaster map:", error);
        return { success: false, error: "Failed to update disaster map entry." };
    }
}

export async function deleteDisasterMap(id: string) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapDelegate = (prisma as any).disasterMap;
        if (!mapDelegate) throw new Error("Database model 'disasterMap' not found.");

        await mapDelegate.delete({
            where: { id }
        });
        revalidatePath("/admin/disasters");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete disaster map:", error);
        return { success: false, error: "Failed to delete disaster map entry." };
    }
}

export async function toggleDisasterMapStatus(id: string, isPublished: boolean) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapDelegate = (prisma as any).disasterMap;
        if (!mapDelegate) throw new Error("Database model 'disasterMap' not found.");

        await mapDelegate.update({
            where: { id },
            data: { isPublished }
        });
        revalidatePath("/admin/disasters");
        return { success: true };
    } catch (error) {
        console.error("Failed to update disaster map status:", error);
        return { success: false, error: "Failed to update disaster map status." };
    }
}

// -----------------------------------------------------------------------------
// ANNOUNCEMENTS
// -----------------------------------------------------------------------------

export async function addAnnouncement(formData: FormData) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const announcementDelegate = (prisma as any).announcement;
        if (!announcementDelegate) throw new Error("Database model 'announcement' not found.");

        const expiryDate = formData.get("expiryDate") as string;
        
        const newAnnouncement = await announcementDelegate.create({
            data: {
                title: formData.get("title") as string,
                content: formData.get("content") as string,
                category: formData.get("category") as string,
                priority: formData.get("priority") as string,
                isPinned: formData.get("isPinned") === "on",
                isActive: formData.get("isActive") === "on",
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            },
        });

        revalidatePath("/admin/announcements");
        return { success: true, announcement: newAnnouncement };
    } catch (error) {
        console.error("Failed to add announcement:", error);
        return { success: false, error: "Failed to create announcement entry. Make sure you restarted the server after prisma generate." };
    }
}

export async function deleteAnnouncement(id: string) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const announcementDelegate = (prisma as any).announcement;
        await announcementDelegate.delete({ where: { id } });
        revalidatePath("/admin/announcements");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete announcement:", error);
        return { success: false, error: "Failed to delete announcement." };
    }
}

export async function updateAnnouncement(id: string, formData: FormData) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const announcementDelegate = (prisma as any).announcement;
        const expiryDate = formData.get("expiryDate") as string;

        const updated = await announcementDelegate.update({
            where: { id },
             data: {
                title: formData.get("title") as string,
                content: formData.get("content") as string,
                category: formData.get("category") as string,
                priority: formData.get("priority") as string,
                isPinned: formData.get("isPinned") === "on",
                isActive: formData.get("isActive") === "on",
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            },
        });

        revalidatePath("/admin/announcements");
        return { success: true, announcement: updated };
    } catch (error) {
        console.error("Failed to update announcement:", error);
        return { success: false, error: "Failed to update announcement." };
    }
}

export async function toggleAnnouncementStatus(id: string, isActive: boolean) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const announcementDelegate = (prisma as any).announcement;
        await announcementDelegate.update({
            where: { id },
            data: { isActive }
        });
        revalidatePath("/admin/announcements");
        return { success: true };
    } catch (error) {
        console.error("Failed to update announcement status:", error);
        return { success: false, error: "Failed to update status." };
    }
}

export async function toggleAnnouncementPin(id: string, isPinned: boolean) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const announcementDelegate = (prisma as any).announcement;
        await announcementDelegate.update({
            where: { id },
            data: { isPinned }
        });
        revalidatePath("/admin/announcements");
        return { success: true };
    } catch (error) {
        console.error("Failed to update announcement pin status:", error);
        return { success: false, error: "Failed to update pin status." };
    }
}


