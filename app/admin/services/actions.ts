"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getBrgyServices(barangayName?: string) {
    return await (prisma as any).brgyService.findMany({
        where: {
            barangay: barangayName || undefined,
        },
        orderBy: { createdAt: 'desc' }
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function upsertBrgyService(id: string | null, data: any) {
    const session = await getServerSession(authOptions);
    const managedBarangay = (session?.user as any)?.managedBarangay;
    const role = (session?.user as any)?.role;

    const brgy = (role === "BARANGAY_ADMIN") ? managedBarangay : (data.barangay || "Mapandan");

    const payload = {
        name: data.name,
        description: data.description,
        requirements: data.requirements,
        isPublished: data.isPublished,
        barangay: brgy
    };

    if (id) {
        await (prisma as any).brgyService.update({
            where: { id },
            data: payload
        });
    } else {
        await (prisma as any).brgyService.create({
            data: payload
        });
    }
    revalidatePath("/admin/services");
    return { success: true };
}

export async function deleteBrgyService(id: string) {
    await (prisma as any).brgyService.delete({ where: { id } });
    revalidatePath("/admin/services");
    return { success: true };
}

export async function getBrgyRequests(barangayName?: string) {
    return await (prisma as any).brgyServiceRequest.findMany({
        where: {
            barangay: barangayName || undefined
        },
        include: {
            service: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    residentProfile: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateRequestStatus(id: string, status: string, paymentDetail?: any, adminNotes?: string) {
    await (prisma as any).brgyServiceRequest.update({
        where: { id },
        data: {
            status: status as any,
            paymentDetail: paymentDetail || undefined,
            adminNotes: adminNotes || undefined
        }
    });
    revalidatePath("/admin/services");
    return { success: true };
}
