"use server";

import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getPaymentsLedger(searchQuery: string = "") {
    try {
        const session = await getServerSession(authOptions);
        const role = (session?.user as any)?.role;

        if (role !== "TREASURY_STAFF" && role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const payments = await prisma.payment.findMany({
            where: {
                OR: [
                    { reference: { contains: searchQuery, mode: "insensitive" } },
                    { transactionId: { contains: searchQuery, mode: "insensitive" } },
                    { 
                        transaction: {
                            OR: [
                                { businessName: { contains: searchQuery, mode: "insensitive" } },
                                { 
                                    user: {
                                        name: { contains: searchQuery, mode: "insensitive" }
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            include: {
                transaction: {
                    include: {
                        type: true,
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return { success: true, data: payments };
    } catch (error: any) {
        console.error("Failed to fetch payments ledger:", error);
        return { success: false, error: error.message || "Failed to fetch payments" };
    }
}
