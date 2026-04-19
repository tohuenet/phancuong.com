import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions, DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession["user"]
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Allow all Google users to sign in for commenting
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        // Since we don't have a DB user, we just use the token/google data
        // and mark it as admin if the email matches.
        (session.user as any).isAdmin = session.user.email === process.env.ALLOWED_EMAIL;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    error: '/unauthorized', 
  },
  session: {
    strategy: "jwt"
  }
};
