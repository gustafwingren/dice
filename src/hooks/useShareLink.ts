'use client';

import { useState } from 'react';
import { Die, DiceSet } from '@/types';
import { encodeDie, encodeDiceSet, isUrlTooLong } from '@/lib/encoding';

interface ShareLinkResult {
  url: string;
  encoded: string;
  urlLength: number;
  isTooLong: boolean;
}

export function useShareLink() {
  const [error, setError] = useState<string | null>(null);

  const generateDieLink = (die: Die): ShareLinkResult | null => {
    try {
      setError(null);
      const encoded = encodeDie(die);
      const baseUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/share`
        : '/share';
      const url = `${baseUrl}#${encoded}`;
      const urlLength = url.length;
      const isTooLong = isUrlTooLong(encoded, baseUrl);

      return { url, encoded, urlLength, isTooLong };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate share link';
      setError(message);
      return null;
    }
  };

  const generateSetLink = (diceSet: DiceSet, dice: Die[]): ShareLinkResult | null => {
    try {
      setError(null);
      const encoded = encodeDiceSet(diceSet, dice);
      const baseUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/share`
        : '/share';
      const url = `${baseUrl}#${encoded}`;
      const urlLength = url.length;
      const isTooLong = isUrlTooLong(encoded, baseUrl);

      return { url, encoded, urlLength, isTooLong };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate share link';
      setError(message);
      return null;
    }
  };

  return {
    generateDieLink,
    generateSetLink,
    error
  };
}
