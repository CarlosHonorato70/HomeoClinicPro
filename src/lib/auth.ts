import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        clinicName: { label: "Nome da Clínica", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Email não cadastrado. Crie uma conta primeiro.");
        }

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) {
          throw new Error("Senha incorreta");
        }

        if (!user.emailVerified) {
          throw new Error(
            "Email não verificado. Verifique sua caixa de entrada."
          );
        }

        return {
          id: user.id,
          clinicId: user.clinicId,
          role: user.role,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.clinicId = user.clinicId;
        token.role = user.role;
      }
      // Refresh subscription status from DB
      if (token.clinicId) {
        try {
          const clinic = await prisma.clinic.findUnique({
            where: { id: token.clinicId as string },
            select: { subscriptionStatus: true, trialEndsAt: true, cnpj: true },
          });
          let status = clinic?.subscriptionStatus ?? "trialing";
          // Auto-expire trials
          if (
            status === "trialing" &&
            clinic?.trialEndsAt &&
            new Date(clinic.trialEndsAt) < new Date()
          ) {
            status = "canceled";
            // Update DB (fire-and-forget)
            prisma.clinic
              .update({
                where: { id: token.clinicId as string },
                data: { subscriptionStatus: "canceled" },
              })
              .catch(() => {});
          }
          token.subscriptionStatus = status;
          token.needsOnboarding = !clinic?.cnpj;
        } catch {
          token.subscriptionStatus = token.subscriptionStatus ?? "trialing";
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.clinicId = token.clinicId;
      session.user.role = token.role;
      session.user.subscriptionStatus = token.subscriptionStatus ?? "trialing";
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
