import prisma from "@/lib/db/prisma";
import TyphoonAlertsClient from "./TyphoonAlertsClient";

export default async function TyphoonAlertsPage() {
    // We use (prisma as any) here just in case the generated types haven't
    // fully caught up in the IDE or dev server yet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const alertDelegate = (prisma as any).typhoonAlert;

    if (!alertDelegate) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600">
                    Database model &apos;TyphoonAlert&apos; not found. Please wait or restart the dev server.
                </div>
            </div>
        );
    }

    const alerts = await alertDelegate.findMany({
        orderBy: { createdAt: "desc" },
    });

    return <TyphoonAlertsClient initialData={alerts} />;
}
