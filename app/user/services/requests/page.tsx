import { getUserRequests, getUserResidentProfile } from "../actions";
import { redirect } from "next/navigation";
import UserRequestsView from "./UserRequestsView";

export default async function UserRequestsPage() {
    const profile = await getUserResidentProfile();
    if (!profile) {
        redirect("/user/leadership");
    }

    const requests = await getUserRequests();

    return (
        <UserRequestsView requests={requests} profile={profile} />
    );
}
