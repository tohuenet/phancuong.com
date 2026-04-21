'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

// Hydrate SessionProvider from a server-resolved session so next-auth doesn't
// fire an extra `/api/auth/session` XHR on mount. `refetchInterval={0}` and
// `refetchOnWindowFocus={false}` keep the provider quiet unless a consumer
// explicitly triggers a refresh (e.g. after sign-in/out).
export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}
