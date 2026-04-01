import { UserServicesView } from "./UserServicesView";
import { getUserResidentProfile, getAvailableServices, getUserRequests } from "./actions";
import { redirect } from "next/navigation";

export default async function UserServicesPage() {
    const profile = await getUserResidentProfile();
    
    if (!profile) {
        redirect("/user/leadership");
    }

    const services = await getAvailableServices(profile.barangay);

    return (
        <UserServicesView 
            profile={profile}
            initialServices={services}
        />
    );
}
