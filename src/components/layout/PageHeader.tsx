/**
 * PageHeader component - consistent page header for editor and library pages
 * Provides title and optional subtitle/description
 */

interface PageHeaderProps {
  /** Main page title */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Additional CSS classes */
  className?: string;
}

export function PageHeader({ title, subtitle, className = '' }: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
