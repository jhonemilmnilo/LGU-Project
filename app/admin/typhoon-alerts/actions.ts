"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function getTyphoonAlerts() {
    return prisma.typhoonAlert.findMany({
        orderBy: { createdAt: "desc" }
    });
}

export async function createTyphoonAlert(data: { name: string; signalNumber: number; description?: string; isActive: boolean }) {
    const alert = await prisma.typhoonAlert.create({
        data
    });
    revalidatePath("/admin/typhoon-alerts");
    return alert;
}

export async function updateTyphoonAlert(id: string, data: { name: string; signalNumber: number; description?: string; isActive: boolean }) {
    const alert = await prisma.typhoonAlert.update({
        where: { id },
        data
    });
    revalidatePath("/admin/typhoon-alerts");
    return alert;
}

export async function deleteTyphoonAlert(id: string) {
    await prisma.typhoonAlert.delete({ where: { id } });
    revalidatePath("/admin/typhoon-alerts");
    return true;
}
