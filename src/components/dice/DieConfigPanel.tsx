'use client';

import { FaceContentType } from '@/types';
import { Input } from '../ui/Input';
import { ColorPicker } from '../ui/ColorPicker';
import { MIN_SIDES, MAX_SIDES } from '@/lib/constants';

export interface DieConfigPanelProps {
  /** Number of sides */
  sides: number;
  
  /** Background color */
  backgroundColor: string;
  
  /** Text color */
  textColor: string;
  
  /** Content type */
  contentType: FaceContentType;
  
  /** Called when sides change */
  onSidesChange: (sides: number) => void;
  
  /** Called when background color changes */
  onBackgroundColorChange: (color: string) => void;
  
  /** Called when text color changes */
  onTextColorChange: (color: string) => void;
  
  /** Called when content type changes */
  onContentTypeChange: (type: FaceContentType) => void;
}

/**
 * DieConfigPanel component for configuring die properties
 * 
 * Features:
 * - Sides selector (2-101)
 * - Background and text color pickers
 * - Content type switcher
 * - Real-time validation
 */
export function DieConfigPanel({
  sides,
  backgroundColor,
  textColor,
  contentType,
  onSidesChange,
  onBackgroundColorChange,
  onTextColorChange,
  onContentTypeChange,
}: DieConfigPanelProps) {
  const handleSidesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onSidesChange(value);
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg dark:shadow-neutral-900 border border-neutral-100 dark:border-neutral-700 transition-all duration-300">
      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">⚙️</span>
        Die Configuration
      </h2>

      {/* Sides selector with enhanced styling */}
      <div className="bg-linear-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
        <Input
          id="die-sides"
          label="Number of Sides"
          type="number"
          value={sides.toString()}
          onChange={handleSidesChange}
          min={MIN_SIDES}
          max={MAX_SIDES}
          helperText={`Must be between ${MIN_SIDES} and ${MAX_SIDES}`}
        />
      </div>

      {/* Content type selector with enhanced styling */}
      <div>
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
          <span aria-hidden="true">📝</span>
          Face Content Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['number', 'text', 'color'] as FaceContentType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onContentTypeChange(type)}
              className={`
                px-4 py-3 rounded-lg text-sm font-semibold
                transition-all duration-200 border-2 transform
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800
                hover:scale-105 active:scale-95
                ${
                  contentType === type
                    ? 'bg-linear-to-r from-primary-600 to-primary-700 text-white border-primary-600 shadow-lg shadow-primary-500/50'
                    : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md'
                }
              `}
              aria-pressed={contentType === type}
            >
              <span className="flex flex-col items-center gap-1">
                <span aria-hidden="true">
                  {type === 'number' && '🔢'}
                  {type === 'text' && '✏️'}
                  {type === 'color' && '🎨'}
                </span>
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
            <span aria-hidden="true" className="text-base">ℹ️</span>
            <span>
              {contentType === 'number' && 'Faces will show numeric values (great for standard dice)'}
              {contentType === 'text' && 'Faces will show custom text up to 20 characters (perfect for word games)'}
              {contentType === 'color' && 'Faces will show solid colors with no text (ideal for color-based games)'}
            </span>
          </p>
        </div>
      </div>

      {/* Background color (only shown for number/text types) */}
      {contentType !== 'color' && (
        <div className="bg-linear-to-br from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
          <ColorPicker
            id="die-bg-color"
            label="Background Color"
            value={backgroundColor}
            onChange={onBackgroundColorChange}
          />
        </div>
      )}

      {/* Text color (only shown for number/text types) */}
      {contentType !== 'color' && (
        <div className="bg-linear-to-br from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
          <ColorPicker
            id="die-text-color"
            label="Text Color"
            value={textColor}
            onChange={onTextColorChange}
          />
        </div>
      )}
    </div>
  );
}
