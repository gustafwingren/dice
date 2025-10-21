'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { DieEditor } from '@/components/dice/DieEditor';
import { Die } from '@/types';
import { loadDice } from '@/lib/storage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function HomeContent() {
  const searchParams = useSearchParams();
  const [initialDie, setInitialDie] = useState<Die | undefined>(undefined);

  useEffect(() => {
    const loadDieFromUrl = async () => {
      const dieId = searchParams.get('id');
      if (dieId) {
        try {
          const dice = await loadDice();
          const die = dice.find(d => d.id === dieId);
          if (die) {
            // Load the die directly (keep original ID for updates)
            // When from a friend/import, they won't have the ID in storage yet
            setInitialDie(die);
          }
        } catch (error) {
          console.error('Failed to load die:', error);
        }
      }
    };

    loadDieFromUrl();
  }, [searchParams]);

  return (
    <PageLayout>
      <DieEditor initialDie={initialDie} />
    </PageLayout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <PageLayout>
        <LoadingSpinner />
      </PageLayout>
    }>
      <HomeContent />
    </Suspense>
  );
}
