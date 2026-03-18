import { AuthLayout } from "@/components/shared/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { getMultipleSystemSettings } from "@/lib/settings";

export default async function LoginPage() {
    const settings = await getMultipleSystemSettings([
        "login_bg_image",
        "login_bg_color", 
        "login_quote",
        "login_quote_author"
    ]);

    const bgImage = settings.get("login_bg_image") || "/images/umbrella-rocks.png";
    const bgColor = settings.get("login_bg_color") || "#ffffff";
    const quote = settings.get("login_quote") || "Agno's Umbrella Rocks represent the timeless beauty of our coastal heritage. A true marvel of nature.";
    const author = settings.get("login_quote_author") || "LOCAL TOURISM OFFICE";

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
