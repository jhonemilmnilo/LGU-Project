"use server";

import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { calculateCedula } from "@/lib/cedula";
import { calculateBusinessPermit } from "@/lib/business-permit";

import { sendEmail } from "@/lib/mail";
import { uploadFile } from "@/lib/storage";



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
                category: "CEDULA",
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
                category: "CEDULA",
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
                    supportsECopy: t.supportsECopy
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
                category: "Business Permit",
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
                category: "Business Permit",
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

export async function ensureBuildingPermitTransactionTypes() {
    try {
        const types = [
            {
                code: "BUILDING_PERMIT",
                name: "Building Permit",
                description: "Apply for a new building permit online. Manage your construction requirements.",
                level: 1,
                category: "Building Permit",
                baseFee: 1000.00,
                deliveryFee: 100.00,
                isFixed: false,
                requiredDocs: [
                    "Plans duly signed & sealed by licensed professional",
                    "Certified true copy of Tax Declaration",
                    "Xerox copy of land title",
                    "Community Tax Certificate (Cedula)",
                    "Electrical & Sanitary permit",
                    "Locational clearance",
                    "Fire Safety clearance"
                ],
                formSchema: {
                    type: "BUILDING_PERMIT",
                    fields: ["applicantName", "projectType", "floorArea", "estimatedCost", "location"]
                },
                requiresBusinessName: false,
                supportsECopy: true
            }
        ];

        for (const t of types) {
            await prisma.transactionType.upsert({
                where: { code: t.code },
                update: {
                    name: t.name,
                    description: t.description,
                    baseFee: t.baseFee,
                    deliveryFee: t.deliveryFee,
                    requiredDocs: t.requiredDocs,
                    formSchema: t.formSchema,
                    supportsECopy: t.supportsECopy
                },
                create: t
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Ensure building permit types error:", error);
        return { success: false, error: "Failed to initialize Building Permit service types" };
    }
}

export async function ensureCivilRegistryTransactionTypes() {
    try {
        const types = [
            {
                code: "LCR_BIRTH",
                name: "Birth Certificate (Certified Copy)",
                description: "Request for a certified true copy of a birth certificate from the Local Civil Registry.",
                level: 1,
                category: "Civil Registry",
                baseFee: 150.00,
                deliveryFee: 100.00,
                isFixed: true,
                requiredDocs: ["Valid ID of Applicant", "Authorization Letter (if not owner)", "Proof of Relationship"],
                formSchema: {
                    type: "CIVIL_REGISTRY",
                    registryType: "BIRTH",
                    fields: ["fullName", "dateOfBirth", "placeOfBirth", "fathersName", "mothersName"]
                },
                requiresBusinessName: false,
                supportsECopy: true
            },
            {
                code: "LCR_BIRTH_REG",
                name: "Birth Registration",
                description: "Register a new birth record with the Local Civil Registry.",
                level: 1,
                category: "Civil Registry",
                baseFee: 100.00,
                deliveryFee: 100.00,
                isFixed: true,
                requiredDocs: ["Certificate of Live Birth", "Marriage Certificate of Parents", "Valid ID of Informant"],
                formSchema: {
                    type: "CIVIL_REGISTRY",
                    registryType: "BIRTH_REG",
                    fields: ["fullName", "dateOfBirth", "placeOfBirth", "fathersName", "mothersName"]
                },
                requiresBusinessName: false,
                supportsECopy: true
            },
            {
                code: "LCR_MARRIAGE",
                name: "Marriage Certificate (Certified Copy)",
                description: "Request for a certified true copy of a marriage certificate from the Local Civil Registry.",
                level: 1,
                category: "Civil Registry",
                baseFee: 150.00,
                deliveryFee: 100.00,
                isFixed: true,
                requiredDocs: ["Valid ID of Applicant", "Authorization Letter (if not owner)"],
                formSchema: {
                    type: "CIVIL_REGISTRY",
                    registryType: "MARRIAGE",
                    fields: ["husbandName", "wifeName", "dateOfMarriage", "placeOfMarriage"]
                },
                requiresBusinessName: false,
                supportsECopy: true
            },
            {
                code: "LCR_MARRIAGE_LICENSE",
                name: "Marriage License Application",
                description: "Apply for a marriage license to be married in Mapandan.",
                level: 1,
                category: "Civil Registry",
                baseFee: 862.00,
                deliveryFee: 0.00,
                isFixed: true,
                requiredDocs: [
                    "Municipal Form No. 90",
                    "Community Tax Certificate",
                    "Parental Consent of the father/mother",
                    "Certificate of Family Planning",
                    "Certificate of Pre-Marriage Counseling",
                    "Birth Certificate of Applicant 1",
                    "Birth Certificate of Applicant 2",
                    "Government ID of Applicant 1",
                    "Government ID of Applicant 2",
                    "Seminar Attendance Proof",
                    "Legal Capacity (if one party is a foreigner)"
                ],
                formSchema: {
                    type: "CIVIL_REGISTRY",
                    registryType: "MARRIAGE_LICENSE",
                    fields: ["applicant1", "applicant2", "requiredDocs"]
                },
                requiresBusinessName: false,
                supportsECopy: true
            },
            {
                code: "LCR_MARRIAGE_REG",
                name: "Marriage Registration",
                description: "Register a new marriage record with the Local Civil Registry.",
                level: 1,
                category: "Civil Registry",
                baseFee: 100.00,
                deliveryFee: 100.00,
                isFixed: true,
                requiredDocs: ["Accomplished Certificate of Marriage", "PSA Negative Certificate", "Affidavit of Delayed Registration", "Certified Copy of Marriage License"],
                formSchema: {
                    type: "CIVIL_REGISTRY",
                    registryType: "MARRIAGE_REG",
                    fields: ["applicant1", "applicant2", "dateOfMarriage", "placeOfMarriage"]
                },
                requiresBusinessName: false,
                supportsECopy: true
            },
            {
                code: "LCR_DEATH",
                name: "Death Certificate (Certified Copy)",
                description: "Request for a certified true copy of a death certificate from the Local Civil Registry.",
                level: 1,
                category: "Civil Registry",
                baseFee: 150.00,
                deliveryFee: 100.00,
                isFixed: true,
                requiredDocs: ["Valid ID of Applicant", "Proof of Relationship"],
                formSchema: {
                    type: "CIVIL_REGISTRY",
                    registryType: "DEATH",
                    fields: ["deceasedName", "dateOfDeath", "placeOfDeath"]
                },
                requiresBusinessName: false,
                supportsECopy: true
            },
            {
                code: "LCR_DEATH_REG",
                name: "Death Registration",
                description: "Register a new death record with the Local Civil Registry.",
                level: 1,
                category: "Civil Registry",
                baseFee: 0.00,
                deliveryFee: 100.00,
                isFixed: true,
                requiredDocs: ["Municipal Form No. 103", "Valid ID of Informant"],
                formSchema: {
                    type: "CIVIL_REGISTRY",
                    registryType: "DEATH_REG",
                    fields: ["fullName", "dateOfBirth", "dateOfDeath", "placeOfDeath", "causeOfDeath", "gender", "civilStatus", "fathersName", "mothersName"]
                },
                requiresBusinessName: false,
                supportsECopy: true
            }
        ];

        for (const t of types) {
            await prisma.transactionType.upsert({
                where: { code: t.code },
                update: {
                    name: t.name,
                    description: t.description,
                    requiredDocs: t.requiredDocs,
                    formSchema: t.formSchema,
                    supportsECopy: t.supportsECopy
                },
                create: t
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Ensure civil registry types error:", error);
        return { success: false, error: "Failed to initialize Civil Registry service types" };
    }
}

function getPHTimeISOString() {
    const phOffset = 8 * 60 * 60 * 1000; // UTC+8
    const phTime = new Date(Date.now() + phOffset);
    return phTime.toISOString().replace("Z", "+08:00");
}

export async function submitCivilRegistryTransaction(formData: FormData) {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const typeId = formData.get("typeId") as string;
        const registryType = formData.get("registryType") as string;
        const residentSnapshotRaw = formData.get("residentSnapshot");
        const additionalDataRaw = formData.get("additionalData");

        if (!typeId || !registryType || !residentSnapshotRaw || !additionalDataRaw) {
            return { success: false, error: "Missing required transaction data" };
        }

        const residentSnapshot = JSON.parse(residentSnapshotRaw as string);
        const additionalData = JSON.parse(additionalDataRaw as string);

        console.log(`Processing ${registryType} transaction for user ${session.user.id}`);

        const files: Record<string, string | null> = {};

        // Dynamic file extraction from FormData -- accept File-like blobs too
        const isFileLike = (v: any) => {
            return v && (v instanceof File || (typeof v === 'object' && typeof v.arrayBuffer === 'function' && typeof v.name === 'string'));
        };

        for (const [key, value] of formData.entries()) {
            if (isFileLike(value)) {
                const fileLike = value as File;
                if ((fileLike as any).size && (fileLike as any).size > 0) {
                    // Use a standard bucket and specific folder
                    const url = await processFileUpload(fileLike, `lcr/${registryType.toLowerCase()}`);
                    files[key] = url;
                    if (!url) console.warn(`[submitCivilRegistryTransaction] upload returned null for key=${key}`);
                }
            }
        }

        // Debug: log incoming additionalData and files to help trace missing fields
        console.log("[submitCivilRegistryTransaction] additionalData:", additionalData);
        console.log("[submitCivilRegistryTransaction] files:", files);

        const updatedAdditionalData = {
            ...additionalData,
            ...files,
            registryType,
            submittedAt: getPHTimeISOString()
        };
        console.log("[submitCivilRegistryTransaction] updatedAdditionalData:", updatedAdditionalData);

        const transaction = await prisma.$transaction(async (tx: any) => {
            const t = await tx.transaction.create({
                data: {
                    userId: session.user.id,
                    typeId,
                    status: "FOR_REQUESTING",
                    fulfillmentType: additionalData.fulfillmentType || null,
                    paymentType: null,
                    residentSnapshot,
                    additionalData: updatedAdditionalData,
                    totalAmount: additionalData.miscFee ?? additionalData.totalAmount ?? 0,
                    businessName: additionalData.subjectName || (additionalData.children?.[0] ? `${additionalData.children[0].firstName} ${additionalData.children[0].lastName}` : null),
                }
            });

            await tx.resident.update({
                where: { userId: session.user.id },
                data: {
                    firstName: residentSnapshot.firstName,
                    middleName: residentSnapshot.middleName,
                    lastName: residentSnapshot.lastName,
                    suffix: residentSnapshot.suffix,
                    contactNumber: residentSnapshot.contactNumber,
                    email: residentSnapshot.email,
                }
            });

            return t;
        });
            // No payment record created at submission time for civil registry.

        revalidatePath("/user/services");
        revalidatePath("/admin/transactions");
        return { success: true, data: transaction };
    } catch (error: any) {
        console.error("Submit civil registry error:", error);
        // Include the error message for better debugging
        return {
            success: false,
            error: error?.message || "Failed to submit registry request"
        };
    }
}

export async function submitBirthRegistration(formData: FormData) {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        // Validate required fields before parsing to avoid runtime exceptions
        const missing: string[] = [];
        const typeIdRaw = formData.get("typeId");
        const residentSnapshotRaw = formData.get("residentSnapshot");
        const additionalDataRaw = formData.get("additionalData");

        if (!typeIdRaw) missing.push("typeId");
        if (!residentSnapshotRaw) missing.push("residentSnapshot");
        if (!additionalDataRaw) missing.push("additionalData");

        if (missing.length > 0) {
            return { success: false, error: "Missing required fields", missingFields: missing };
        }

        const typeId = typeIdRaw as string;
        const residentSnapshot = JSON.parse(residentSnapshotRaw as string);
        const additionalData = JSON.parse(additionalDataRaw as string);

        // File uploads
        const files: Record<string, string | null> = {};
        for (const [key, value] of formData.entries()) {
            if (value instanceof File && value.size > 0) {
                const url = await processFileUpload(value, "lcr_birth_reg");
                files[key] = url;
            }
        }

        const updatedAdditionalData = {
            ...additionalData,
            ...files,
            registryType: "BIRTH_REG",
            submittedAt: getPHTimeISOString()
        };

        // Server-side validation: ensure required documents are present
        const regType = additionalData.registrationType || "STANDARD";
        const parentsMarried = typeof additionalData.parentsMarried !== 'undefined' ? !!additionalData.parentsMarried : true;
        const requiredDocsStandard = parentsMarried ? ["marriageCertificate", "municipalForm102"] : ["communityTaxCertificate"];
        const requiredDocsLate = ["negativePSA", "colb", "affidavitDelayed", "supportingEvidence1", "supportingEvidence2"];
        const requiredKeys = regType === "STANDARD" ? requiredDocsStandard : requiredDocsLate;
        const missingDocs = requiredKeys.filter(k => !updatedAdditionalData[k]);
        if (missingDocs.length > 0) {
            return { success: false, error: "Missing required documents", missingDocuments: missingDocs };
        }

        const transaction = await prisma.$transaction(async (tx: any) => {
            // Create the transaction record for tracking
            const t = await tx.transaction.create({
                data: {
                    userId: session.user.id,
                    typeId,
                    status: "FOR_REQUESTING",
                    fulfillmentType: additionalData.fulfillmentType || null,
                    paymentType: null,
                    residentSnapshot,
                    additionalData: updatedAdditionalData,
                    totalAmount: additionalData.miscFee ?? additionalData.totalAmount ?? 0,
                    businessName: additionalData.subjectName || (additionalData.children?.[0] ? `${additionalData.children[0].firstName} ${additionalData.children[0].lastName}` : null),
                }
            });

            // Update resident contact info
            await tx.resident.update({
                where: { userId: session.user.id },
                data: {
                    contactNumber: residentSnapshot.contactNumber,
                    email: residentSnapshot.email,
                }
            });

            return t;
        });

        // No payment record created at submission time for birth registration.

        revalidatePath("/user/services");
        revalidatePath("/admin/transactions");
        return { success: true, data: transaction };
    } catch (error) {
        console.error("Submit birth registration error:", error);
        return { success: false, error: "Failed to submit birth registration" };
    }
}

export async function searchCivilRegistryRecords(type: string, query: string) {
    try {
        if (type === "BIRTH") {
            const records = await prisma.birthCertificateRegistry.findMany({
                where: {
                    subjectName: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                take: 5
            });
            return { success: true, data: records };
        }
        return { success: true, data: [] };
    } catch (error) {
        console.error("Search LCR records error:", error);
        return { success: false, error: "Failed to search records" };
    }
}

export async function submitBusinessPermitTransaction(formData: FormData) {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };


        // Validate required fields before parsing to avoid runtime exceptions and provide helpful feedback
        const missing: string[] = [];
        const typeIdRaw = formData.get("typeId");
        const residentSnapshotRaw = formData.get("residentSnapshot");
        const additionalDataRaw = formData.get("additionalData");

        if (!typeIdRaw) missing.push("typeId");
        if (!residentSnapshotRaw) missing.push("residentSnapshot");
        if (!additionalDataRaw) missing.push("additionalData");

        if (missing.length > 0) {
            return { success: false, error: "Missing required fields", missingFields: missing };
        }

        const typeId = typeIdRaw as string;
        const residentSnapshot = JSON.parse(residentSnapshotRaw as string);
        const additionalData = JSON.parse(additionalDataRaw as string);
        const revisionId = formData.get("revisionId") as string | null;

        // Strike penalty check
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { rejectionCount: true }
        });
        if (user && user.rejectionCount >= 3) {
            return { success: false, error: "Submission blocked: Account suspended due to 3 rejection strikes. Please apply onsite at the Municipal Hall." };
        }

        // Fetch existing transaction if under revision to reuse existing file uploads
        let existingTx: any = null;
        if (revisionId) {
            existingTx = await prisma.transaction.findUnique({
                where: { id: revisionId }
            });
        }
        const existingAddData = existingTx?.additionalData as any;

        // Process BPLO Checklist file uploads with fallbacks for revision files
        const ctcFile = formData.get("ctcFile") as File | null;
        const dtiSecFile = formData.get("dtiSecFile") as File | null;
        const brgyClearanceFile = formData.get("brgyClearanceFile") as File | null;
        const ownerIdFile = formData.get("ownerIdFile") as File | null;
        const locationPhotoFile = formData.get("locationPhotoFile") as File | null;
        const sanitaryPermitFile = formData.get("sanitaryPermitFile") as File | null;
        const fireSafetyFile = formData.get("fireSafetyFile") as File | null;
        const birCorFile = formData.get("birCorFile") as File | null;
        const previousPermitFile = formData.get("previousPermitFile") as File | null;

        const ctcUrl = ctcFile ? await processFileUpload(ctcFile, "bp_ctc") : existingAddData?.ctcUrl;
        const dtiSecUrl = dtiSecFile ? await processFileUpload(dtiSecFile, "bp_dti") : existingAddData?.dtiSecUrl;
        const brgyClearanceUrl = brgyClearanceFile ? await processFileUpload(brgyClearanceFile, "bp_brgy") : existingAddData?.brgyClearanceUrl;
        const ownerIdUrl = ownerIdFile ? await processFileUpload(ownerIdFile, "bp_owner_id") : (existingAddData?.ownerIdUrl || residentSnapshot?.idFrontUrl);
        const locationPhotoUrl = locationPhotoFile ? await processFileUpload(locationPhotoFile, "bp_location") : existingAddData?.locationPhotoUrl;
        const sanitaryPermitUrl = sanitaryPermitFile ? await processFileUpload(sanitaryPermitFile, "bp_sanitary") : existingAddData?.sanitaryPermitUrl;
        const fireSafetyUrl = fireSafetyFile ? await processFileUpload(fireSafetyFile, "bp_fire") : existingAddData?.fireSafetyUrl;
        const birCorUrl = birCorFile ? await processFileUpload(birCorFile, "bp_bir") : existingAddData?.birCorUrl;
        const previousPermitUrl = previousPermitFile ? await processFileUpload(previousPermitFile, "bp_prev_permit") : existingAddData?.previousPermitUrl;

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
            birCorUrl,
            previousPermitUrl
        };

        const txData = {
            userId: session.user.id,
            typeId,
            status: "FOR_INSPECTION",
            fulfillmentType: additionalData.fulfillmentType || null,
            paymentType: null,
            residentSnapshot,
            additionalData: updatedAdditionalData,
            totalAmount: 0,
            businessName: additionalData.businessName || null,
            rejectionRemarks: null, // Reset rejection remarks on resubmit!
            updatedAt: new Date()
        } as any;

        const [transaction] = await prisma.$transaction([
            // 1. Create or Update BPLO Transaction
            revisionId
                ? prisma.transaction.update({
                    where: { id: revisionId },
                    data: txData
                })
                : prisma.transaction.create({
                    data: txData
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
        const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
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
        const session = await getSession();
        const user = session?.user as any;

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                type: true,
                cedula: true,
                businessPermit: true,
                birthCertificateRequest: true,
                birthCertificateRegistry: true,
                deathRegistration: true,
                marriageRegistration: true,
                marriageLicenseApplication: true,
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

        const isBusinessPermit = transaction.type.code.startsWith("BUSINESS_PERMIT");

        // TREASURY_STAFF should not be able to view Business Permits in pre-screening status (FOR_INSPECTION)
        if (isBusinessPermit && user?.role === "TREASURY_STAFF" && ["FOR_INSPECTION"].includes(transaction.status)) {
            return { success: false, error: "Forbidden: Pre-screening and evaluation must be handled by an Admin Aide first." };
        }

        // ADMIN_AIDE should only be able to view Business Permit transactions
        if (user?.role === "ADMIN_AIDE" && !isBusinessPermit) {
            return { success: false, error: "Forbidden: Admin Aides can only access Business Permit transactions." };
        }

        // ENGINEER should only be able to view Building Permit transactions
        const isBuildingPermit = transaction.type.code.startsWith("BUILDING_PERMIT");
        if (user?.role === "ENGINEER" && !isBuildingPermit) {
            return { success: false, error: "Forbidden: Engineers can only access Building Permit transactions." };
        }

        // Ordinary resident check: can only fetch their own transactions
        if (user?.role === "USER" && transaction.userId !== user.id) {
            return { success: false, error: "Forbidden" };
        }

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
        const transactionType = await prisma.transactionType.findUnique({
            where: { id: typeId }
        });
        const isBusinessPermit = transactionType?.code.startsWith("BUSINESS_PERMIT") || false;
        const initialStatus = isBusinessPermit ? "FOR_INSPECTION" : "FOR_REQUESTING";

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
                    status: initialStatus,
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
export async function evaluateCedulaTransaction(id: string, deliveryFeeOverride?: number, adminNotes?: string, bpFeeLineItems?: { label: string; amount: number }[]) {
    try {
        const session = await getSession();
        // Check for TREASURY_STAFF or ADMIN role
        const user = session?.user as any;
        if (!user || (user.role !== "TREASURY_STAFF" && user.role !== "ADMIN" && user.role !== "ADMIN_AIDE" && user.role !== "ENGINEER")) {
            return { success: false, error: "Forbidden" };
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: { type: true, user: true }
        });

        if (!transaction) return { success: false, error: "Transaction not found" };

        const isBusinessPermit = transaction.type.code.startsWith("BUSINESS_PERMIT");
        const isLCR = transaction.type.code.startsWith("LCR_");

        // ADMIN_AIDE can only evaluate Business Permits in FOR_INSPECTION status
        if (isBusinessPermit && user.role === "ADMIN_AIDE" && transaction.status !== "FOR_INSPECTION") {
            return { success: false, error: "Forbidden: Admin Aides can only process Business Permits in the inspection phase." };
        }

        // TREASURY_STAFF cannot pre-screen or evaluate Business Permits that are in pre-screening states
        if (isBusinessPermit && user.role === "TREASURY_STAFF" && ["FOR_INSPECTION"].includes(transaction.status)) {
            return { success: false, error: "Forbidden: Pre-screening and evaluation must be handled by an Admin Aide first." };
        }
        const isCedula = transaction.type.code.includes("CEDULA");

        // Allow Cedula, Business Permit, and Civil Registry (LCR) transactions to be evaluated here.
        if (!isCedula && !isBusinessPermit && !isLCR) {
            return { success: false, error: "Unsupported transaction type" };
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
        let result: {
            basicTax: number;
            additionalTax: number;
            penalty: number;
            deliveryFee: number;
            totalAmount: number;
        } = {
            basicTax: 0,
            additionalTax: 0,
            penalty: 0,
            deliveryFee: 0,
            totalAmount: 0
        };

        if (isBusinessPermit) {
            if (user.role === "ADMIN_AIDE") {
                result = {
                    basicTax: 0,
                    additionalTax: 0,
                    penalty: 0,
                    deliveryFee: 0,
                    totalAmount: 0
                };
            } else if (bpFeeLineItems && bpFeeLineItems.length > 0) {
                const itemsSum = bpFeeLineItems.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
                const deliveryFee = transaction.fulfillmentType === "DELIVERY"
                    ? (deliveryFeeOverride !== undefined ? deliveryFeeOverride : dynamicDeliveryFee || 0)
                    : 0;
                const total = itemsSum + deliveryFee;
                result = {
                    basicTax: itemsSum,
                    additionalTax: 0,
                    penalty: 0,
                    deliveryFee: deliveryFee,
                    totalAmount: total
                };
            } else {
                const cap = Number(additionalData.capitalInvestment || 0);
                const sales = Number(additionalData.grossSales || 0);
                const bploCalc = calculateBusinessPermit({
                    type: additionalData.businessType === "NEW" ? "NEW" : "RENEWAL",
                    capitalization: cap,
                    grossSales: sales,
                    fulfillmentType: transaction.fulfillmentType,
                    deliveryFee: deliveryFeeOverride !== undefined ? deliveryFeeOverride : dynamicDeliveryFee
                });
                result = {
                    basicTax: bploCalc.baseFee,
                    additionalTax: bploCalc.taxAmount,
                    penalty: 0,
                    deliveryFee: bploCalc.deliveryFee,
                    totalAmount: bploCalc.totalAmount
                };
            }
        } else if (isCedula) {
            const cedulaCalc = calculateCedula({
                type: additionalData.applicantType || "INDIVIDUAL",
                income: additionalData.income || 0,
                propertyValue: additionalData.propertyValue || 0,
                fulfillmentType: transaction.fulfillmentType,
                deliveryFee: deliveryFeeOverride !== undefined ? deliveryFeeOverride : dynamicDeliveryFee,
                baseFee: transaction.type?.baseFee
            });
            result = {
                basicTax: cedulaCalc.basicTax,
                additionalTax: cedulaCalc.additionalTax,
                penalty: cedulaCalc.penalty,
                deliveryFee: cedulaCalc.deliveryFee,
                totalAmount: cedulaCalc.totalAmount
            };
        } else if (isLCR) {
            // Civil Registry (LCR) services like marriage/death/birth should use the
            // persisted transaction total when available (e.g., provided by registry
            // at submission). If not present, fall back to type base fee + delivery.
            const typeCode = (transaction.type?.code || "").toUpperCase();
            const additional = transaction.additionalData as any || {};
            const isLate = (additional.registrationType || "").toUpperCase() === "LATE";
            const isMarriageReg = typeCode === "LCR_MARRIAGE_REG";
            
            const baseFee = (isMarriageReg && !isLate)
                ? 0
                : Number(transaction.type?.baseFee || 0);
            const feeDelivery = Number(transaction.type?.deliveryFee || 0);
            const deliveryFeeUsed = deliveryFeeOverride !== undefined ? deliveryFeeOverride : dynamicDeliveryFee || feeDelivery;

            const persistedTotal = Number(transaction.totalAmount || 0);
            const total = persistedTotal > 0
                ? persistedTotal
                : baseFee + (transaction.fulfillmentType === "DELIVERY" ? deliveryFeeUsed : 0);

            result = {
                basicTax: 0,
                additionalTax: 0,
                penalty: 0,
                deliveryFee: deliveryFeeUsed,
                totalAmount: total
            };
        }

        // Determine New Status
        // If it is an ADMIN_AIDE pre-screening a Business Permit, the status should be set to FOR_REQUESTING
        const newStatus = (user.role === "ADMIN_AIDE" && isBusinessPermit) ? "FOR_REQUESTING" : "EVALUATED" as any;

        const updatedTransaction = await prisma.transaction.update({
            where: { id },
            data: {
                status: newStatus,
                totalAmount: result!.totalAmount, // This is the Base Tax + Penalty
                processedBy: user.id,
                rejectionRemarks: adminNotes,
                fiscalSnapshot: {
                    basicTax: result!.basicTax,
                    additionalTax: result!.additionalTax,
                    penaltyCharge: result!.penalty,
                    deliveryFee: result!.deliveryFee, // Persist delivery fee here
                    totalAmount: result!.totalAmount,
                    ...(isBusinessPermit && bpFeeLineItems ? { lineItems: bpFeeLineItems } : {})
                }
            } as any,
            include: { user: true }
        }) as any;

        // Trigger email notification for payment
        if (updatedTransaction.user?.email && newStatus === "EVALUATED") {
            const resident = updatedTransaction.residentSnapshot as any;
            await sendEmail({
                type: "FOR_PAYMENT",
                to: updatedTransaction.user.email,
                name: resident?.firstName ? `${resident.firstName} ${resident.lastName}` : updatedTransaction.user.name || "Resident",
                transactionId: id.slice(-8).toUpperCase(),
                amount: result!.totalAmount,
                remarks: adminNotes
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
        const gcashReferenceNo = formData.get("gcashReferenceNo") as string;

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
                additionalData: {
                    ...(transaction.additionalData as any || {}),
                    gcashReferenceNo: gcashReferenceNo || null
                },
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
        if (!user || (user.role !== "TREASURY_STAFF" && user.role !== "ADMIN" && user.role !== "ADMIN_AIDE" && user.role !== "ENGINEER")) {
            return { success: false, error: "Forbidden" };
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: { type: true }
        });

        if (!transaction) return { success: false, error: "Transaction not found" };

        const isBusinessPermit = transaction.type.code.startsWith("BUSINESS_PERMIT");
        if (isBusinessPermit && user.role === "ADMIN_AIDE" && transaction.status !== "FOR_INSPECTION") {
            return { success: false, error: "Forbidden: Admin Aides can only process Business Permits in the evaluation phase." };
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

        const updatedTransaction = await prisma.transaction.update({
            where: { id },
            data: transactionData
        });

        revalidatePath("/admin/treasury");
        return { success: true, data: updatedTransaction };
    } catch (error) {
        console.error("Confirm payment error:", error);
        return { success: false, error: "Failed to confirm payment" };
    }
}

/**
 * Release Cedula (Treasury Staff side)
 */
export async function releaseCedula(id: string, ctcNumber: string, eCopyUrl?: string, orUrl?: string) {
    try {
        const session = await getSession();
        const user = session?.user as any;
        if (!user || (user.role !== "TREASURY_STAFF" && user.role !== "ADMIN" && user.role !== "ADMIN_AIDE" && user.role !== "ENGINEER")) {
            return { success: false, error: "Forbidden" };
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                type: true,
                user: true,
                cedula: true,
                businessPermit: true,
                birthCertificateRequest: true,
                birthCertificateRegistry: true,
                deathRegistration: true,
                marriageRegistration: true,
                marriageLicenseApplication: true
            }
        });

        if (!transaction || !["PAID", "FOR_CLAIM", "FOR_PROCESSING"].includes(transaction.status as any)) {
            return { success: false, error: "Transaction must be paid, processing, or ready for claiming before release" };
        }

        const isBusinessPermit = transaction.type.code.startsWith("BUSINESS_PERMIT");

        if (isBusinessPermit && user.role === "ADMIN_AIDE" && transaction.status !== "FOR_INSPECTION") {
            return { success: false, error: "Forbidden: Admin Aides can only process Business Permits in the evaluation phase." };
        }
        const additionalData = transaction.additionalData as any;

        let basicTax = 0;
        let additionalTax = 0;
        let penalty = 0;

        if (isBusinessPermit) {
            const cap = Number(additionalData.capitalInvestment || 0);
            const sales = Number(additionalData.grossSales || 0);
            const bploCalc = calculateBusinessPermit({
                type: additionalData.businessType === "NEW" ? "NEW" : "RENEWAL",
                capitalization: cap,
                grossSales: sales,
                fulfillmentType: transaction.fulfillmentType,
                deliveryFee: transaction.type.deliveryFee
            });
            basicTax = bploCalc.baseFee;
            additionalTax = bploCalc.taxAmount;
            penalty = 0;
        } else {
            const calc = calculateCedula({
                type: additionalData.applicantType || "INDIVIDUAL",
                income: additionalData.income || 0,
                propertyValue: additionalData.propertyValue || 0,
                fulfillmentType: transaction.fulfillmentType,
                deliveryFee: transaction.type.deliveryFee,
                baseFee: transaction.type.baseFee
            });
            basicTax = calc.basicTax;
            additionalTax = calc.additionalTax;
            penalty = calc.penalty;
        }

        // Determine target status: FOR_PICKING for Delivery, FOR_CLAIM for Pickup prepare, else RELEASED
        const isInitialRelease = transaction.status === "FOR_PROCESSING" || transaction.status === "PAID";
        const targetStatus = isInitialRelease
            ? (transaction.fulfillmentType === "DELIVERY" ? "FOR_PICKING" : "FOR_CLAIM")
            : "RELEASED";

        // Strictly enforce E-Copy and OR attachments for Business Permits in initial release phase
        if (isBusinessPermit && isInitialRelease) {
            const currentECopy = eCopyUrl || transaction.eCopyUrl;
            const currentOr = orUrl || transaction.orUrl;
            if (!currentECopy) {
                return { success: false, error: "Digital E-Copy is required for Business Permits before releasing." };
            }
            if (!currentOr) {
                return { success: false, error: "Official Receipt (OR) attachment is required for Business Permits before releasing." };
            }
        }

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
            }
        }

        // Check if Serial / CTC Number is already used by another transaction (only for Cedula, since Business Permit is auto-generated)
        if (ctcNumber && !isBusinessPermit) {
            const existingCedula = await prisma.cedula.findUnique({
                where: { ctcNumber }
            });
            if (existingCedula && existingCedula.transactionId !== id) {
                return { success: false, error: `CTC Number ${ctcNumber} is already used by another request.` };
            }
        }

        const now = new Date();
        const isPickupCashInitial = transaction.fulfillmentType === "PICK_UP" && transaction.paymentType === "CASH" && transaction.status === "FOR_PROCESSING";

        // Handle either BPLO or Cedula lifecycle
        if (isBusinessPermit) {
            const isRenewal = transaction.type.code === "BUSINESS_PERMIT_RENEW" || 
                              additionalData?.businessType === "RENEWAL" || 
                              additionalData?.businessType === "RENEW";
            const existingPermitNo = additionalData?.permitNumber || additionalData?.existingPermitNumber || additionalData?.existingPermitNo;

            if (!transaction.businessPermit) {
                const generatedPermitNo = (isRenewal && existingPermitNo)
                    ? existingPermitNo.trim()
                    : (ctcNumber?.trim() || `BP-${now.getFullYear()}-${id.slice(-6).toUpperCase()}`);
                await prisma.businessPermit.create({
                    data: {
                        transactionId: id,
                        permitNumber: generatedPermitNo,
                        taxYear: now.getFullYear(),
                        dateIssued: now,
                        expiryDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
                        businessName: transaction.businessName || additionalData.businessName || "Unnamed Business",
                        tradeName: additionalData.tradeName || null,
                        orgType: additionalData.orgType || "SOLE_PROPRIETORSHIP",
                        dtiSecNumber: additionalData.dtiSecNumber || null,
                        lineOfBusiness: additionalData.lineOfBusiness || "General",
                        capitalInvestment: Number(additionalData.capitalInvestment || 0),
                        grossSales: Number(additionalData.grossSales || 0),
                        employeeCount: Number(additionalData.employeeCount ?? 0),
                        businessArea: Number(additionalData.businessArea || 0),
                        documentUrl: eCopyUrl || transaction.eCopyUrl,
                        issuedBy: user.name || "System Administrator",
                        verificationId: `VER-BP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
                    }
                });
            } else if (ctcNumber || eCopyUrl) {
                await prisma.businessPermit.update({
                    where: { id: transaction.businessPermit.id },
                    data: {
                        ...((ctcNumber && !isRenewal) ? { permitNumber: ctcNumber.trim() } : {}),
                        ...(eCopyUrl ? { documentUrl: eCopyUrl } : {})
                    }
                });
            }
        } else {
            if (!transaction.cedula) {
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
                        basicTax,
                        additionalTax,
                        penalty,
                        totalPaid: transaction.totalAmount,
                        issuedBy: user.name || "System Administrator",
                        businessName: transaction.businessName || additionalData.businessName || null,
                        documentUrl: eCopyUrl || transaction.eCopyUrl,
                        verificationId: `VER-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
                    }
                });
            } else if (ctcNumber || eCopyUrl) {
                await prisma.cedula.update({
                    where: { id: transaction.cedula.id },
                    data: {
                        ...(ctcNumber ? { ctcNumber } : {}),
                        ...(eCopyUrl ? { documentUrl: eCopyUrl } : {})
                    }
                });
            }
        }

            // If this is a Local Civil Registry (LCR) service, ensure a BirthCertificateRegistry
            // or DeathRegistration entry is created when releasing the document so it appears in official registry tables.
            const isLCR = transaction.type.code.startsWith("LCR_");
            if (isLCR) {
                const typeCode = (transaction.type.code || "").toUpperCase();
                if (typeCode === "LCR_BIRTH_REG") {
                    // Only create the registry entry on the final Confirm & Release (RELEASED status)
                    const brExisting = (transaction as any).birthCertificateRegistry;
                    if (!brExisting && targetStatus === "RELEASED") {
                        const bcr = (transaction as any).birthCertificateRequest;
                        const src: any = bcr || additionalData || {};

                        // Only create registry if we have at least a subject name and event date/place
                        const subjectName = src.subjectName || src.fullName || src.primaryChildName || null;
                        const dateOfEvent = src.dateOfEvent ? new Date(src.dateOfEvent) : (src.dateOfBirth ? new Date(src.dateOfBirth) : null);
                        const placeOfEvent = src.placeOfEvent || src.placeOfBirth || null;

                        if (subjectName && dateOfEvent && placeOfEvent) {
                            const generatedRegistryNumber = src.registryNumber || `BIRTH-${new Date().getFullYear()}-${id.slice(-6).toUpperCase()}`;
                            try {
                                await prisma.birthCertificateRegistry.create({
                                    data: {
                                        transactionId: id,
                                        registryNumber: generatedRegistryNumber,
                                        issuedBy: user.name || "System Administrator",
                                        subjectName: subjectName,
                                        dateOfEvent: dateOfEvent,
                                        placeOfEvent: placeOfEvent,
                                        fatherName: src.fatherName || src.father || null,
                                        motherName: src.motherName || src.mother || null
                                    }
                                });
                            } catch (createErr) {
                                // If creation fails (e.g., unique constraint on registryNumber), log and continue
                                console.error("Failed to create BirthCertificateRegistry:", createErr);
                            }
                        }
                    }
                } else if (typeCode === "LCR_DEATH_REG") {
                    const drExisting = (transaction as any).deathRegistration;
                    if (!drExisting && targetStatus === "RELEASED") {
                        const subjectName = additionalData.fullName || additionalData.subjectName || null;
                        const dateOfEvent = additionalData.dateOfDeath ? new Date(additionalData.dateOfDeath) : null;
                        const placeOfEvent = additionalData.placeOfDeath || null;

                        if (subjectName) {
                            const generatedRegistryNumber = additionalData.registryNumber || `DEATH-${new Date().getFullYear()}-${id.slice(-6).toUpperCase()}`;
                            try {
                                await prisma.deathRegistration.create({
                                    data: {
                                        transactionId: id,
                                        registryNumber: generatedRegistryNumber,
                                        dateOfEvent: dateOfEvent,
                                        placeOfEvent: placeOfEvent,
                                        subjectName: subjectName,
                                        fatherName: additionalData.fathersName || additionalData.fatherName || null,
                                        motherName: additionalData.mothersName || additionalData.motherName || null,
                                        issuedBy: user.name || "System Administrator",
                                        documentUrl: eCopyUrl || transaction.eCopyUrl || null
                                    }
                                });
                            } catch (createErr) {
                                console.error("Failed to create DeathRegistration record:", createErr);
                            }
                        }
                    }
                } else if (typeCode === "LCR_MARRIAGE_REG") {
                    const mrExisting = (transaction as any).marriageRegistration;
                    if (!mrExisting && targetStatus === "RELEASED") {
                        const subjectName = transaction.businessName || additionalData.subjectName || (additionalData.applicant1 && additionalData.applicant2 ? `${additionalData.applicant1.fullName} & ${additionalData.applicant2.fullName}` : null) || "Contracting Couple";
                        try {
                            await prisma.marriageRegistration.create({
                                data: {
                                    transactionId: id,
                                    ctcNumber: ctcNumber || null,
                                    taxYear: now.getFullYear(),
                                    dateIssued: now,
                                    expiryDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
                                    basicTax,
                                    additionalTax,
                                    penalty,
                                    totalPaid: transaction.totalAmount,
                                    issuedBy: user.name || "System Administrator",
                                    businessName: subjectName,
                                    documentUrl: eCopyUrl || transaction.eCopyUrl || null,
                                    verificationId: `VER-MR-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
                                }
                            });
                        } catch (createErr) {
                            console.error("Failed to create MarriageRegistration record:", createErr);
                        }
                    }
                } else if (typeCode === "LCR_MARRIAGE_LICENSE") {
                    const mlExisting = (transaction as any).marriageLicenseApplication;
                    if (!mlExisting) {
                        const applicant1 = additionalData?.applicant1 || {};
                        const applicant2 = additionalData?.applicant2 || {};
                        
                        const app1FullName = applicant1.fullName || additionalData?.app1FullName || "";
                        const app2FullName = applicant2.fullName || additionalData?.app2FullName || "";

                        // Parse birth dates safely
                        const app1BirthDate = applicant1.birthDate ? new Date(applicant1.birthDate) : (additionalData?.app1BirthDate ? new Date(additionalData.app1BirthDate) : null);
                        const app2BirthDate = applicant2.birthDate ? new Date(applicant2.birthDate) : (additionalData?.app2BirthDate ? new Date(additionalData.app2BirthDate) : null);

                        const app1BirthPlace = applicant1.birthPlace || additionalData?.app1BirthPlace || null;
                        const app2BirthPlace = applicant2.birthPlace || additionalData?.app2BirthPlace || null;

                        const app1Citizenship = applicant1.citizenship || additionalData?.app1Citizenship || null;
                        const app2Citizenship = applicant2.citizenship || additionalData?.app2Citizenship || null;

                        const generatedRegistryNumber = ctcNumber?.trim() || additionalData?.registryNumber || `ML-${new Date().getFullYear()}-${id.slice(-6).toUpperCase()}`;
                        
                        // Valid for 120 days from date of issue
                        const expiryDate = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000);

                        try {
                            await prisma.marriageLicenseApplication.create({
                                data: {
                                    transactionId: id,
                                    registryNumber: generatedRegistryNumber,
                                    dateIssued: now,
                                    expiryDate: expiryDate,
                                    app1FullName,
                                    app1BirthDate,
                                    app1BirthPlace,
                                    app1Citizenship,
                                    app2FullName,
                                    app2BirthDate,
                                    app2BirthPlace,
                                    app2Citizenship,
                                    documentUrl: eCopyUrl || transaction.eCopyUrl || null,
                                    issuedBy: user.name || "System Administrator",
                                    verificationId: `VER-ML-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
                                }
                            });
                        } catch (createErr) {
                            console.error("Failed to create MarriageLicenseApplication record:", createErr);
                        }
                    } else if (ctcNumber || eCopyUrl) {
                        try {
                            await prisma.marriageLicenseApplication.update({
                                where: { id: mlExisting.id },
                                data: {
                                    ...(ctcNumber ? { registryNumber: ctcNumber.trim() } : {}),
                                    ...(eCopyUrl ? { documentUrl: eCopyUrl } : {})
                                }
                            });
                        } catch (updateErr) {
                            console.error("Failed to update MarriageLicenseApplication record:", updateErr);
                        }
                    }
                }
            }

        // Update transaction status, eCopyUrl, and orUrl if provided
        await prisma.transaction.update({
            where: { id },
            data: {
                status: targetStatus as any,
                ...(eCopyUrl ? { eCopyUrl } : {}),
                ...(orUrl ? { orUrl } : {})
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
        if (!user || (user.role !== "TREASURY_STAFF" && user.role !== "ADMIN" && user.role !== "ADMIN_AIDE")) {
            return { success: false, error: "Forbidden" };
        }

        const where: any = {
            type: { processorRole: "TREASURY_STAFF" }
        };

        if (user.role === "ADMIN_AIDE") {
            where.type = {
                processorRole: "TREASURY_STAFF",
                code: { startsWith: "BUSINESS_PERMIT" }
            };
            where.status = "FOR_INSPECTION";
        }

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
        }

        // TREASURY_STAFF should not see Business Permits in pre-screening status (FOR_INSPECTION)
        if (user.role === "TREASURY_STAFF") {
            where.NOT = {
                AND: [
                    { type: { code: { startsWith: "BUSINESS_PERMIT" } } },
                    { status: { in: ["FOR_INSPECTION"] } }
                ]
            };
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                user: true,
                type: true,
                cedula: true,
                businessPermit: true
            },
            orderBy: { createdAt: "desc" }
        });

        // Normalize transactions: if service is a marriage LCR type, expose an `eventDate` top-level
        const normalized = (transactions as any[]).map(tx => {
            try {
                const additional = tx.additionalData || {};
                const code = tx.type?.code || "";
                // Detect marriage services by transaction type code
                if (code.startsWith("LCR_") && code.includes("MARRIAGE")) {
                    // Support multiple possible field names coming from different forms
                    const eventDate = additional.dateOfMarriage || additional.eventDate || (additional.event && additional.event.date) || null;
                    return { ...tx, eventDate };
                }
                return tx;
            } catch {
                return tx;
            }
        });

        return { success: true, data: normalized as any[] };
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
        const session = await getSession();
        const user = session?.user as any;

        const where: any = {
            type: { processorRole: "TREASURY_STAFF" },
            status: { in: ["FOR_REQUESTING", "FOR_INSPECTION", "PAID", "FOR_CLAIM", "FOR_PROCESSING"] as any } // Needs evaluation or Needs release/claim/processing
        };

        if (user?.role === "ADMIN_AIDE") {
            where.type = {
                processorRole: "TREASURY_STAFF",
                code: { startsWith: "BUSINESS_PERMIT" }
            };
            where.status = "FOR_INSPECTION";
        }

        // TREASURY_STAFF should not count Business Permits in pre-screening status
        if (user?.role === "TREASURY_STAFF") {
            where.NOT = {
                AND: [
                    { type: { code: { startsWith: "BUSINESS_PERMIT" } } },
                    { status: { in: ["FOR_INSPECTION"] } }
                ]
            };
        }

        const count = await prisma.transaction.count({
            where
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
        if (!user || (user.role !== "TREASURY_STAFF" && user.role !== "ADMIN" && user.role !== "ADMIN_AIDE")) {
            return { success: false, error: "Forbidden", data: {} };
        }

        // Group by status for non-cancelled transactions
        const where: any = {
            type: { processorRole: "TREASURY_STAFF" },
            isCancelled: false
        };

        if (user.role === "ADMIN_AIDE") {
            where.type = {
                processorRole: "TREASURY_STAFF",
                code: { startsWith: "BUSINESS_PERMIT" }
            };
            where.status = "FOR_INSPECTION";
        }

        if (user.role === "TREASURY_STAFF") {
            where.NOT = {
                AND: [
                    { type: { code: { startsWith: "BUSINESS_PERMIT" } } },
                    { status: { in: ["FOR_INSPECTION"] } }
                ]
            };
        }

        const grouped = await prisma.transaction.groupBy({
            by: ["status"],
            where,
            _count: { _all: true }
        });

        // Count cancelled separately
        const cancelledWhere: any = {
            type: { processorRole: "TREASURY_STAFF" },
            isCancelled: true
        };

        if (user.role === "ADMIN_AIDE") {
            cancelledWhere.type = {
                processorRole: "TREASURY_STAFF",
                code: { startsWith: "BUSINESS_PERMIT" }
            };
            cancelledWhere.status = "FOR_INSPECTION";
        }

        if (user.role === "TREASURY_STAFF") {
            cancelledWhere.NOT = {
                AND: [
                    { type: { code: { startsWith: "BUSINESS_PERMIT" } } },
                    { status: { in: ["FOR_INSPECTION"] } }
                ]
            };
        }

        const cancelledCount = await prisma.transaction.count({
            where: cancelledWhere
        });

        const counts: Record<string, number> = {};
        for (const group of grouped) {
            counts[group.status] = group._count?._all ?? 0;
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
        if (!user || (user.role !== "TREASURY_STAFF" && user.role !== "ADMIN" && user.role !== "ADMIN_AIDE" && user.role !== "ENGINEER")) {
            return { success: false, error: "Forbidden" };
        }

        // 1. Fetch transaction with user and type details to check rejection history and type checks
        const tx = await prisma.transaction.findUnique({
            where: { id },
            include: { user: true, type: true }
        });

        if (!tx) return { success: false, error: "Transaction inaccessible" };

        const isBusinessPermit = tx.type.code.startsWith("BUSINESS_PERMIT");

        if (isBusinessPermit && user.role === "ADMIN_AIDE" && tx.status !== "FOR_INSPECTION") {
            return { success: false, error: "Forbidden: Admin Aides can only process Business Permits in the inspection phase." };
        }

        // TREASURY_STAFF cannot pre-screen or evaluate Business Permits that are in pre-screening states
        if (isBusinessPermit && user.role === "TREASURY_STAFF" && ["FOR_INSPECTION"].includes(tx.status)) {
            return { success: false, error: "Forbidden: Pre-screening and evaluation must be handled by an Admin Aide first." };
        }

        // 2. Update transaction status to REJECTED
        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                status: "REJECTED",
                rejectionRemarks: remarks,
                processedBy: user.id
            }
        });

        // 3. Anti-Spam Protocol: Increment rejectionCount based on per-category limits for citizen accounts
        if (tx.userId && tx.user?.role === "USER") {
            // Count all rejected transactions for this user
            const rejectedTransactions = await prisma.transaction.findMany({
                where: {
                    userId: tx.userId,
                    status: "REJECTED"
                },
                include: {
                    type: true
                }
            });

            // Group and find the maximum rejection count in any single category
            const categoryCounts: Record<string, number> = {};
            for (const rTx of rejectedTransactions) {
                const category = rTx.type.category || "General";
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }

            const maxCategoryRejections = Math.max(0, ...Object.values(categoryCounts));

            const updatedUser = await prisma.user.update({
                where: { id: tx.userId },
                data: { rejectionCount: maxCategoryRejections } as any
            }) as any;

            // Check if deactivation threshold reached (3 rejections in any single category)
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
 * Send a transaction back to the resident for revision
 */
export async function sendForRevision(id: string, remarks: string) {
    try {
        const session = await getSession();
        const user = session?.user as any;
        if (!user || (user.role !== "TREASURY_STAFF" && user.role !== "ADMIN" && user.role !== "ADMIN_AIDE" && user.role !== "ENGINEER")) {
            return { success: false, error: "Forbidden" };
        }

        const tx = await prisma.transaction.findUnique({
            where: { id },
            include: { user: true, type: true }
        });

        if (!tx) return { success: false, error: "Transaction inaccessible" };

        const isBusinessPermit = tx.type.code.startsWith("BUSINESS_PERMIT");
        if (isBusinessPermit && user.role === "ADMIN_AIDE" && tx.status !== "FOR_INSPECTION") {
            return { success: false, error: "Forbidden: Admin Aides can only process Business Permits in the evaluation phase." };
        }

        const nextRevisionCount = (tx.revisionCount || 0) + 1;

        if (nextRevisionCount >= 3) {
            // 🚨 AUTOMATIC DECLINE / REJECTION!
            const autoRemarks = `${remarks} (System: Automatically declined due to reaching the maximum limit of 3 revision requests.)`;
            const transaction = await prisma.transaction.update({
                where: { id },
                data: {
                    status: "REJECTED",
                    rejectionRemarks: autoRemarks,
                    processedBy: user.id,
                    revisionCount: nextRevisionCount
                }
            });

            // Anti-Spam Protocol: Increment rejectionCount based on per-category limits for citizen accounts
            if (tx.userId && tx.user?.role === "USER") {
                const rejectedTransactions = await prisma.transaction.findMany({
                    where: {
                        userId: tx.userId,
                        status: "REJECTED"
                    },
                    include: {
                        type: true
                    }
                });

                const categoryCounts: Record<string, number> = {};
                for (const rTx of rejectedTransactions) {
                    const category = rTx.type.category || "General";
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                }

                const maxCategoryRejections = Math.max(0, ...Object.values(categoryCounts));

                const updatedUser = await prisma.user.update({
                    where: { id: tx.userId },
                    data: { rejectionCount: maxCategoryRejections } as any
                }) as any;

                // Check if deactivation threshold reached (3 rejections in any single category)
                if (updatedUser.rejectionCount >= 3) {
                    await prisma.user.update({
                        where: { id: tx.userId },
                        data: { isEmailVerified: false }
                    });

                    if (updatedUser.email) {
                        await sendEmail({
                            type: "DEACTIVATED",
                            to: updatedUser.email,
                            name: updatedUser.name || "Resident",
                        });
                    }
                } else {
                    if (updatedUser.email) {
                        const resident = tx.residentSnapshot as any;
                        await sendEmail({
                            type: "REJECTED",
                            to: updatedUser.email,
                            name: resident?.firstName || updatedUser.name || "Resident",
                            remarks: autoRemarks
                        });
                    }
                }
            }

            revalidatePath("/admin/treasury");
            revalidatePath("/user/services");
            return { success: true, data: transaction, isAutoRejected: true };
        } else {
            // Standard Revision Request
            const transaction = await prisma.transaction.update({
                where: { id },
                data: {
                    status: "FOR_REVISION" as any,
                    rejectionRemarks: remarks,
                    processedBy: user.id,
                    revisionCount: nextRevisionCount
                }
            });

            if (tx.userId && tx.user?.role === "USER" && tx.user?.email) {
                const resident = tx.residentSnapshot as any;
                await sendEmail({
                    type: "FOR_REVISION" as any,
                    to: tx.user.email,
                    name: resident?.firstName || tx.user.name || "Resident",
                    remarks: remarks,
                    transactionId: tx.id
                });
            }

            revalidatePath("/admin/treasury");
            revalidatePath("/user/services");
            return { success: true, data: transaction, isAutoRejected: false };
        }
    } catch (error) {
        console.error("Send for revision error:", error);
        return { success: false, error: "Failed to request revision" };
    }
}

/**
 * Resubmit a transaction after revision (Resident side)
 */
export async function resubmitTransaction(id: string, formData: FormData) {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const tx = await prisma.transaction.findUnique({
            where: { id, userId: session.user.id },
            include: { type: true }
        });

        if (!tx || tx.status !== "FOR_REVISION") {
            return { success: false, error: "Invalid transaction for resubmission" };
        }

        const additionalData = tx.additionalData as any || {};
        const isBusinessPermit = tx.typeId?.includes("BUSINESS_PERMIT") || tx.type?.code?.startsWith("BUSINESS_PERMIT");
        const isCedula = tx.typeId?.includes("CEDULA") || tx.type?.code?.startsWith("CEDULA");

        // Helper to process optional re-uploaded files
        const processReupload = async (key: string, folder: string) => {
            const file = formData.get(key) as File;
            if (file && file.size > 0 && file.name !== "undefined") {
                return await processFileUpload(file, folder);
            }
            return additionalData[key]; // keep existing
        };

        // Parse optional resident snapshot updates if provided (e.g. from the interactive revision wizards)
        const residentSnapshotStr = formData.get("residentSnapshot") as string;
        let residentSnapshot = tx.residentSnapshot;
        if (residentSnapshotStr) {
            try {
                residentSnapshot = JSON.parse(residentSnapshotStr);
            } catch (e) {
                console.error("Failed to parse resident snapshot during resubmit:", e);
            }
        }

        if (isBusinessPermit) {
            additionalData.ctcUrl = await processReupload("ctcFile", "bp_ctc") || additionalData.ctcUrl;
            additionalData.dtiSecUrl = await processReupload("dtiSecFile", "bp_dti") || additionalData.dtiSecUrl;
            additionalData.brgyClearanceUrl = await processReupload("brgyClearanceFile", "bp_brgy") || additionalData.brgyClearanceUrl;
            additionalData.ownerIdUrl = await processReupload("ownerIdFile", "bp_owner_id") || additionalData.ownerIdUrl;
            additionalData.locationPhotoUrl = await processReupload("locationPhotoFile", "bp_location") || additionalData.locationPhotoUrl;
            additionalData.sanitaryPermitUrl = await processReupload("sanitaryPermitFile", "bp_sanitary") || additionalData.sanitaryPermitUrl;
            additionalData.fireSafetyUrl = await processReupload("fireSafetyFile", "bp_fire") || additionalData.fireSafetyUrl;
            additionalData.birCorUrl = await processReupload("birCorFile", "bp_bir") || additionalData.birCorUrl;

            // Also update text fields if provided
            const fields = ["businessName", "orgType", "lineOfBusiness", "barangay", "capitalInvestment", "grossSales", "employeeCount", "businessArea"];
            for (const f of fields) {
                if (formData.has(f)) {
                    const val = formData.get(f) as string;
                    if (val) additionalData[f] = isNaN(Number(val)) ? val : Number(val);
                }
            }
        } else if (isCedula) {
            // Cedula-specific uploads and data updates
            additionalData.validIdUrl = await processReupload("idFile", "ids") || additionalData.validIdUrl;
            additionalData.proofOfIncomeUrl = await processReupload("proofFile", "proofs") || additionalData.proofOfIncomeUrl;

            // Update Cedula specific text fields
            const fields = ["applicantType", "income", "propertyValue", "businessName"];
            for (const f of fields) {
                if (formData.has(f)) {
                    const val = formData.get(f) as string;
                    if (val) {
                        const cleanVal = val.replace(/,/g, ""); // Strip out commas from gross income if any
                        additionalData[f] = isNaN(Number(cleanVal)) ? cleanVal : Number(cleanVal);
                    }
                }
            }
        } else {
            // General basic/civil registry
            additionalData.validIdUrl = await processReupload("idFile", "ids") || additionalData.validIdUrl;
            additionalData.proofOfIncomeUrl = await processReupload("proofFile", "proofs") || additionalData.proofOfIncomeUrl;
        }

        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                additionalData: additionalData,
                residentSnapshot: residentSnapshot as any,
                status: "FOR_REQUESTING",
                rejectionRemarks: null
            }
        });

        revalidatePath("/user/services");
        revalidatePath("/user/services/requests");
        return { success: true, data: transaction };
    } catch (error) {
        console.error("Resubmit transaction error:", error);
        return { success: false, error: "Failed to resubmit request" };
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
            newStatus = (tx.status as any) === "RETURN_REQUESTED" ? "FOR_PICKING" : "REFUNDED";
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

export async function getLatestSuccessfulBusinessPermit() {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const transaction = await prisma.transaction.findFirst({
            where: {
                userId: session.user.id,
                status: {
                    in: ["DELIVERED", "RELEASED"]
                },
                type: {
                    code: {
                        in: ["BUSINESS_PERMIT_NEW", "BUSINESS_PERMIT_RENEW"]
                    }
                }
            },
            include: {
                type: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        if (!transaction) {
            return { success: true, data: null };
        }

        return { success: true, data: transaction };
    } catch (error: any) {
        console.error("Get latest successful permit error:", error);
        return { success: false, error: error.message };
    }
}

export async function getAllSuccessfulBusinessPermits() {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: session.user.id,
                status: {
                    in: ["DELIVERED", "RELEASED"]
                },
                type: {
                    code: {
                        in: ["BUSINESS_PERMIT_NEW", "BUSINESS_PERMIT_RENEW"]
                    }
                }
            },
            include: {
                type: true,
                businessPermit: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return { success: true, data: transactions };
    } catch (error: any) {
        console.error("Get all successful permits error:", error);
        return { success: false, error: error.message };
    }
}


/**
 * Fetch all Building Permit transactions for Engineer Hub
 */
export async function getEngineerTransactions(status?: string) {
    try {
        const session = await getSession();
        const user = session?.user as any;
        if (!user || (user.role !== "ENGINEER" && user.role !== "ADMIN")) {
            return { success: false, error: "Forbidden" };
        }

        const where: any = {
            type: { code: { startsWith: "BUILDING_PERMIT" } }
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
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                user: true,
                type: true,
                buildingPermit: true
            },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, data: transactions as any[] };
    } catch (error) {
        console.error("Fetch engineer transactions error:", error);
        return { success: false, error: "Failed to fetch transactions" };
    }
}

/**
 * Get count of pending building permit transactions for Engineer
 */
export async function getEngineerPendingCount() {
    try {

        const count = await prisma.transaction.count({
            where: {
                type: { code: { startsWith: "BUILDING_PERMIT" } },
                status: { in: ["FOR_REQUESTING", "PAID", "FOR_CLAIM", "FOR_PROCESSING"] as any }
            }
        });
        return { success: true, count };
    } catch (error) {
        console.error("Fetch engineer pending count error:", error);
        return { success: false, count: 0 };
    }
}

/**
 * Fetch counts per status for Engineer Hub building permit transactions (for tab badges)
 */
export async function getEngineerStatusCounts() {
    try {
        const session = await getSession();
        const user = session?.user as any;
        if (!user || (user.role !== "ENGINEER" && user.role !== "ADMIN")) {
            return { success: false, error: "Forbidden", data: {} };
        }

        const where: any = {
            type: { code: { startsWith: "BUILDING_PERMIT" } },
            isCancelled: false
        };

        const grouped = await prisma.transaction.groupBy({
            by: ["status"],
            where,
            _count: { _all: true }
        });

        const cancelledCount = await prisma.transaction.count({
            where: {
                type: { code: { startsWith: "BUILDING_PERMIT" } },
                isCancelled: true
            }
        });

        const counts: Record<string, number> = {};
        for (const group of grouped) {
            counts[group.status] = group._count?._all ?? 0;
        }
        counts["CANCELLED"] = cancelledCount;

        return { success: true, data: counts };
    } catch (error) {
        console.error("Fetch engineer status counts error:", error);
        return { success: false, error: "Failed to fetch counts", data: {} };
    }
}
