/**
 * Edit illustration for empty states
 * Shows a document with a pen/pencil
 */

export function EditIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Edit illustration"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        className="text-neutral-300 dark:text-neutral-600"
      />
    </svg>
  );
}
