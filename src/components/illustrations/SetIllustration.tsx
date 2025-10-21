/**
 * Dice set illustration for empty states
 * Shows multiple dice in a grid layout
 */

export function SetIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Dice set illustration"
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
        strokeWidth={1.5}
        className="text-primary-300 dark:text-primary-700"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
        strokeWidth={1.5}
        className="text-accent-300 dark:text-accent-700"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
        strokeWidth={1.5}
        className="text-success-300 dark:text-success-700"
      />
      <circle cx="6.5" cy="6.5" r="1" fill="currentColor" className="text-primary-400 dark:text-primary-600" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" className="text-accent-400 dark:text-accent-600" />
      <circle cx="6.5" cy="17.5" r="1" fill="currentColor" className="text-success-400 dark:text-success-600" />
    </svg>
  );
}
