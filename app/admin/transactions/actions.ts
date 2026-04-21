"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateCedula } from "@/lib/cedula";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import { FulfillmentType, PaymentType } from "@prisma/client";

// --- HELPERS ---

async function getSession() {
    return await getServerSession(authOptions);
}

/**
 * Fetches the current logged -in user's resident profile
 */
export async function getCurrentUserResident() {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const resident = await prisma.resident.findFirst({
            where: { userId: session.user.id }
        });

        return { success: true, data: resident };
    } catch (error) {
        console.error("Get current resident error:", error);
        return { success: false, error: "Failed to fetch resident profile" };
    }
}

/**
 * Seed or ensure Cedula Transaction Types exist
 */
export async function ensureCedulaTransactionTypes() {
    try {
        const types = [
            {
                code: "CEDULA_IND",
                name: "Community Tax Certificate - Individual",
                description: "Tax certificate for individuals including employees, self-employed, and property owners.",
                level: 1,
                category: "Treasurer",
                baseFee: 5.00,
                deliveryFee: 50.00,
                isFixed: false,
                requiredDocs: ["Valid Government ID", "Proof of Income (Payslip/BIR 2316)"],
                formSchema: {
                    applicantType: "INDIVIDUAL",
                    fields: ["income", "propertyValue"]
                },
                logicCode: "cedula_calc_v1"
            },
            {
                code: "CEDULA_JUR",
                name: "Community Tax Certificate - Juridical",
                description: "Tax certificate for corporations, partnerships, and other juridical entities.",
                level: 1,
                category: "Treasurer",
                baseFee: 500.00,
                deliveryFee: 50.00,
                isFixed: false,
                requiredDocs: ["Valid ID of Representative", "Business Income Statement"],
                formSchema: {
                    applicantType: "JURIDICAL",
                    fields: ["businessName", "income", "propertyValue"]
                },
                logicCode: "cedula_calc_v1"
            }
        ];

        for (const t of types) {
            await prisma.transactionType.upsert({
                where: { code: t.code },
                update: {},
                create: t
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Ensure transaction types error:", error);
        return { success: false, error: "Failed to initialize service types" };
    }
}

async function processFileUpload(file: File, folder: string = "transactions"): Promise<string | null> {
    if (!file || file.size === 0) return null;

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}_${file.name.replaceAll(" ", "_")}`;
        const uploadsDir = path.join(process.cwd(), "public/uploads", folder);
        const filepath = path.join(uploadsDir, filename);

        if (!fs.existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        await writeFile(filepath, buffer);
        return `/uploads/${folder}/${filename}`;
    } catch (error) {
        console.error("File upload error:", error);
        return null;
    }
}

// --- ACTIONS ---

/**
 * Fetch available transaction types (services)
 */
export async function getTransactionTypes(level?: number) {
    try {
        const where: any = { isActive: true };
        if (level) where.level = level;

        const types = await prisma.transactionType.findMany({
            where,
            orderBy: { name: "asc" }
        });
        return { success: true, data: types };
    } catch (error) {
        console.error("Fetch transaction types error:", error);
        return { success: false, error: "Failed to fetch services" };
    }
}

/**
 * Submit a new transaction request (Citizen side)
 */
export async function submitTransaction(formData: FormData) {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const typeId = formData.get("typeId") as string;
        const fulfillmentType = formData.get("fulfillmentType") as FulfillmentType;
        const paymentType = formData.get("paymentType") as PaymentType;
        const deliveryAddressRaw = formData.get("deliveryAddress") as string;
        const deliveryAddress = (fulfillmentType === "DELIVERY" && deliveryAddressRaw) 
            ? JSON.parse(deliveryAddressRaw) 
            : null;
        const deliveryLandmark = formData.get("deliveryLandmark") as string;
        const deliveryLat = formData.get("deliveryLat") ? parseFloat(formData.get("deliveryLat") as string) : null;
        const deliveryLng = formData.get("deliveryLng") ? parseFloat(formData.get("deliveryLng") as string) : null;

        // Snapshots and Data
        const residentSnapshot = JSON.parse(formData.get("residentSnapshot") as string);
        const additionalData = JSON.parse(formData.get("additionalData") as string);

        // Files
        const idFile = formData.get("idFile") as File;
        const proofFile = formData.get("proofFile") as File;

        const idUrl = await processFileUpload(idFile, "ids");
        const proofUrl = await processFileUpload(proofFile, "proofs");

        // Merge file URLs into additionalData
        const updatedAdditionalData = {
            ...additionalData,
            validIdUrl: idUrl,
            proofOfIncomeUrl: proofUrl
        };

        // --- BEST PRACTICE: ATOMICITY ---
        // We use a prisma.$transaction here to ensure that both the transaction record 
        // and the profile update happen together. If one fails, the entire move rolls back 
        // to keep your database super clean and consistent!
        const [transaction] = await prisma.$transaction([
            // 1. Create the Transaction Record
            prisma.transaction.create({
                data: {
                    userId: session.user.id,
                    typeId,
                    status: "FOR_REQUESTING",
                    fulfillmentType,
                    paymentType,
                    deliveryAddress: fulfillmentType === "DELIVERY" ? deliveryAddress : null,
                    deliveryLat: fulfillmentType === "DELIVERY" ? deliveryLat : null,
                    deliveryLng: fulfillmentType === "DELIVERY" ? deliveryLng : null,
                    deliveryLandmark: fulfillmentType === "DELIVERY" ? deliveryLandmark : null,
                    residentSnapshot,
                    additionalData: updatedAdditionalData,
                    totalAmount: 0,
                } as any
            }),
            // 2. Update the Permanent Resident Profile
            prisma.resident.update({
                where: { userId: session.user.id },
                data: {
                    firstName: residentSnapshot.firstName,
                    middleName: residentSnapshot.middleName,
                    lastName: residentSnapshot.lastName,
                    suffix: residentSnapshot.suffix,
                    dateOfBirth: residentSnapshot.dateOfBirth ? new Date(residentSnapshot.dateOfBirth) : undefined,
                    civilStatus: residentSnapshot.civilStatus,
                    citizenship: residentSnapshot.citizenship,
                    houseNumber: residentSnapshot.houseNumber,
                    street: residentSnapshot.street,
                    barangay: residentSnapshot.barangay,
                    municipality: residentSnapshot.municipality,
                    province: residentSnapshot.province,
                    contactNumber: residentSnapshot.contactNumber,
                    email: residentSnapshot.email,
                }
            })
        ]);

        revalidatePath("/user/services");
        revalidatePath("/admin/transactions"); // Also update admin view
        return { success: true, data: transaction };
    } catch (error) {
        console.error("Submit transaction error:", error);
        return { success: false, error: "Failed to submit request" };
    }
}

/**
 * Evaluate a Cedula Transaction (Treasury Staff side)
 */
export async function evaluateCedulaTransaction(id: string, adminNotes?: string) {
    try {
        const session = await getSession();
        // Check for TREASURY_STAFF or ADMIN role
        const user = session?.user as any;
        if (!user || (user.role !== "TREASURY_STAFF" && user.role !== "ADMIN")) {
            return { success: false, error: "Forbidden" };
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: { type: true }
        });

        if (!transaction) return { success: false, error: "Transaction not found" };
        if (transaction.type.code.indexOf("CEDULA") === -1) {
            return { success: false, error: "Not a Cedula transaction" };
        }

        const additionalData = transaction.additionalData as any;

        // Compute the tax
        const result = calculateCedula({
            type: additionalData.applicantType || "INDIVIDUAL",
            income: additionalData.income || 0,
            propertyValue: additionalData.propertyValue || 0,
            fulfillmentType: transaction.fulfillmentType,
            deliveryFee: transaction.type.deliveryFee
        });

        const updatedTransaction = await prisma.transaction.update({
            where: { id },
            data: {
                status: "EVALUATED",
                totalAmount: result.totalAmount,
                processedBy: user.id,
                rejectionRemarks: adminNotes
            }
        });

        revalidatePath("/admin/treasury");
        return { success: true, data: updatedTransaction, calculation: result };
    } catch (error) {
        console.error("Evaluate transaction error:", error);
        return { success: false, error: "Failed to evaluate transaction" };
    }
}

/**
 * Confirm Payment (Treasury Staff side)
 */
export async function confirmTransactionPayment(id: string, referenceNo?: string) {
    try {
        const session = await getSession();
        const user = session?.user as any;
        if (!user || user.role !== "TREASURY_STAFF" && user.role !== "ADMIN") {
            return { success: false, error: "Forbidden" };
        }

        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                status: "PAID",
                paymentReference: referenceNo,
                updatedAt: new Date()
            }
        });

        revalidatePath("/admin/treasury");
        return { success: true, data: transaction };
    } catch (error) {
        console.error("Confirm payment error:", error);
        return { success: false, error: "Failed to confirm payment" };
    }
}

/**
 * Release Cedula (Treasury Staff side)
 */
export async function releaseCedula(id: string, ctcNumber: string) {
    try {
        const session = await getSession();
        const user = session?.user as any;
        if (!user || user.role !== "TREASURY_STAFF" && user.role !== "ADMIN") {
            return { success: false, error: "Forbidden" };
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: { type: true }
        });

        if (!transaction || transaction.status !== "PAID") {
            return { success: false, error: "Transaction must be paid before release" };
        }

        const additionalData = transaction.additionalData as any;
        const calc = calculateCedula({
            type: additionalData.applicantType || "INDIVIDUAL",
            income: additionalData.income || 0,
            propertyValue: additionalData.propertyValue || 0,
            fulfillmentType: transaction.fulfillmentType,
            deliveryFee: transaction.type.deliveryFee
        });

        // Create the Cedula record
        const now = new Date();
        const cedula = await prisma.cedula.create({
            data: {
                transactionId: id,
                ctcNumber,
                taxYear: now.getFullYear(),
                dateIssued: now,
                expiryDate: new Date(now.getFullYear(), 11, 31), // Dec 31 of current year
                basicTax: calc.basicTax,
                additionalTax: calc.additionalTax,
                penalty: calc.penalty,
                totalPaid: transaction.totalAmount,
                issuedBy: user.name || "System Administrator",
                verificationId: `VER-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
            }
        });

        // Update transaction status
        await prisma.transaction.update({
            where: { id },
            data: { status: "RELEASED" }
        });

        revalidatePath("/admin/treasury");
        revalidatePath("/user/services");
        return { success: true, data: cedula };
    } catch (error) {
        console.error("Release cedula error:", error);
        return { success: false, error: "Failed to release document" };
    }
}
/**
 * Fetch all transactions relevant to Treasury (category: 'Treasurer')
 */
export async function getTreasuryTransactions(status?: string) {
    try {
        const session = await getSession();
        const user = session?.user as any;
        if (!user || (user.role !== "TREASURY_STAFF" && user.role !== "ADMIN")) {
            return { success: false, error: "Forbidden" };
        }

        const where: any = {
            type: { category: "Treasurer" }
        };

        if (status && status !== "ALL") {
            where.status = status;
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                user: true,
                type: true,
                cedula: true
            },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, data: transactions };
    } catch (error) {
        console.error("Fetch treasury transactions error:", error);
        return { success: false, error: "Failed to fetch transactions" };
    }
}

/**
 * Get count of transactions needing immediate treasury attention
 */
export async function getPendingTreasuryCount() {
    try {
        const count = await prisma.transaction.count({
            where: {
                type: { category: "Treasurer" },
                status: { in: ["FOR_REQUESTING", "PAID"] } // Needs evaluation or Needs release
            }
        });
        return { success: true, count };
    } catch (error) {
        console.error("Fetch pending count error:", error);
        return { success: false, count: 0 };
    }
}

/**
 * Reject a transaction (Treasury/Admin side)
 */
export async function rejectTransaction(id: string, remarks: string) {
    try {
        const session = await getSession();
        const user = session?.user as any;
        if (!user || (user.role !== "TREASURY_STAFF" && user.role !== "ADMIN")) {
            return { success: false, error: "Forbidden" };
        }

        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                status: "REJECTED",
                rejectionRemarks: remarks,
                processedBy: user.id
            }
        });

        revalidatePath("/admin/treasury");
        revalidatePath("/user/services");
        return { success: true, data: transaction };
    } catch (error) {
        console.error("Reject transaction error:", error);
        return { success: false, error: "Failed to reject transaction" };
    }
}

/**
 * Fetch all transactions for the currently logged-in resident
 */
export async function getUserTransactions() {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const transactions = await prisma.transaction.findMany({
            where: { userId: session.user.id },
            include: {
                type: true,
                cedula: true
            },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, data: transactions };
    } catch (error) {
        console.error("Fetch user transactions error:", error);
        return { success: false, error: "Failed to fetch your requests" };
    }
}
