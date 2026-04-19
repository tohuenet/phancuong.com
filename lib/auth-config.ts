import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      return true;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.isAdmin = session.user.email === process.env.ALLOWED_EMAIL;
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
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
    strategy: "jwt"
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
} as any;

