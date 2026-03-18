import { AuthLayout } from "@/components/shared/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import prisma from "@/lib/db/prisma";

export default async function LoginPage() {
    const branding = await prisma.loginBranding.findFirst({
        where: { isActive: true }
    });

    const bgImage = branding?.bgImage || "/images/umbrella-rocks.png";
    const bgColor = branding?.bgColor || "#ffffff";
    const quote = branding?.motto || "Agno's Umbrella Rocks represent the timeless beauty of our coastal heritage. A true marvel of nature.";
    const author = branding?.mottoAuthor || "LOCAL TOURISM OFFICE";

    return (
        <AuthLayout
            imageSrc={bgImage}
            bgColor={bgColor}
            quote={quote}
            author={author}
        >
            <LoginForm />
        </AuthLayout>
    );
}
