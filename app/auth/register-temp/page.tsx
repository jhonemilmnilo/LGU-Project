import { hash } from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export default function TempRegisterPage() {
    async function registerUser(formData: FormData) {
        "use server";
        
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const role = formData.get("role") as UserRole;

        if (!name || !email || !password) {
            throw new Error("Missing fields");
        }

        const hashedPassword = await hash(password, 10);

        try {
            await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: role || "CONTENT_ADMIN",
                    isEmailVerified: true,
                    isPasswordChanged: true,
                },
            });
        } catch (error) {
            console.error(error);
            // Ignore error for simple temp page
        }

        redirect("/auth/login");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-center mb-6">Pansamantalang Register</h1>
                <p className="text-sm text-slate-500 mb-6 text-center">
                    Use this temporary page to easily create an admin/content admin account.
                </p>

                <form action={registerUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                        <input 
                            name="name" 
                            type="text" 
                            required 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none" 
                            defaultValue="Test Admin"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input 
                            name="email" 
                            type="email" 
                            required 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none" 
                            defaultValue="test@admin.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input 
                            name="password" 
                            type="password" 
                            required 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none" 
                            defaultValue="password123"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select name="role" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="CONTENT_ADMIN">Content Admin</option>
                            <option value="ADMIN">Main Admin</option>
                            <option value="USER">User (Resident)</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 mt-4"
                    >
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
}
