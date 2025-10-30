'use client';

import { Suspense } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DiceSetEditor } from '@/components/dice/DiceSetEditor';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SetEditorPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <LoadingSpinner />
      </PageLayout>
    }>
      <PageLayout>
        <DiceSetEditor />
      </PageLayout>
    </Suspense>
  );
}
