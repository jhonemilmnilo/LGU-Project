/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

async function processImageUpload(formData: FormData, fieldName: string = "imageFile"): Promise<string | null> {
    const file = formData.get(fieldName) as File | null;
    let imageUrl = formData.get(`${fieldName}Url`) as string | null;

    if (file && file.size > 0 && file.name !== "undefined") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + (file.name || "upload").replaceAll(" ", "_");
        const uploadsDir = path.join(process.cwd(), "public/uploads");
        const filepath = path.join(uploadsDir, filename);
        
        // Ensure directory exists
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        await writeFile(filepath, buffer);
        imageUrl = `/uploads/${filename}`;
    }

    return imageUrl || null;
}

// ----------------------------------------
// SEARCH & DISCOVERY ACTIONS
// ----------------------------------------

export async function searchHeads(query: string) {
    try {
        const residents = await prisma.resident.findMany({
            where: {
                isHead: true,
                OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                ]
            },
            take: 10,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                barangay: true
            }
        });
        return { success: true, data: residents };
    } catch (error) {
        console.error("Search head error:", error);
        return { success: false, error: "Failed to search residents" };
    }
}

export async function getHeadDetails(id: string) {
    try {
        const head = await prisma.resident.findUnique({
            where: { id },
            include: {
                familyMembers: true
            }
        });

        if (!head) return { success: false, error: "Head not found" };

        return { 
            success: true, 
            data: {
                barangay: head.barangay,
                contactNumber: head.contactNumber,
                familyCount: 1 + (head.familyMembers?.length || 0)
            } 
        };
    } catch (error) {
        console.error("Get head details error:", error);
        return { success: false, error: "Failed to fetch head details" };
    }
}

// ----------------------------------------
// DINING (KAINAN) ACTIONS
// ----------------------------------------

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
                isActive: true,
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

// ... existing deleteOfficial and toggleOfficialStatus ...
export async function deleteOfficial(id: string) {
    try {
        await prisma.official.delete({ where: { id } });
        revalidatePath("/admin/officials");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete official:", error);
        return { success: false, error: "Failed to delete official entry." };
    }
}

export async function toggleOfficialStatus(id: string, isActive: boolean) {
    try {
        await prisma.official.update({ where: { id }, data: { isActive } });
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
        await prisma.hotline.delete({ where: { id } });
        revalidatePath("/admin/hotlines");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete hotline:", error);
        return { success: false, error: "Failed to delete hotline entry." };
    }
}

export async function toggleHotlineStatus(id: string, isActive: boolean) {
    try {
        await prisma.hotline.update({ where: { id }, data: { isActive } });
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
        await prisma.project.delete({ where: { id } });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete project:", error);
        return { success: false, error: "Failed to delete project entry." };
    }
}

export async function toggleProjectStatus(id: string, isPublished: boolean) {
    try {
        await prisma.project.update({ where: { id }, data: { isPublished } });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update project publication status." };
    }
}

// ==========================================
// HOUSEHOLD ACTIONS
// ==========================================

export async function addHousehold(formData: FormData) {
    try {
        const headId = formData.get("headId") as string;
        
        const household = await prisma.household.create({
            data: {
                headId: headId || null,
                barangay: formData.get("barangay") as string,
                latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
                longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
                householdSize: parseInt(formData.get("householdSize") as string || "1", 10),
                contactNumber: (formData.get("contactNumber") as string) || null,
                riskLevel: (formData.get("riskLevel") as string) || "Safe",
                notes: (formData.get("notes") as string) || null,
            }
        });

        if (headId) {
            await prisma.resident.update({
                where: { id: headId },
                data: {
                    isHead: true,
                    householdId: household.id,
                    relationshipToHead: "Head"
                }
            });
        }

        revalidatePath("/admin/households");
        revalidatePath("/admin/residents");
        return { success: true, household };
    } catch (error) {
        console.error("Failed to add household:", error);
        return { success: false, error: "Failed to create household entry." };
    }
}

export async function updateHousehold(id: string, formData: FormData) {
    try {
        const headId = formData.get("headId") as string;

        const household = await prisma.household.update({
            where: { id },
            data: {
                headId: headId || null,
                barangay: formData.get("barangay") as string,
                latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
                longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
                householdSize: parseInt(formData.get("householdSize") as string || "1", 10),
                contactNumber: (formData.get("contactNumber") as string) || null,
                riskLevel: (formData.get("riskLevel") as string) || "Safe",
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
        await prisma.household.delete({ where: { id } });
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
        const imageUrl = await processImageUpload(formData, "imageUrl");
        const idFrontUrl = await processImageUpload(formData, "idFrontUrl");
        const idBackUrl = await processImageUpload(formData, "idBackUrl");
        const livenessUrl = await processImageUpload(formData, "livenessUrl");

        const familyMembersData = formData.get("familyMembers") as string;
        const familyMembers = familyMembersData ? JSON.parse(familyMembersData) : [];

        const resident = await prisma.resident.create({
            data: {
                firstName: formData.get("firstName") as string,
                lastName: formData.get("lastName") as string,
                middleName: formData.get("middleName") as string || null,
                suffix: formData.get("suffix") as string || null,
                gender: formData.get("gender") as string,
                dateOfBirth: new Date(formData.get("dateOfBirth") as string),
                age: formData.get("age") ? parseInt(formData.get("age") as string, 10) : null,
                placeOfBirth: formData.get("placeOfBirth") as string || null,
                civilStatus: formData.get("civilStatus") as string,
                citizenship: formData.get("citizenship") as string || "Filipino",
                height: formData.get("height") as string || null,
                weight: formData.get("weight") as string || null,
                religion: formData.get("religion") as string || null,
                bloodType: formData.get("bloodType") as string || null,
                houseNumber: formData.get("houseNumber") as string || null,
                street: formData.get("street") as string || null,
                sitio: formData.get("sitio") as string || null,
                purok: formData.get("purok") as string || null,
                barangay: formData.get("barangay") as string,
                municipality: formData.get("municipality") as string || "Mapandan",
                province: formData.get("province") as string || "Pangasinan",
                contactNumber: formData.get("contactNumber") as string || null,
                email: formData.get("email") as string || null,
                isHead: formData.get("isHead") === "true",
                relationshipToHead: formData.get("relationshipToHead") as string || null,
                householdId: formData.get("householdId") as string || null,
                tin: formData.get("tin") as string || null,
                gsis: formData.get("gsis") as string || null,
                sss: formData.get("sss") as string || null,
                occupation: formData.get("occupation") as string || null,
                employer: formData.get("employer") as string || null,
                motherFirstName: formData.get("motherFirstName") as string || null,
                motherMiddleName: formData.get("motherMiddleName") as string || null,
                motherLastName: formData.get("motherLastName") as string || null,
                fatherFirstName: formData.get("fatherFirstName") as string || null,
                fatherMiddleName: formData.get("fatherMiddleName") as string || null,
                fatherLastName: formData.get("fatherLastName") as string || null,
                idType: formData.get("idType") as string || null,
                idFrontUrl,
                idBackUrl,
                livenessUrl,
                educationalAttainment: formData.get("educationalAttainment") as string || null,
                employmentStatus: formData.get("employmentStatus") as string || null,
                monthlyIncome: formData.get("monthlyIncome") as string || null,
                isSenior: formData.get("isSenior") === "true",
                isPWD: formData.get("isPWD") === "true",
                isSoloParent: formData.get("isSoloParent") === "true",
                isIndigenous: formData.get("isIndigenous") === "true",
                is4Ps: formData.get("is4Ps") === "true",
                otherSector: formData.get("otherSector") as string || null,
                dataPrivacyConsent: formData.get("dataPrivacyConsent") === "true",
                consentTimestamp: formData.get("dataPrivacyConsent") === "true" ? new Date() : null,
                receivedBy: formData.get("receivedBy") as string || null,
                officialPosition: formData.get("officialPosition") as string || null,
                dateReceived: formData.get("dateReceived") ? new Date(formData.get("dateReceived") as string) : null,
                imageUrl,
                familyMembers: {
                    create: familyMembers.map((fm: any) => ({
                        fullName: fm.fullName,
                        relationship: fm.relationship,
                        age: fm.age ? parseInt(fm.age, 10) : null,
                    }))
                }
            }
        });

        // Update household size if added to one
        if (formData.get("householdId")) {
            await prisma.household.update({
                where: { id: formData.get("householdId") as string },
                data: { householdSize: { increment: 1 } }
            });
        }

        revalidatePath("/admin/residents");
        revalidatePath("/admin/households");
        return { success: true, data: resident };
    } catch (error) {
        console.error("Error adding resident:", error);
        return { success: false, error: "Failed to add resident" };
    }
}

export async function updateResident(id: string, formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData, "imageUrl");
        const idFrontUrl = await processImageUpload(formData, "idFrontUrl");
        const idBackUrl = await processImageUpload(formData, "idBackUrl");
        const livenessUrl = await processImageUpload(formData, "livenessUrl");

        const dataToUpdate: any = {
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            middleName: formData.get("middleName") as string || null,
            suffix: formData.get("suffix") as string || null,
            gender: formData.get("gender") as string,
            dateOfBirth: new Date(formData.get("dateOfBirth") as string),
            age: formData.get("age") ? parseInt(formData.get("age") as string, 10) : null,
            placeOfBirth: formData.get("placeOfBirth") as string || null,
            civilStatus: formData.get("civilStatus") as string,
            citizenship: formData.get("citizenship") as string || "Filipino",
            height: formData.get("height") as string || null,
            weight: formData.get("weight") as string || null,
            religion: formData.get("religion") as string || null,
            bloodType: formData.get("bloodType") as string || null,
            houseNumber: formData.get("houseNumber") as string || null,
            street: formData.get("street") as string || null,
            sitio: formData.get("sitio") as string || null,
            purok: formData.get("purok") as string || null,
            barangay: formData.get("barangay") as string,
            contactNumber: formData.get("contactNumber") as string || null,
            email: formData.get("email") as string || null,
            isHead: formData.get("isHead") === "true",
            relationshipToHead: formData.get("relationshipToHead") as string || null,
            householdId: formData.get("householdId") as string || null,
            tin: formData.get("tin") as string || null,
            gsis: formData.get("gsis") as string || null,
            sss: formData.get("sss") as string || null,
            occupation: formData.get("occupation") as string || null,
            employer: formData.get("employer") as string || null,
            motherFirstName: formData.get("motherFirstName") as string || null,
            motherMiddleName: formData.get("motherMiddleName") as string || null,
            motherLastName: formData.get("motherLastName") as string || null,
            fatherFirstName: formData.get("fatherFirstName") as string || null,
            fatherMiddleName: formData.get("fatherMiddleName") as string || null,
            fatherLastName: formData.get("fatherLastName") as string || null,
            idType: formData.get("idType") as string || null,
            educationalAttainment: formData.get("educationalAttainment") as string || null,
            employmentStatus: formData.get("employmentStatus") as string || null,
            monthlyIncome: formData.get("monthlyIncome") as string || null,
            isSenior: formData.get("isSenior") === "true",
            isPWD: formData.get("isPWD") === "true",
            isSoloParent: formData.get("isSoloParent") === "true",
            isIndigenous: formData.get("isIndigenous") === "true",
            is4Ps: formData.get("is4Ps") === "true",
            otherSector: formData.get("otherSector") as string || null,
            dataPrivacyConsent: formData.get("dataPrivacyConsent") === "true",
            receivedBy: formData.get("receivedBy") as string || null,
            officialPosition: formData.get("officialPosition") as string || null,
            dateReceived: formData.get("dateReceived") ? new Date(formData.get("dateReceived") as string) : null,
        };

        if (imageUrl) dataToUpdate.imageUrl = imageUrl;
        if (idFrontUrl) dataToUpdate.idFrontUrl = idFrontUrl;
        if (idBackUrl) dataToUpdate.idBackUrl = idBackUrl;
        if (livenessUrl) dataToUpdate.livenessUrl = livenessUrl;

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
        const resident = await prisma.resident.findUnique({ where: { id } });
        await prisma.resident.delete({ where: { id } });

        if (resident?.householdId) {
            await prisma.household.update({
                where: { id: resident.householdId },
                data: { householdSize: { decrement: 1 } }
            });
        }

        revalidatePath("/admin/residents");
        revalidatePath("/admin/households");
        return { success: true };
    } catch (error) {
        console.error("Error deleting resident:", error);
        return { success: false, error: "Failed to delete resident" };
    }
}

// ----------------------------------------
// HAZARD & DISASTER ACTIONS
// ----------------------------------------

export async function getDisasterZones() {
    try {
        const zones = await (prisma as any).disasterZone.findMany({ orderBy: { createdAt: "desc" } });
        return { 
            success: true, 
            zones: zones.map((z: any) => ({
                ...z,
                shapes: typeof z.shapes === 'string' ? JSON.parse(z.shapes) : (z.shapes || [])
            }))
        };
    } catch (error) {
        console.error("Failed to fetch disaster zones:", error);
        return { success: false, error: "Failed to fetch zones." };
    }
}

export async function addDisasterZone(data: any) {
    try {
        const zone = await (prisma as any).disasterZone.create({
            data: { ...data, shapes: data.shapes }
        });
        revalidatePath("/admin/disasters");
        return { success: true, zone };
    } catch (error) {
        return { success: false, error: "Failed to create zone." };
    }
}

export async function updateDisasterZone(id: string, data: any) {
    try {
        const zone = await (prisma as any).disasterZone.update({
            where: { id },
            data
        });
        revalidatePath("/admin/disasters");
        return { success: true, zone };
    } catch (error) {
        return { success: false, error: "Failed to update zone." };
    }
}

export async function deleteDisasterZone(id: string) {
    try {
        await (prisma as any).disasterZone.delete({ where: { id } });
        revalidatePath("/admin/disasters");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete zone." };
    }
}

export async function addDisasterMap(formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);
        const newMap = await (prisma as any).disasterMap.create({
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
        return { success: false, error: "Failed to create map." };
    }
}

export async function updateDisasterMap(id: string, formData: FormData) {
    try {
        const imageUrl = await processImageUpload(formData);
        const updatedMap = await (prisma as any).disasterMap.update({
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
        return { success: false, error: "Failed to update map." };
    }
}

export async function deleteDisasterMap(id: string) {
    try {
        await (prisma as any).disasterMap.delete({ where: { id } });
        revalidatePath("/admin/disasters");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete map." };
    }
}

export async function toggleDisasterMapStatus(id: string, isPublished: boolean) {
    try {
        await (prisma as any).disasterMap.update({ where: { id }, data: { isPublished } });
        revalidatePath("/admin/disasters");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update status." };
    }
}

// -----------------------------------------------------------------------------
// ANNOUNCEMENTS
// -----------------------------------------------------------------------------

export async function addAnnouncement(formData: FormData) {
    try {
        const expiryDate = formData.get("expiryDate") as string;
        const newAnnouncement = await (prisma as any).announcement.create({
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
        return { success: false, error: "Failed to create announcement." };
    }
}

export async function updateAnnouncement(id: string, formData: FormData) {
    try {
        const expiryDate = formData.get("expiryDate") as string;
        const updated = await (prisma as any).announcement.update({
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
        return { success: false, error: "Failed to update announcement." };
    }
}

export async function deleteAnnouncement(id: string) {
    try {
        await (prisma as any).announcement.delete({ where: { id } });
        revalidatePath("/admin/announcements");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete announcement." };
    }
}

export async function toggleAnnouncementStatus(id: string, isActive: boolean) {
    try {
        await (prisma as any).announcement.update({ where: { id }, data: { isActive } });
        revalidatePath("/admin/announcements");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update status." };
    }
}

export async function toggleAnnouncementPin(id: string, isPinned: boolean) {
    try {
        await (prisma as any).announcement.update({ where: { id }, data: { isPinned } });
        revalidatePath("/admin/announcements");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update pin status." };
    }
}
