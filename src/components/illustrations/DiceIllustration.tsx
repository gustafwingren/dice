/**
 * Dice illustration for empty states
 * Shows a 3D dice cube with dots
 */

export function DiceIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Dice illustration"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        className="text-primary-300 dark:text-primary-700"
      />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" className="text-primary-400 dark:text-primary-600" />
      <circle cx="9" cy="9" r="1" fill="currentColor" className="text-primary-400 dark:text-primary-600" />
      <circle cx="15" cy="15" r="1" fill="currentColor" className="text-primary-400 dark:text-primary-600" />
    </svg>
  );
}
