import { redirect } from "next/navigation";
import { getUserResidentProfile } from "../actions";
import prisma from "@/lib/db/prisma";
import { ServiceRequestFormView } from "./ServiceRequestFormView";

export default async function ServiceRequestPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const profile = await getUserResidentProfile();
    
    if (!profile) {
        redirect("/user/leadership");
    }

    const service = await (prisma as any).brgyService.findUnique({
        where: { id },
        include: {
            // Include anything needed
        }
    });

    if (!service || !service.isPublished || service.barangay !== profile.barangay) {
        redirect("/user/services");
    }

    return (
        <ServiceRequestFormView 
            service={service}
            profile={profile}
        />
    );
}
