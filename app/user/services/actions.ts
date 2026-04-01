"use server";

import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUserResidentProfile() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        include: {
            residentProfile: true
        }
    });

    return user?.residentProfile || null;
}

export async function getAvailableServices(barangay: string) {
    return await (prisma as any).brgyService.findMany({
        where: {
            barangay,
            isPublished: true
        },
        orderBy: { name: 'asc' }
    });
}

export async function getUserRequests() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];

    return await (prisma as any).brgyServiceRequest.findMany({
        where: {
            userId: (session.user as any).id
        },
        include: {
            service: true
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function submitServiceRequest(serviceId: string, method: "PICKUP" | "DELIVER", submissions: any) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const profile = await getUserResidentProfile();
    if (!profile) return { success: false, error: "No resident profile found" };

    try {
        await (prisma as any).brgyServiceRequest.create({
            data: {
                serviceId,
                userId: (session.user as any).id,
                barangay: profile.barangay,
                method,
                status: "PENDING",
                submissions
            }
        });

        revalidatePath("/user/services");
        return { success: true };
    } catch (error) {
        console.error("Failed to submit request:", error);
        return { success: false, error: "Database error" };
    }
}

export async function cancelServiceRequest(requestId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        const request = await (prisma as any).brgyServiceRequest.findUnique({
            where: { id: requestId }
        });

        if (!request || request.userId !== (session.user as any).id) {
            return { success: false, error: "Request not found" };
        }

        if (request.status !== "PENDING") {
            return { success: false, error: "Only pending requests can be cancelled" };
        }

        await (prisma as any).brgyServiceRequest.update({
            where: { id: requestId },
            data: { status: "CANCELLED" }
        });

        revalidatePath("/user/services/requests");
        return { success: true };
    } catch (error) {
        console.error("Failed to cancel request:", error);
        return { success: false, error: "Server error" };
    }
}
