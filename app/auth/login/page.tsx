import { AuthLayout } from "@/components/shared/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import prisma from "@/lib/db/prisma";

export default async function LoginPage() {
    const slides = await prisma.heroSlide.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
    });

    const settingsList = await prisma.systemSetting.findMany();
    const settings = settingsList.reduce((acc: any, curr: { key: string; value: string }) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    return (
        <AuthLayout 
            slides={slides}
            logoSrc={settings.site_logo}
            brandWord1={settings.brand_word_1}
            brandWord2={settings.brand_word_2}
            themeColor={settings.theme_color}
        >
            <LoginForm themeColor={settings.theme_color} />
        </AuthLayout>
    );
}
