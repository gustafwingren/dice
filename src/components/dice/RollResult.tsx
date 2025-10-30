'use client';

import { Face, Die } from '@/types';

export interface RollResultProps {
  /** The result of the roll (single face or array for sets) */
  result: Face | Face[] | null;
  
  /** The die that was rolled (for styling single die) */
  die?: Die;
  
  /** Array of dice for dice set results (must match order of result array) */
  dice?: Die[];
  
  /** Optional className for styling */
  className?: string;
}

/**
 * Display the result of a dice roll
 * Shows the face value with the die's styling (colors, content type)
 */
export function RollResult({ result, die, dice, className = '' }: RollResultProps) {
  if (!result) {
    return null;
  }
  
  // Handle array of results (dice set)
  if (Array.isArray(result)) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Roll Results:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {result.map((face, index) => (
            <SingleFaceResult
              key={`${face.id}-${index}`}
              face={face}
              die={dice?.[index]}
            />
          ))}
        </div>
      </div>
    );
  }
  
  // Handle single result
  return (
    <div className={className}>
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">You Rolled:</h3>
      <SingleFaceResult face={result} die={die} large />
    </div>
  );
}

interface SingleFaceResultProps {
  face: Face;
  die?: Die;
  large?: boolean;
}

function SingleFaceResult({ face, die, large = false }: SingleFaceResultProps) {
  const minSizeClass = large ? 'min-w-32 min-h-32' : 'min-w-20 min-h-20';
  const paddingClass = large ? 'p-4' : 'p-2';
  const backgroundColor = die?.backgroundColor || '#ffffff';
  const textColor = die?.textColor || '#000000';
  
  // Calculate responsive text size based on content length
  const getTextSizeClass = () => {
    const contentLength = String(face.value).length;
    if (large) {
      if (contentLength <= 3) return 'text-4xl';
      if (contentLength <= 10) return 'text-2xl';
      if (contentLength <= 20) return 'text-xl';
      return 'text-base';
    } else {
      if (contentLength <= 3) return 'text-2xl';
      if (contentLength <= 10) return 'text-lg';
      return 'text-sm';
    }
  };
  
  return (
    <div
      className={`
        ${minSizeClass}
        ${paddingClass}
        border-4 rounded-lg
        flex items-center justify-center
        font-bold
        shadow-lg
        animate-bounce-in
      `}
      style={{
        borderColor: backgroundColor,
        backgroundColor: face.contentType === 'color' ? face.color : backgroundColor,
        color: face.contentType === 'color' ? 'transparent' : textColor,
      }}
      role="status"
      aria-live="polite"
      aria-label={`Rolled ${face.contentType === 'color' ? 'color' : face.value}`}
    >
      {face.contentType !== 'color' && (
        <span className={`text-center wrap-break-word ${getTextSizeClass()}`}>
          {face.value}
        </span>
      )}
      
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
}
