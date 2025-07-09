import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Workspace = dynamic(() => import('./workspace'), {
  ssr: false,
});

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div>Loading workspace...</div>}>
      <Workspace />
    </Suspense>
  );
}
