import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GENDERS, CIVIL_STATUSES } from "../../constants";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export function PersonalInfoSection({ data }: { data?: Record<string, any> }) {
    const [dob, setDob] = useState(data?.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : "");
    // const [isDead, setIsDead] = useState(data?.isDead || false); // Removed to fix lint warning

    const calculateAge = (birthDateStr: string) => {
        if (!birthDateStr) return "";
        const birth = new Date(birthDateStr);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age.toString();
    };

    const age = calculateAge(dob);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Last Name *</label>
                    <Input name="lastName" defaultValue={data?.lastName} placeholder="e.g. DELA CRUZ" required className="uppercase" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">First Name *</label>
                    <Input name="firstName" defaultValue={data?.firstName} placeholder="e.g. JUAN" required className="uppercase" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Middle Name</label>
                    <Input name="middleName" defaultValue={data?.middleName} placeholder="e.g. RAMOS" className="uppercase" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Suffix</label>
                    <Input name="suffix" defaultValue={data?.suffix} placeholder="e.g. JR, III" className="uppercase" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Gender *</label>
                    <Select name="gender" defaultValue={data?.gender || "Male"}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                            {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Date of Birth *</label>
                    <Input 
                        name="dateOfBirth" 
                        type="date" 
                        value={dob} 
                        onChange={(e) => setDob(e.target.value)} 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Age</label>
                    <Input name="age" type="number" value={age} readOnly className="bg-slate-50 cursor-not-allowed font-bold text-blue-600" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Civil Status *</label>
                    <Select name="civilStatus" defaultValue={data?.civilStatus || "Single"}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {CIVIL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Place of Birth</label>
                    <Input name="placeOfBirth" defaultValue={data?.placeOfBirth} placeholder="City/Municipality, Province" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Citizenship</label>
                    <Input name="citizenship" defaultValue={data?.citizenship || "Filipino"} placeholder="e.g. Filipino" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Religion</label>
                    <Input name="religion" defaultValue={data?.religion} placeholder="e.g. Catholic" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Blood Type</label>
                    <Input name="bloodType" defaultValue={data?.bloodType} placeholder="e.g. O+" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Height (cm)</label>
                    <Input name="height" type="number" defaultValue={data?.height} placeholder="e.g. 170" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Weight (kg)</label>
                    <Input name="weight" type="number" defaultValue={data?.weight} placeholder="e.g. 65" />
                </div>
            </div>
        </div>
    );
}
