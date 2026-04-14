import { Input } from "@/components/ui/input";

 
export function FamilyBackgroundSection({ data }: { data?: any }) {

    return (
        <div className="space-y-8">
            {/* Parents Section */}
            <div className="space-y-4">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-widest border-l-4 border-blue-500 pl-3">Mother&apos;s Maiden Name</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input name="motherFirstName" defaultValue={data?.motherFirstName} placeholder="First Name" />
                    <Input name="motherMiddleName" defaultValue={data?.motherMiddleName} placeholder="Middle Name" />
                    <Input name="motherLastName" defaultValue={data?.motherLastName} placeholder="Last Name" />
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-widest border-l-4 border-blue-500 pl-3">Father&apos;s Name</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input name="fatherFirstName" defaultValue={data?.fatherFirstName} placeholder="First Name" />
                    <Input name="fatherMiddleName" defaultValue={data?.fatherMiddleName} placeholder="Middle Name" />
                    <Input name="fatherLastName" defaultValue={data?.fatherLastName} placeholder="Last Name" />
                </div>
            </div>

        </div>
    );
}
