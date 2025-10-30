'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '../ThemeToggle';

/**
 * Header component with navigation and mobile-responsive design
 */
export function Header() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
  const linkStyles = (active: boolean) => 
    `px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] inline-flex items-center ${
      active 
        ? 'bg-primary-600 text-white dark:bg-primary-500' 
        : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
    }`;
  
  return (
    <header className="bg-white shadow-sm dark:bg-neutral-900 dark:shadow-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              🎲 Dice Creator
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <nav className="flex space-x-2" aria-label="Main navigation">
              <Link 
                href="/" 
                className={linkStyles(isActive('/'))}
                aria-current={isActive('/') ? 'page' : undefined}
              >
                Create Die
              </Link>
              <Link 
                href="/set" 
                className={linkStyles(isActive('/set'))}
                aria-current={isActive('/set') ? 'page' : undefined}
              >
                Create Set
              </Link>
              <Link 
                href="/library" 
                className={linkStyles(isActive('/library'))}
                aria-current={isActive('/library') ? 'page' : undefined}
              >
                Library
              </Link>
            </nav>
            
            <div className="ml-4 pl-4 border-l border-neutral-200 dark:border-neutral-700">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
