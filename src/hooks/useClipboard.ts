'use client';

import { useState, useCallback } from 'react';

export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return true;
      }
      
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return true;
      } else {
        throw new Error('Failed to copy text');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to copy to clipboard';
      setError(message);
      return false;
    }
  }, []);

  return {
    copyToClipboard,
    copied,
    error
  };
}
