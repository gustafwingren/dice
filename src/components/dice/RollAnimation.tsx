'use client';

import { useEffect, useState } from 'react';

export interface RollAnimationProps {
  /** Whether the animation is currently running */
  isRolling: boolean;
  
  /** Optional className for styling */
  className?: string;
}

/**
 * Roll animation component using GPU-accelerated CSS transforms
 * Shows a spinning cube animation while dice are being rolled
 */
export function RollAnimation({ isRolling, className = '' }: RollAnimationProps) {
  const [show, setShow] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  
  useEffect(() => {
    if (isRolling) {
      setShow(true);
      setAnnouncement('Rolling...');
    } else {
      // Keep showing briefly after rolling stops for smooth transition
      const timeout = setTimeout(() => {
        setShow(false);
        setAnnouncement('');
      }, 300);
      return () => clearTimeout(timeout);
    }
    return undefined; // Return undefined when no cleanup needed
  }, [isRolling]);
  
  if (!show) return null;
  
  return (
    <div 
      className={`flex items-center justify-center py-12 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={announcement}
    >
      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <div className="relative w-24 h-24">
        {/* Spinning dice cube */}
        <div 
          className={`
            absolute inset-0 
            border-4 border-primary-600 rounded-lg
            ${isRolling ? 'animate-spin-cube' : 'opacity-0'}
            transition-opacity duration-300
          `}
          style={{
            transformStyle: 'preserve-3d',
            animation: isRolling ? 'spinCube 1.5s linear infinite' : 'none',
          }}
        >
          {/* Dice dots simulation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-primary-600 rounded-full" />
          </div>
        </div>
        
        {/* Secondary spinning element for visual interest */}
        <div 
          className={`
            absolute inset-2 
            border-2 border-primary-400 rounded
            ${isRolling ? 'animate-spin-reverse' : 'opacity-0'}
            transition-opacity duration-300
          `}
          style={{
            animation: isRolling ? 'spinReverse 1.2s linear infinite' : 'none',
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes spinCube {
          0% {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          33% {
            transform: rotateX(360deg) rotateY(0deg) rotateZ(0deg);
          }
          66% {
            transform: rotateX(360deg) rotateY(360deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
          }
        }
        
        @keyframes spinReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
