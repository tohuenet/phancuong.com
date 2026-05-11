import type { NextAuthConfig, Session } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Single source of truth for "is this session an admin?".
 * The check itself lives in `session()` callback below — this helper
 * is just a typed reader so call sites don't need to know the rule.
 * Type predicate so a passing check narrows `session` to non-null.
 */
export function isAdmin(session: Session | null | undefined): session is Session {
  return session?.user?.isAdmin === true;
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn() {
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = session.user.email === process.env.ALLOWED_EMAIL;
        if (token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    error: '/unauthorized',
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
};
