'use client';

import dynamic from 'next/dynamic';

// Sonner ships ~5KB + its own motion lib. Toasts never appear on first
// paint, so defer the chunk to post-interactive.
const Toaster = dynamic(() => import('sonner').then((m) => m.Toaster), {
  ssr: false,
  loading: () => null,
});

export default function DeferredToaster() {
  return <Toaster position="top-right" expand={false} />;
}
