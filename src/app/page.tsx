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
  const dieId = searchParams.get('id');
  
  // Use the die ID (or 'create') as a key to force DieEditor remount on navigation
  // This ensures the form resets when switching between create and edit modes
  const editorKey = dieId || 'create';
  
  // Store the loaded die separately from the loading state
  const [loadedDie, setLoadedDie] = useState<Die | undefined>(undefined);
  const [loadedDieId, setLoadedDieId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine what to pass to DieEditor based on current URL and loaded state
  // If dieId changed, don't pass stale die data
  const initialDie = dieId === loadedDieId ? loadedDie : undefined;

  useEffect(() => {
    const loadDieFromUrl = async () => {
      if (dieId) {
        // Loading a specific die for editing
        setIsLoading(true);
        try {
          const dice = await loadDice();
          const die = dice.find(d => d.id === dieId);
          if (die) {
            // Load the die and track which ID we loaded
            setLoadedDie(die);
            setLoadedDieId(dieId);
          } else {
            // Die not found, reset to create mode
            setLoadedDie(undefined);
            setLoadedDieId(null);
          }
        } catch (error) {
          console.error('Failed to load die:', error);
          setLoadedDie(undefined);
          setLoadedDieId(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        // No ID parameter - creating a new die
        setLoadedDie(undefined);
        setLoadedDieId(null);
      }
    };

    loadDieFromUrl();
  }, [dieId]); // Depend on dieId directly instead of searchParams

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingSpinner />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <DieEditor key={editorKey} initialDie={initialDie} />
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
