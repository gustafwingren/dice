'use client';

import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  
  /** Called when modal should close */
  onClose: () => void;
  
  /** Modal title */
  title: string;
  
  /** Modal content */
  children: ReactNode;
  
  /** Called when primary action is clicked */
  onConfirm?: () => void | Promise<void>;
  
  /** Primary button text */
  confirmText?: string;
  
  /** Cancel button text */
  cancelText?: string;
  
  /** Disable confirm button */
  confirmDisabled?: boolean;
}

/**
 * Modal component for dialogs and confirmations
 * 
 * Features:
 * - Accessible (ESC to close, focus trap)
 * - Backdrop click to close
 * - Customizable actions
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmDisabled = false,
}: ModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  // Check if we're on the client side
  if (typeof window === 'undefined') return null;
  
  const modalContent = (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal content */}
      <div className="relative z-10 bg-white dark:bg-neutral-800 rounded-lg shadow-xl dark:shadow-neutral-950 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2
            id="modal-title"
            className="text-xl font-semibold text-neutral-900 dark:text-neutral-100"
          >
            {title}
          </h2>
        </div>
        
        {/* Body */}
        <div className="px-6 py-4 text-neutral-900 dark:text-neutral-100">
          {children}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-end space-x-3">
          <Button
            onClick={onClose}
            variant="secondary"
          >
            {cancelText}
          </Button>
          {onConfirm && (
            <Button
              onClick={async () => {
                try {
                  await onConfirm();
                  onClose();
                } catch (error) {
                  // Re-throw error to allow parent component to handle it
                  // Modal stays open on error
                  console.error('Error in modal confirm action:', error);
                  throw error;
                }
              }}
              variant="primary"
              disabled={confirmDisabled}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
  
  // Render modal in a portal at the document body level
  return createPortal(modalContent, document.body);
}
