'use client';

import { useClipboard } from '@/hooks/useClipboard';
import { Button } from '@/components/ui/Button';

interface ShareContentProps {
  url: string;
  urlLength: number;
  isTooLong: boolean;
}

export function ShareContent({ url, urlLength, isTooLong }: ShareContentProps) {
  const { copyToClipboard, copied, error } = useClipboard();

  const handleCopy = () => {
    copyToClipboard(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Shareable URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-neutral-50 dark:bg-neutral-700 text-sm dark:text-neutral-100"
          />
          <Button
            onClick={handleCopy}
            variant="primary"
            disabled={copied}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      <div className="text-sm text-neutral-600">
        <p>URL Length: {urlLength} characters</p>
        {isTooLong && (
          <p className="text-warning-600 font-medium mt-1">
            ⚠️ Warning: URL is longer than recommended (6000 chars). It may not work in all browsers.
          </p>
        )}
      </div>

      {error && (
        <div className="text-sm text-danger-600">
          Error: {error}
        </div>
      )}

      <div className="text-sm text-neutral-500">
        <p>Share this link with others to let them view and save a copy of your dice.</p>
      </div>
    </div>
  );
}
