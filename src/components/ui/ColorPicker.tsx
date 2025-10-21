'use client';

import { useState, useEffect } from 'react';
import { Input } from './Input';

const PRESET_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Orange
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Gold
  '#52D273', // Green
  '#FF85A1', // Pink
  '#95E1D3', // Aqua
  '#FFFFFF', // White
  '#000000', // Black
  '#888888', // Gray
];

export interface ColorPickerProps {
  /** Current color value (hex format) */
  value: string;
  
  /** Called when color changes */
  onChange: (color: string) => void;
  
  /** Label for the color picker */
  label: string;
  
  /** Optional error message */
  error?: string;
  
  /** Optional ID for accessibility */
  id?: string;
}

/**
 * ColorPicker component with preset palette and hex input
 * 
 * Features:
 * - Preset color palette for quick selection
 * - Hex color input for custom colors
 * - Visual feedback for selected color
 * - Accessible with keyboard navigation
 */
export function ColorPicker({
  value,
  onChange,
  label,
  error,
  id = 'color-picker',
}: ColorPickerProps) {
  const [customHex, setCustomHex] = useState(value);

  // Update internal state when value prop changes (for loading from storage)
  useEffect(() => {
    setCustomHex(value);
  }, [value]);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setCustomHex(color);
  };

  const handleCustomChange = (newValue: string) => {
    setCustomHex(newValue);
    
    // Only update parent if valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      
      {/* Preset color palette */}
      <div
        className="grid grid-cols-5 sm:grid-cols-8 gap-2"
        role="radiogroup"
        aria-label="Preset colors"
      >
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => handlePresetClick(color)}
            className={`
              w-10 h-10 rounded-md border-2 transition-all
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800
              ${
                value === color
                  ? 'border-primary-600 dark:border-primary-400 scale-110 shadow-md'
                  : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 hover:scale-105'
              }
            `}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
            aria-checked={value === color}
            role="radio"
            title={color}
          >
            {/* Add checkmark for better visibility on light colors */}
            {value === color && (
              <svg
                className="w-6 h-6 mx-auto"
                fill="none"
                stroke={color === '#FFFFFF' || color === '#F7DC6F' ? '#000' : '#FFF'}
                strokeWidth={3}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Custom hex input */}
      <Input
        id={`${id}-hex`}
        label="Custom Hex Color"
        value={customHex}
        onChange={(e) => handleCustomChange(e.target.value)}
        placeholder="#000000"
        maxLength={7}
        error={error}
        aria-describedby={error ? `${id}-danger` : undefined}
      />

      {/* Color preview */}
      <div className="flex items-center gap-3 mt-2" aria-label={`Current color: ${value}`}>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">Preview:</span>
        <div
          className="w-16 h-10 rounded border-2 border-neutral-300 dark:border-neutral-600"
          style={{ backgroundColor: value }}
          role="img"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
