'use client';

import { LazyMotion, domAnimation } from 'framer-motion';

// Loads framer-motion's DOM animation feature bundle lazily. Paired with
// `m.*` components (instead of `motion.*`), this cuts the eager framer-motion
// payload from ~40KB to ~6KB — features stream in when first needed.
export default function LazyMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
