"use server";

import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { calculateCedula } from "@/lib/cedula";

import { sendEmail } from "@/lib/mail";
import { uploadFile } from "@/lib/storage";

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
            where: { userId: session.user.id },
            include: { user: true }
        });

        return { success: true, data: resident };
    } catch (error) {
        console.error("Get current resident error:", error);
        return { success: false, error: "Failed to fetch resident profile" };
    }
}

/**
 * Fetches all active barangays from BarangayInfo
 */
export async function getBarangaysList() {
    try {
        const barangays = await prisma.barangayInfo.findMany({
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: "asc"
            }
        });
        return { success: true, data: barangays.map(b => b.name) };
    } catch (error) {
        console.error("Get barangays list error:", error);
        return { success: false, error: "Failed to fetch barangays list" };
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
                requiresBusinessName: false,
                supportsECopy: true,
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
                requiresBusinessName: true,
                supportsECopy: true,
                logicCode: "cedula_calc_v1"
            }
        ];

        for (const t of types) {
            await prisma.transactionType.upsert({
                where: { code: t.code },
                update: {
                    requiresBusinessName: t.requiresBusinessName,
                    supportsECopy: t.supportsECopy,
                    deliveryFee: t.deliveryFee,
                    baseFee: t.baseFee
                },
                create: t
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Ensure transaction types error:", error);
        return { success: false, error: "Failed to initialize service types" };
    }
}

export async function ensureBusinessPermitTransactionTypes() {
    try {
        const types = [
            {
                code: "BUSINESS_PERMIT_NEW",
                name: "Business Permit - New",
                description: "Apply for a new business permit for starting a business in Mapandan, Pangasinan.",
                level: 1,
                category: "BPLO",
                baseFee: 500.00,
                deliveryFee: 100.00,
                isFixed: false,
                requiredDocs: [
                    "Unified Form Community Tax Certificate (CTC)",
                    "DTI/SEC/CDA Registration",
                    "Barangay Clearance",
                    "Valid ID of Business Owner",
                    "Photo of Business Location",
                    "Sanitary Permit",
                    "Fire Safety Inspection Certificate"
                ],
                formSchema: {
                    businessType: "NEW",
                    fields: ["businessName", "tradeName", "orgType", "dtiSecNumber", "lineOfBusiness", "capitalInvestment", "employeeCount", "businessArea"]
                },
                requiresBusinessName: true,
                supportsECopy: true,
                logicCode: "business_permit_calc_v1"
            },
            {
                code: "BUSINESS_PERMIT_RENEW",
                name: "Business Permit - Renewal",
                description: "Renew your existing business permit. Calculated based on previous annual gross sales.",
                level: 1,
                category: "BPLO",
                baseFee: 500.00,
                deliveryFee: 100.00,
                isFixed: false,
                requiredDocs: [
                    "Unified Form Community Tax Certificate (CTC)",
                    "DTI/SEC/CDA Registration",
                    "Barangay Clearance",
                    "Valid ID of Business Owner",
                    "Photo of Business Location",
                    "Sanitary Permit",
                    "Fire Safety Inspection Certificate"
                ],
                formSchema: {
                    businessType: "RENEWAL",
                    fields: ["businessName", "tradeName", "orgType", "permitNumber", "lineOfBusiness", "grossSales", "employeeCount", "businessArea"]
                },
                requiresBusinessName: true,
                supportsECopy: true,
                logicCode: "business_permit_calc_v1"
            }
        ];

        for (const t of types) {
            await prisma.transactionType.upsert({
                where: { code: t.code },
                update: {
                    requiresBusinessName: t.requiresBusinessName,
                    supportsECopy: t.supportsECopy,
                    deliveryFee: t.deliveryFee,
                    baseFee: t.baseFee,
                    requiredDocs: t.requiredDocs,
                    formSchema: t.formSchema
                },
                create: t
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Ensure business permit types error:", error);
        return { success: false, error: "Failed to initialize BPLO service types" };
    }
}

export async function submitBusinessPermitTransaction(formData: FormData) {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const typeId = formData.get("typeId") as string;
        const residentSnapshot = JSON.parse(formData.get("residentSnapshot") as string);
        const additionalData = JSON.parse(formData.get("additionalData") as string);

        // Strike penalty check
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { rejectionCount: true }
        });
        if (user && user.rejectionCount >= 3) {
            return { success: false, error: "Submission blocked: Account suspended due to 3 rejection strikes. Please apply onsite at the Municipal Hall." };
        }

        // Process BPLO Checklist file uploads
        const ctcFile = formData.get("ctcFile") as File;
        const dtiSecFile = formData.get("dtiSecFile") as File;
        const brgyClearanceFile = formData.get("brgyClearanceFile") as File;
        const ownerIdFile = formData.get("ownerIdFile") as File;
        const locationPhotoFile = formData.get("locationPhotoFile") as File;
        const sanitaryPermitFile = formData.get("sanitaryPermitFile") as File;
        const fireSafetyFile = formData.get("fireSafetyFile") as File;
        const birCorFile = formData.get("birCorFile") as File | null;

        const ctcUrl = await processFileUpload(ctcFile, "bp_ctc");
        const dtiSecUrl = await processFileUpload(dtiSecFile, "bp_dti");
        const brgyClearanceUrl = await processFileUpload(brgyClearanceFile, "bp_brgy");
        const ownerIdUrl = await processFileUpload(ownerIdFile, "bp_owner_id");
        const locationPhotoUrl = await processFileUpload(locationPhotoFile, "bp_location");
        const sanitaryPermitUrl = await processFileUpload(sanitaryPermitFile, "bp_sanitary");
        const fireSafetyUrl = await processFileUpload(fireSafetyFile, "bp_fire");
        const birCorUrl = birCorFile ? await processFileUpload(birCorFile, "bp_bir") : null;

        // Merge all BPLO file URLs into additionalData
        const updatedAdditionalData = {
            ...additionalData,
            ctcUrl,
            dtiSecUrl,
            brgyClearanceUrl,
            ownerIdUrl,
            locationPhotoUrl,
            sanitaryPermitUrl,
            fireSafetyUrl,
            birCorUrl
        };

        const [transaction] = await prisma.$transaction([
            // 1. Create BPLO Transaction
            prisma.transaction.create({
                data: {
                    userId: session.user.id,
                    typeId,
                    status: "FOR_REQUESTING",
                    fulfillmentType: additionalData.fulfillmentType || null,
                    paymentType: null,
                    residentSnapshot,
                    additionalData: updatedAdditionalData,
                    totalAmount: 0,
                    businessName: additionalData.businessName || null,
                } as any
            }),
            // 2. Update permanent resident snapshot profile
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
        revalidatePath("/admin/transactions");
        return { success: true, data: transaction };
    } catch (error) {
        console.error("Submit business permit error:", error);
        return { success: false, error: "Failed to submit permit request" };
    }
}

export async function uploadECopyAction(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) return { success: false, error: "No file provided" };

        const url = await processFileUpload(file, "ecopies");
        if (!url) return { success: false, error: "Upload failed" };

        return { success: true, data: url };
    } catch (error) {
        console.error("Upload E-Copy error:", error);
        return { success: false, error: "Failed to upload file" };
    }
}

async function processFileUpload(file: File, folder: string = "transactions"): Promise<string | null> {
    if (!file || file.size === 0) return null;

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}_${file.name.replaceAll(" ", "_")}`;
        const storagePath = `services/${folder}/${filename}`;
        
        const publicUrl = await uploadFile(buffer, storagePath, undefined, file.type);
        return publicUrl;
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
 * Fetch a single transaction by ID (Resident/Admin)
 */
export async function getTransactionById(id: string) {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                type: true,
                cedula: true,
                businessPermit: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        residentProfile: true
                    }
                }
            }
        });
        if (!transaction) return { success: false, error: "Transaction not found" };
        return { success: true, data: transaction as any };
    } catch (error) {
        console.error("Fetch transaction by id error:", error);
        return { success: false, error: "Failed to fetch transaction details" };
    }
}

/**
 * Fetch delivery fee configuration for a specific barangay
 */
export async function getDeliveryFeeByBarangay(name: string) {
    try {
        const brgy = await prisma.barangayInfo.findUnique({
            where: { name }
        });
        return {
            success: true,
            data: {
                fee: (brgy as any)?.deliveryFee || 0,
                isActive: (brgy as any)?.isLogisticsActive ?? true
            }
        };
    } catch (error) {
        console.error("Error fetching barangay logistics:", error);
        return { success: false, error: "Failed to fetch logistics data" };
    }
}

/**
 * Fetch active barangays and their delivery fees for public/citizen use
 */
export async function getPublicBarangayLogistics() {
    try {
        const barangays = await prisma.barangayInfo.findMany({
            where: { isLogisticsActive: true } as any,
            select: {
                name: true,
                deliveryFee: true,
                estimatedDeliveryDays: true
            } as any,
            orderBy: { name: 'asc' }
        });
        return { success: true, data: barangays };
    } catch (error) {
        console.error("Error fetching public logistics:", error);
        return { success: false, error: "Failed to fetch logistics data" };
    }
}

/**
 * Fetch all barangays and their logistics configuration
 */
export async function getAllBarangayLogistics() {
    try {
        const session = await getSession();
        const user = session?.user as any;
        if (!user || user.role !== "ADMIN") {
            // Optional: You can allow TREASURY_STAFF to view but not edit, 
            // but for now, let's stick to ADMIN.
            return { success: false, error: "Forbidden" };
        }

        const barangays = await prisma.barangayInfo.findMany({
            orderBy: { name: 'asc' }
        });
        return { success: true, data: barangays };
    } catch (error) {
        console.error("Error fetching all logistics:", error);
        return { success: false, error: "Failed to fetch logistics data" };
    }
}

/**
 * Update logistics configuration for a barangay
 */
export async function updateBarangayLogistics(id: string, data: { deliveryFee: number, isLogisticsActive: boolean, estimatedDeliveryDays: number }) {
    try {
        const session = await getSession();
        const user = session?.user as any;
        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "Forbidden" };
        }

        const updated = await prisma.barangayInfo.update({
            where: { id },
            data: {
                deliveryFee: data.deliveryFee,
                isLogisticsActive: data.isLogisticsActive,
                estimatedDeliveryDays: data.estimatedDeliveryDays
            } as any
        });

        revalidatePath("/admin/logistics");
        return { success: true, data: updated };
    } catch (error) {
        console.error("Error updating logistics:", error);
        return { success: false, error: "Failed to update configuration" };
    }
}

/**
 * Fetch a system setting by key
 */
export async function getSystemSettingAction(key: string, defaultValue: string = "") {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key }
        });
        return { success: true, data: setting?.value || defaultValue };
    } catch (error) {
        console.error(`Error fetching system setting ${key}:`, error);
        return { success: false, error: "Failed to fetch setting", data: defaultValue };
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

        // Snapshots and Data
        const residentSnapshot = JSON.parse(formData.get("residentSnapshot") as string);
        const additionalData = JSON.parse(formData.get("additionalData") as string);

        // Files
        const idFile = formData.get("idFile") as File;
        const proofFile = formData.get("proofFile") as File;
        const existingIdUrl = formData.get("existingIdUrl") as string;

        let idUrl = await processFileUpload(idFile, "ids");
        if (!idUrl && existingIdUrl) idUrl = existingIdUrl;

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
                    fulfillmentType: null,
                    paymentType: null,
                    residentSnapshot,
                    additionalData: updatedAdditionalData,
                    totalAmount: 0,
                    businessName: additionalData.businessName || null,
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
export async function evaluateCedulaTransaction(id: string, deliveryFeeOverride?: number, adminNotes?: string) {
    try {
        const session = await getSession();
        // Check for TREASURY_STAFF or ADMIN role
        const user = session?.user as any;
        if (!user || (user.role !== "TREASURY_STAFF" && user.role !== "ADMIN")) {
            return { success: false, error: "Forbidden" };
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: { type: true, user: true }
        });

        if (!transaction) return { success: false, error: "Transaction not found" };
        if (transaction.type.code.indexOf("CEDULA") === -1) {
            return { success: false, error: "Not a Cedula transaction" };
        }

        const additionalData = transaction.additionalData as any;

        // Dynamic Delivery Fee Lookup from BarangayInfo
        let dynamicDeliveryFee = transaction.type.deliveryFee; // Initial fallback

        if (transaction.fulfillmentType === "DELIVERY" && (transaction.deliveryAddress || (transaction as any).residentSnapshot)) {
            const addr = (typeof transaction.deliveryAddress === 'string'
                ? JSON.parse(transaction.deliveryAddress || '{}')
                : transaction.deliveryAddress) || (transaction as any).residentSnapshot;

            if (addr?.barangay) {
                const brgyLogistics = await prisma.barangayInfo.findUnique({
                    where: { name: addr.barangay }
                }) as any;

                // Priority Logic: Use Barangay Fee if it exists and is greater than 0, 
                // otherwise keep the service type default fee.
                if (brgyLogistics && (brgyLogistics as any).isLogisticsActive && (brgyLogistics as any).deliveryFee > 0) {
                    dynamicDeliveryFee = (brgyLogistics as any).deliveryFee;
                }
            }
        }

        // Compute the tax
        const result = calculateCedula({
            type: additionalData.applicantType || "INDIVIDUAL",
            income: additionalData.income || 0,
            propertyValue: additionalData.propertyValue || 0,
            fulfillmentType: transaction.fulfillmentType,
            deliveryFee: deliveryFeeOverride !== undefined ? deliveryFeeOverride : dynamicDeliveryFee
        });

        // Determine New Status
        // Now strictly EVALUATED as the resident will choose fulfillment later
        const newStatus = "EVALUATED" as any;

        const updatedTransaction = await prisma.transaction.update({
            where: { id },
            data: {
                status: newStatus,
                totalAmount: result.totalAmount, // This is the Base Tax + Penalty
                processedBy: user.id,
                rejectionRemarks: adminNotes,
                fiscalSnapshot: {
                    basicTax: result.basicTax,
                    additionalTax: result.additionalTax,
                    penaltyCharge: result.penalty,
                    deliveryFee: result.deliveryFee, // Persist delivery fee here
                    totalAmount: result.totalAmount
                }
            } as any,
            include: { user: true }
        }) as any;

        // Trigger email notification for payment
        if (updatedTransaction.user?.email) {
            const resident = updatedTransaction.residentSnapshot as any;
            await sendEmail({
                type: "FOR_PAYMENT",
                to: updatedTransaction.user.email,
                name: `${resident.firstName} ${resident.lastName}`,
                transactionId: id.slice(-8).toUpperCase(),
                amount: result.totalAmount
            });
        }

        revalidatePath("/admin/treasury");
        revalidatePath("/user/services/requests");
        return { success: true, data: updatedTransaction, calculation: result };
    } catch (error) {
        console.error("Evaluate transaction error:", error);
        return { success: false, error: "Failed to evaluate transaction" };
    }
}

/**
 * Finalize Transaction Fulfillment (Resident side)
 * Called when status is EVALUATED
 */
export async function finalizeTransactionFulfillment(formData: FormData) {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const transactionId = formData.get("transactionId") as string;
        const fulfillmentType = formData.get("fulfillmentType") as "PICK_UP" | "DELIVERY" | "E_COPY";
        const paymentType = formData.get("paymentType") as string;

        // Delivery Details
        const deliveryAddress = formData.get("deliveryAddress") ? JSON.parse(formData.get("deliveryAddress") as string) : null;
        const deliveryLat = formData.get("deliveryLat") ? Number(formData.get("deliveryLat")) : null;
        const deliveryLng = formData.get("deliveryLng") ? Number(formData.get("deliveryLng")) : null;
        const deliveryLandmark = formData.get("deliveryLandmark") as string;

        // Payment Proof File
        const paymentFile = formData.get("paymentFile") as File;
        const paymentProofUrl = await processFileUpload(paymentFile, "proofs");

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { type: true, user: true }
        });

        if (!transaction || transaction.userId !== session.user.id) {
            return { success: false, error: "Transaction not found" };
        }

        if (transaction.status !== "EVALUATED") {
            return { success: false, error: "Transaction is not in evaluation phase" };
        }

        // Recalculate total amount if delivery is selected
        let finalAmount = Number(transaction.totalAmount);
        if (fulfillmentType === "DELIVERY") {
            let actualDeliveryFee = transaction.type.deliveryFee || 0;
            const barangayName = deliveryAddress?.barangay;

            if (barangayName) {
                const brgy = await prisma.barangayInfo.findUnique({
                    where: { name: barangayName }
                }) as any;

                // Priority Logic: Use Barangay Fee if it exists and is > 0, else use type default
                if (brgy && brgy.deliveryFee > 0) {
                    actualDeliveryFee = brgy.deliveryFee;
                }
            }

            finalAmount += actualDeliveryFee;
        }

        // Determine next status: 
        // - All PICK_UP go to FOR_PROCESSING
        // - DELIVERY with CASH_ON_DELIVERY also goes to FOR_PROCESSING
        const isForProcessing = fulfillmentType === "PICK_UP" || (fulfillmentType === "DELIVERY" && paymentType === "CASH_ON_DELIVERY");
        const newStatus = isForProcessing ? "FOR_PROCESSING" : "PAID";

        const updatedTransaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                fulfillmentType,
                paymentType: paymentType as any,
                deliveryAddress: fulfillmentType === "DELIVERY" ? deliveryAddress : null,
                deliveryLat: fulfillmentType === "DELIVERY" ? deliveryLat : null,
                deliveryLng: fulfillmentType === "DELIVERY" ? deliveryLng : null,
                deliveryLandmark: fulfillmentType === "DELIVERY" ? deliveryLandmark : null,
                paymentReference: paymentProofUrl || transaction.paymentReference, // Store the image URL here
                totalAmount: finalAmount,
                status: newStatus as any,
                fiscalSnapshot: {
                    ...(transaction.fiscalSnapshot as any || {}),
                    deliveryFee: (fulfillmentType === "DELIVERY" ? (finalAmount - Number(transaction.totalAmount)) : 0),
                    totalAmount: finalAmount
                },
                updatedAt: new Date()
            } as any
        });

        revalidatePath("/user/services/requests");
        revalidatePath("/admin/treasury");
        return { success: true, data: updatedTransaction };
    } catch (error) {
        console.error("Finalize fulfillment error:", error);
        return { success: false, error: "Failed to finalize selection" };
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

        const transactionData: any = {
            status: "PAID",
            updatedAt: new Date()
        };

        // Only update paymentReference if a new one is provided.
        // Otherwise, keep the existing proof-of-payment URL.
        if (referenceNo) {
            transactionData.paymentReference = referenceNo;
        }

        const transaction = await prisma.transaction.update({
            where: { id },
            data: transactionData
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
export async function releaseCedula(id: string, ctcNumber: string, eCopyUrl?: string) {
    try {
        const session = await getSession();
        const user = session?.user as any;
        if (!user || user.role !== "TREASURY_STAFF" && user.role !== "ADMIN") {
            return { success: false, error: "Forbidden" };
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: { type: true, user: true, cedula: true }
        });

        if (!transaction || !["PAID", "FOR_CLAIM", "FOR_PROCESSING"].includes(transaction.status as any)) {
            return { success: false, error: "Transaction must be paid, processing, or ready for claiming before release" };
        }

        const additionalData = transaction.additionalData as any;
        const calc = calculateCedula({
            type: additionalData.applicantType || "INDIVIDUAL",
            income: additionalData.income || 0,
            propertyValue: additionalData.propertyValue || 0,
            fulfillmentType: transaction.fulfillmentType,
            deliveryFee: transaction.type.deliveryFee
        });

        // Determine target status and email type
        // Determine target status: FOR_PICKING for Delivery, FOR_CLAIM for Pickup prepare, else RELEASED
        const isInitialRelease = transaction.status === "FOR_PROCESSING" || transaction.status === "PAID";
        const targetStatus = isInitialRelease
            ? (transaction.fulfillmentType === "DELIVERY" ? "FOR_PICKING" : "FOR_CLAIM")
            : "RELEASED";

        // NOTIFY RIDERS: If status is FOR_PICKING, alert all riders via email
        if (targetStatus === "FOR_PICKING") {
            try {
                const riders = await prisma.user.findMany({
                    where: { role: "RIDER" } as any,
                    select: { email: true, name: true }
                });
                
                // Batch notify all active riders
                await Promise.all(riders.map(async (rider) => {
                    if (rider.email) {
                        return sendEmail({
                            type: "NEW_PICKUP_ALERT" as any,
                            to: rider.email,
                            name: rider.name || "Rider",
                            transactionId: transaction.id
                        });
                    }
                }));
                console.log(`Logistics alert sent to ${riders.length} riders for transaction ${transaction.id}`);
            } catch (notifyError) {
                console.error("Failed to notify riders:", notifyError);
                // We don't fail the whole release if email fails, but we log it
            }
        }

        // Check if CTC Number is already used by another transaction
        if (ctcNumber) {
            const existingCedula = await prisma.cedula.findUnique({
                where: { ctcNumber }
            });
            if (existingCedula && existingCedula.transactionId !== id) {
                return { success: false, error: `CTC Number ${ctcNumber} is already used by another request.` };
            }
        }

        // Handle Cedula record lifecycle
        if (!transaction.cedula) {
            const now = new Date();
            // Requirement check: Only allow skipping ctcNumber if it's initial Cash Pickup prepare (FOR_PROCESSING)
            const isPickupCashInitial = transaction.fulfillmentType === "PICK_UP" && transaction.paymentType === "CASH" && transaction.status === "FOR_PROCESSING";
            
            if (!ctcNumber && !isPickupCashInitial) {
                return { success: false, error: "CTC Number is required for this transaction type." };
            }

            await prisma.cedula.create({
                data: {
                    transactionId: id,
                    ctcNumber: ctcNumber || null,
                    taxYear: now.getFullYear(),
                    dateIssued: now,
                    expiryDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59), // End of Dec 31
                    basicTax: calc.basicTax,
                    additionalTax: calc.additionalTax,
                    penalty: calc.penalty,
                    totalPaid: transaction.totalAmount,
                    issuedBy: user.name || "System Administrator",
                    businessName: (transaction as any).businessName,
                    documentUrl: eCopyUrl || (transaction as any).eCopyUrl,
                    verificationId: `VER-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
                }
            });
        } else if (ctcNumber || eCopyUrl) {
            // Update existing cedula if new data is provided during final release (e.g. from FOR_CLAIM to RELEASED)
            await prisma.cedula.update({
                where: { id: transaction.cedula.id },
                data: { 
                    ...(ctcNumber ? { ctcNumber } : {}),
                    ...(eCopyUrl ? { documentUrl: eCopyUrl } : {})
                }
            });
        }

        // Update transaction status and eCopyUrl if provided
        await prisma.transaction.update({
            where: { id },
            data: {
                status: targetStatus as any,
                ...(eCopyUrl ? { eCopyUrl } : {})
            }
        });

        // Trigger email notification for the NEW status
        if (transaction.user?.email) {
            const resident = transaction.residentSnapshot as any;
            await sendEmail({
                type: targetStatus as any, // This will be "FOR_CLAIM" if from processing, or "RELEASED" otherwise
                to: transaction.user.email,
                name: `${resident.firstName} ${resident.lastName}`,
                transactionId: id.slice(-8).toUpperCase(),
                amount: transaction.totalAmount // Include amount so they know what to bring if for claim
            });
        }

        revalidatePath("/admin/treasury");
        revalidatePath("/user/services");
        return { success: true, data: { status: targetStatus } };
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
            if (status === "CANCELLED") {
                where.isCancelled = true;
            } else if (status === "PAID") {
                where.status = "PAID" as any;
                where.isCancelled = false;
            } else {
                where.status = status;
                where.isCancelled = false;
            }
        } else {
            // Default: Hide cancelled unless explicitly requested?
            // Actually, for "ALL" we might want to see them.
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

        return { success: true, data: transactions as any[] };
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
                status: { in: ["FOR_REQUESTING", "PAID", "FOR_CLAIM", "FOR_PROCESSING"] as any } // Needs evaluation or Needs release/claim/processing
            }
        });
        return { success: true, count };
    } catch (error) {
        console.error("Fetch pending count error:", error);
        return { success: false, count: 0 };
    }
}

/**
 * Fetch counts per status for Treasury transactions (for tab badges)
 */
export async function getTreasuryStatusCounts() {
    try {
        const session = await getSession();
        const user = session?.user as any;
        if (!user || (user.role !== "TREASURY_STAFF" && user.role !== "ADMIN")) {
            return { success: false, error: "Forbidden", data: {} };
        }

        // Group by status for non-cancelled transactions
        const grouped = await prisma.transaction.groupBy({
            by: ["status"],
            where: {
                type: { category: "Treasurer" },
                isCancelled: false
            },
            _count: { _all: true }
        });

        // Count cancelled separately
        const cancelledCount = await prisma.transaction.count({
            where: {
                type: { category: "Treasurer" },
                isCancelled: true
            }
        });

        const counts: Record<string, number> = {};
        for (const group of grouped) {
            counts[group.status] = group._count._all;
        }
        counts["CANCELLED"] = cancelledCount;

        return { success: true, data: counts };
    } catch (error) {
        console.error("Fetch treasury status counts error:", error);
        return { success: false, error: "Failed to fetch counts", data: {} };
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

        // 1. Fetch transaction with user details to check rejection history
        const tx = await prisma.transaction.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!tx) return { success: false, error: "Transaction inaccessible" };

        // 2. Update transaction status to REJECTED
        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                status: "REJECTED",
                rejectionRemarks: remarks,
                processedBy: user.id
            }
        });

        // 3. Anti-Spam Protocol: Increment rejectionCount for citizen accounts
        if (tx.userId && tx.user?.role === "USER") {
            const updatedUser = await prisma.user.update({
                where: { id: tx.userId },
                data: { rejectionCount: { increment: 1 } } as any
            }) as any;

            // Check if deactivation threshold reached
            if (updatedUser.rejectionCount >= 3) {
                // LOCK ACCOUNT: Set isEmailVerified to false
                await prisma.user.update({
                    where: { id: tx.userId },
                    data: { isEmailVerified: false }
                });

                // Trigger URGENT Deactivation Email
                if (updatedUser.email) {
                    await sendEmail({
                        type: "DEACTIVATED",
                        to: updatedUser.email,
                        name: updatedUser.name || "Resident",
                    });
                }
            } else {
                // Trigger standard Rejection Email
                if (updatedUser.email) {
                    const resident = tx.residentSnapshot as any;
                    await sendEmail({
                        type: "REJECTED",
                        to: updatedUser.email,
                        name: resident?.firstName || updatedUser.name || "Resident",
                        remarks: remarks
                    });
                }
            }
        }

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
                cedula: true,
                businessPermit: true
            },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, data: transactions as any[] };
    } catch (error) {
        console.error("Fetch user transactions error:", error);
        return { success: false, error: "Failed to fetch your requests" };
    }
}

/**
 * Logistics: Scan to Dispatch (Rider Side)
 */
export async function handoverTransaction(transactionId: string) {
    try {
        const session = await getSession();
        const user = session?.user as any;

        // Security: Only Riders can scan to pick up
        if (!user || user.role !== "RIDER") {
            return { success: false, error: "Unauthorized. Logistics Personnel only." };
        }

        const transaction = await (prisma.transaction.findUnique as any)({
            where: { id: transactionId },
            include: { user: true, type: true }
        });

        if (!transaction || (transaction as any).status !== "FOR_PICKING") {
            return { success: false, error: "Transaction is not in the 'Ready for Picking' stage." };
        }

        const updated = await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status: "IN_ROUTE",
                driverId: user.id
            } as any
        });

        // Trigger Notification: Notify resident that document is OTW
        const snapshot = transaction.residentSnapshot as any;
        if (transaction.user?.email) {
            await sendEmail({
                type: "IN_ROUTE",
                to: transaction.user.email,
                name: `${snapshot?.firstName} ${snapshot?.lastName}`,
                transactionId: transaction.id,
                amount: transaction.totalAmount
            });
        }

        revalidatePath("/admin/treasury");
        revalidatePath(`/admin/treasury/${transactionId}`);
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Handover error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Logistics: Confirm Delivery (Rider Side)
 */
export async function deliverTransaction(transactionId: string, podUrl: string) {
    try {
        const session = await getSession();
        const user = session?.user as any;

        if (!user || user.role !== "RIDER") {
            return { success: false, error: "Unauthorized." };
        }

        const updated = await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status: "DELIVERED",
                podUrl: podUrl,
                deliveredAt: new Date()
            } as any
        });

        revalidatePath("/admin/treasury");
        revalidatePath(`/admin/treasury/${transactionId}`);
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Delivery confirmation error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Cancel a transaction (Resident side)
 */
export async function cancelTransaction(id: string) {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const tx = await (prisma.transaction.findUnique as any)({
            where: { id }
        });

        if (!tx) return { success: false, error: "Transaction not found" };
        if (tx.userId !== session.user.id) return { success: false, error: "Forbidden" };
        if (tx.isCancelled) return { success: false, error: "This request is already cancelled." };
        
        // Only allow cancellation if the request is still in DRAFT or FOR_REQUESTING phase
        const restrictedStatuses = [
            "FOR_PROCESSING", 
            "EVALUATED", 
            "FOR_CLAIM", 
            "FOR_PICKING", 
            "IN_ROUTE", 
            "DELIVERED", 
            "UNPAID", 
            "PAID", 
            "RELEASED", 
            "REJECTED"
        ];
        if (restrictedStatuses.includes(tx.status)) {
            return { success: false, error: "Cannot cancel transaction at this stage. Please contact support if you need assistance." };
        }

        await (prisma.transaction.update as any)({
            where: { id },
            data: { isCancelled: true }
        });

        revalidatePath("/user/services/requests");
        revalidatePath(`/user/services/requests/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Cancel transaction error:", error);
        return { success: false, error: "Failed to cancel transaction" };
    }
}

/**
 * Request Return or Refund (Resident side)
 */
export async function requestReturnOrRefund(formData: FormData) {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const id = formData.get("id") as string;
        const type = formData.get("type") as "RETURN" | "REFUND";
        const reason = formData.get("reason") as string;
        const proofFile = formData.get("proofFile") as File;

        const tx = await prisma.transaction.findUnique({
            where: { id }
        });

        if (!tx || tx.userId !== session.user.id) {
            return { success: false, error: "Transaction not found" };
        }

        if (tx.status !== "DELIVERED") {
            return { success: false, error: "Only delivered transactions can be returned or refunded." };
        }

        let proofUrl = null;
        if (proofFile && proofFile.size > 0) {
            proofUrl = await processFileUpload(proofFile, "disputes");
        }

        const newStatus = type === "RETURN" ? "RETURN_REQUESTED" : "REFUND_REQUESTED";

        const updated = await prisma.transaction.update({
            where: { id },
            data: {
                status: newStatus as any,
                disputeReason: reason,
                disputeProofUrl: proofUrl,
                updatedAt: new Date()
            } as any
        });

        revalidatePath("/user/services/requests");
        revalidatePath(`/user/services/requests/${id}`);
        return { success: true, data: updated };
    } catch (error) {
        console.error("Dispute request error:", error);
        return { success: false, error: "Failed to submit dispute request" };
    }
}

/**
 * Resolve a Dispute (Admin side)
 */
export async function resolveDispute(transactionId: string, action: 'APPROVE' | 'REJECT', remarks: string) {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const tx = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { user: true }
        });

        if (!tx) return { success: false, error: "Transaction not found" };

        let newStatus: string;
        if (action === 'APPROVE') {
            newStatus = (tx.status as any) === "RETURN_REQUESTED" ? "PAID" : "REFUNDED";
        } else {
            newStatus = "DISPUTE_REJECTED";
        }

        const updated = await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status: newStatus as any,
                disputeRemarks: remarks,
                updatedAt: new Date()
            } as any
        });

        // Trigger Email Notification for Approved Returns
        if (action === 'APPROVE' && (tx.status as any) === "RETURN_REQUESTED") {
            if (tx.user?.email) {
                await sendEmail({
                    type: "DISPUTE_APPROVED",
                    to: tx.user.email,
                    name: tx.user.name || "Resident",
                    transactionId: transactionId,
                    remarks: remarks
                });
            }
        }

        // Trigger Email Notification for Rejected Disputes
        if (action === 'REJECT') {
            if (tx.user?.email) {
                await sendEmail({
                    type: "DISPUTE_REJECTED",
                    to: tx.user.email,
                    name: tx.user.name || "Resident",
                    transactionId: transactionId,
                    remarks: remarks
                });
            }
        }

        revalidatePath("/admin/treasury");
        revalidatePath(`/admin/treasury/${transactionId}`);
        revalidatePath("/user/services/requests");
        revalidatePath(`/user/services/requests/${transactionId}`);
        
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Dispute resolution error:", error);
        return { success: false, error: error.message };
    }
}
