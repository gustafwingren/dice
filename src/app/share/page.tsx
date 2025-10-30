'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Die, DiceSet } from '@/types';
import { decodeDie, decodeDiceSet } from '@/lib/encoding';
import { useDiceStorage } from '@/hooks/useDiceStorage';
import { useRollDice } from '@/hooks/useRollDice';
import { Button } from '@/components/ui/Button';
import { RollAnimation } from '@/components/dice/RollAnimation';
import { RollResult } from '@/components/dice/RollResult';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Banner } from '@/components/ui/Banner';
import { Card, CardHeader } from '@/components/ui/Card';

export default function SharePage() {
  const router = useRouter();
  const { saveDie, saveDiceSet } = useDiceStorage();
  const { rollState, rollResult, roll, rollSet, reset: resetRoll, isRolling } = useRollDice();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [die, setDie] = useState<Die | null>(null);
  const [diceSet, setDiceSet] = useState<{ set: DiceSet; dice: Die[] } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Read encoded data from URL hash (e.g., /share#encodedData)
    const hash = window.location.hash;
    const encoded = hash.substring(1); // Remove the # character
    
    if (!encoded) {
      setError('No share data provided');
      setLoading(false);
      return;
    }

    try {
      // Try decoding as a die first
      try {
        const decodedDie = decodeDie(encoded);
        setDie(decodedDie);
        setLoading(false);
        return;
      } catch {
        // If die decoding fails, try as a dice set
        const decoded = decodeDiceSet(encoded);
        setDiceSet({ set: decoded.diceSet, dice: decoded.dice });
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode shared data');
      setLoading(false);
    }
  }, []);

  const handleSaveDie = async () => {
    if (!die) return;
    
    try {
      await saveDie(die);
      setSaveSuccess(true);
      showToast(`Die "${die.name}" saved to your library!`, 'success');
      setTimeout(() => {
        router.push('/library');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save die');
      showToast('Failed to save die. Please try again.', 'error');
    }
  };

  const handleSaveDiceSet = async () => {
    if (!diceSet) return;
    
    try {
      // Save all dice first
      for (const dieToSave of diceSet.dice) {
        await saveDie(dieToSave);
      }
      
      // Then save the set
      await saveDiceSet(diceSet.set);
      setSaveSuccess(true);
      showToast(`Dice set "${diceSet.set.name}" saved to your library!`, 'success');
      setTimeout(() => {
        router.push('/library');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save dice set');
      showToast('Failed to save dice set. Please try again.', 'error');
    }
  };

  const handleRoll = () => {
    if (die && !isRolling) {
      resetRoll();
      roll(die);
    }
  };

  const handleRollSet = () => {
    if (diceSet && !isRolling) {
      resetRoll();
      rollSet(diceSet.dice);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="w-1/3 h-8" />
            <Card padding="lg" className="space-y-6">
              <Skeleton className="w-full h-48" />
              <div className="flex gap-3 justify-center">
                <Skeleton variant="button" className="w-32" />
                <Skeleton variant="button" className="w-32" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-danger-50 to-white dark:from-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="max-w-md w-full">
          <Card padding="lg" className="text-center">
            <div className="text-danger-500 dark:text-danger-400 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
              Unable to Load
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} variant="primary" className="w-full">
              Create Your Own Die
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Simplified die view - focused on "try and copy" experience
  if (die) {
    return (
      <div className="min-h-screen bg-linear-to-b from-primary-50 to-white dark:from-neutral-900 dark:to-neutral-950 py-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card padding="none" className="overflow-hidden">
            {/* Header */}
            <CardHeader variant="primary">
              <h1 className="text-3xl font-bold mb-2">{die.name}</h1>
              <p className="text-primary-100 dark:text-primary-200">
                {die.sides} sides • {die.contentType}
              </p>
            </CardHeader>

            {/* Main content - Roll area */}
            <div className="p-8">
              {rollState === 'rolling' && (
                <div className="mb-8">
                  <RollAnimation isRolling={true} />
                </div>
              )}

              {rollState === 'complete' && rollResult && (
                <div className="mb-8">
                  <RollResult result={rollResult} die={die} />
                </div>
              )}

              {rollState === 'idle' && (
                <div className="mb-8 text-center py-12">
                  <div 
                    className="inline-flex items-center justify-center w-32 h-32 rounded-2xl shadow-lg mb-4"
                    style={{ 
                      backgroundColor: die.backgroundColor,
                      color: die.textColor 
                    }}
                  >
                    <span className="text-4xl font-bold">🎲</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                    Try rolling this die!
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-3">
                {rollState !== 'complete' ? (
                  <Button
                    onClick={handleRoll}
                    variant="primary"
                    disabled={isRolling}
                    className="w-full text-lg py-4"
                  >
                    {isRolling ? 'Rolling...' : '🎲 Roll Die'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleRoll}
                    variant="primary"
                    className="w-full text-lg py-4"
                  >
                    🎲 Roll Again
                  </Button>
                )}

                {saveSuccess ? (
                  <Banner variant="success" className="text-center">
                    <p className="font-semibold text-lg">
                      ✓ Saved! Redirecting...
                    </p>
                  </Banner>
                ) : (
                  <Button
                    onClick={handleSaveDie}
                    variant="secondary"
                    className="w-full text-lg py-4"
                  >
                    💾 Save a Copy
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Back link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              ← Create Your Own Die
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Simplified dice set view
  if (diceSet) {
    return (
      <div className="min-h-screen bg-linear-to-b from-primary-50 to-white dark:from-neutral-900 dark:to-neutral-950 py-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card padding="none" className="overflow-hidden">
            {/* Header */}
            <CardHeader variant="primary">
              <h1 className="text-3xl font-bold mb-2">{diceSet.set.name}</h1>
              <p className="text-primary-100 dark:text-primary-200">
                {diceSet.dice.length} dice set
              </p>
            </CardHeader>

            {/* Main content - Roll area */}
            <div className="p-8">
              {rollState === 'rolling' && (
                <div className="mb-8">
                  <RollAnimation isRolling={true} />
                </div>
              )}

              {rollState === 'complete' && rollResult && (
                <div className="mb-8">
                  <RollResult result={rollResult} dice={diceSet.dice} />
                </div>
              )}

              {rollState === 'idle' && (
                <div className="mb-8">
                  <div className="text-center py-8 mb-6">
                    <div className="flex justify-center gap-2 mb-4">
                      {diceSet.dice.slice(0, 3).map((_, index) => (
                        <div
                          key={index}
                          className="w-16 h-16 rounded-lg shadow-lg bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center"
                        >
                          <span className="text-2xl">🎲</span>
                        </div>
                      ))}
                      {diceSet.dice.length > 3 && (
                        <div className="w-16 h-16 rounded-lg shadow-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                          <span className="text-neutral-600 dark:text-neutral-300 font-bold">+{diceSet.dice.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                      Try rolling this dice set!
                    </p>
                  </div>

                  {/* Dice list */}
                  <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4 mb-6">
                    <h2 className="font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Dice in this set:</h2>
                    <ul className="space-y-2">
                      {diceSet.dice.map((d, index) => (
                        <li key={d.id} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="font-medium">{index + 1}.</span>
                          <span>{d.name}</span>
                          <span className="text-neutral-400 dark:text-neutral-500">•</span>
                          <span>{d.sides} sides</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-3">
                {rollState !== 'complete' ? (
                  <Button
                    onClick={handleRollSet}
                    variant="primary"
                    disabled={isRolling}
                    className="w-full text-lg py-4"
                  >
                    {isRolling ? 'Rolling...' : '🎲 Roll All Dice'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleRollSet}
                    variant="primary"
                    className="w-full text-lg py-4"
                  >
                    🎲 Roll Again
                  </Button>
                )}

                {saveSuccess ? (
                  <Banner variant="success" className="text-center">
                    <p className="font-semibold text-lg">
                      ✓ Saved! Redirecting...
                    </p>
                  </Banner>
                ) : (
                  <Button
                    onClick={handleSaveDiceSet}
                    variant="secondary"
                    className="w-full text-lg py-4"
                  >
                    💾 Save a Copy
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Back link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              ← Create Your Own
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
