import { AuthLayout } from "@/components/shared/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from "next/image";

export default function SignupPage() {
    return (
        <AuthLayout
            imageSrc="/images/agno-nature.png"
            quote="Preserving Nature, Empowering Citizens."
            description="Experience the beauty of Agno while enjoying seamless access to municipal registration, permits, and community resources."
            badges={
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden"
                            >
                                { }
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`https://i.pravatar.cc/100?u=${i}`}
                                    alt="User"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ))}
                        <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                            12k+
                        </div>
                    </div>
                    <span className="text-sm font-medium text-slate-300">
                        Join thousands of residents already on the platform
                    </span>
                </div>
            }
        >
            <SignupForm />
        </AuthLayout>
    );
}
