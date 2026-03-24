import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Please enter an email and password");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    throw new Error("No user found with this email");
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    throw new Error("Invalid password");
                }

                // Block login if user is not verified (but allow ADMIN)
                if (user.role === "USER" && !user.isEmailVerified) {
                    throw new Error("Your account has not been approved yet. Please wait for an administrator to process your registration.");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isPasswordChanged: user.isPasswordChanged,
                    managedBarangay: user.managedBarangay,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.role = (user as any).role;
                token.id = user.id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.isPasswordChanged = (user as any).isPasswordChanged;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.managedBarangay = (user as any).managedBarangay;
            }

            // Sync Database dynamically with Session to Auto-Logout rejected/pending users!
            if (token.id && token.role === "USER") {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { isEmailVerified: true }
                });

                if (!dbUser || !dbUser.isEmailVerified) {
                    // Force the session to expire immediately (triggering auto-logout)
                    token.exp = 0; 
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).role = token.role;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).id = token.id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).isPasswordChanged = token.isPasswordChanged;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).managedBarangay = token.managedBarangay;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
