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
                    if ((user as any).rejectionCount >= 3) {
                        throw new Error("Your account has been deactivated due to multiple rejected requests. Please visit the Municipal Treasury Office for identity verification and account restoration.");
                    }
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
                 
                token.role = (user as any).role;
                token.id = user.id;
                 
                token.isPasswordChanged = (user as any).isPasswordChanged;
                 
                token.managedBarangay = (user as any).managedBarangay;
            }

            // Sync Database dynamically with Session to Auto-Logout rejected/pending users!
            if (token.id && token.role === "USER") {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { isEmailVerified: true, rejectionCount: true }
                });

                // If user is deactivated OR has hit the rejection limit, expire the session
                if (!dbUser || !dbUser.isEmailVerified || (dbUser as any).rejectionCount >= 3) {
                    // Force the session to expire immediately (triggering auto-logout)
                    token.exp = 1; // Set to very small number to trigger expiration
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                 
                (session.user as any).role = token.role;
                 
                (session.user as any).id = token.id;
                 
                (session.user as any).isPasswordChanged = token.isPasswordChanged;
                 
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
