'use client';

import { useState } from 'react';
import { useDieState } from '@/hooks/useDieState';
import { useDiceStorage } from '@/hooks/useDiceStorage';
import { useShareLink } from '@/hooks/useShareLink';
import { useRollDice } from '@/hooks/useRollDice';
import { DieConfigPanel } from './DieConfigPanel';
import { FaceList } from './FaceList';
import { RollAnimation } from './RollAnimation';
import { RollResult } from './RollResult';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ShareContent } from '../ShareContent';
import { Die, Face } from '@/types';
import { MAX_NAME_LENGTH } from '@/lib/constants';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/layout/PageHeader';

export interface DieEditorProps {
  /** Optional initial die to edit */
  initialDie?: Die;
  
  /** Called when die is saved */
  onSave?: (die: Die) => void;
  
  /** Called when editor is reset */
  onReset?: () => void;
}

/**
 * DieEditor component - main editor for creating/editing custom dice
 * 
 * Features:
 * - Die configuration (sides, colors, content type)
 * - Face editing with validation
 * - Live preview
 * - Save/reset functionality
 * - Responsive layout
 */
export function DieEditor({
  initialDie,
  onSave,
  onReset,
}: DieEditorProps) {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareResult, setShareResult] = useState<{
    url: string;
    urlLength: number;
    isTooLong: boolean;
  } | null>(null);
  
  const {
    die,
    errors,
    isValid,
    validationState,
    updateName,
    updateSides,
    updateBackgroundColor,
    updateTextColor,
    updateContentType,
    updateFace,
    markFieldTouched,
    shouldShowError,
    attemptSubmit,
    reset,
  } = useDieState(initialDie);
  
  const { saveDie, duplicateDie } = useDiceStorage();
  const { generateDieLink, error: shareError } = useShareLink();
  const { rollState, rollResult, roll, reset: resetRoll, isRolling } = useRollDice();
  const { showToast } = useToast();

  const handleSaveClick = () => {
    // T024: Attempt submit to trigger validation display on all fields
    const isValidSubmit = attemptSubmit();
    if (isValidSubmit && isValid) {
      setIsSaveModalOpen(true);
    }
  };
  
  const handleConfirmSave = async () => {
    try {
      // Provide default name if empty (per spec requirement)
      const dieToSave = {
        ...die,
        name: die.name.trim() || 'Untitled Die',
      };
      
      await saveDie(dieToSave);
      setIsSaveModalOpen(false);
      showToast(`Die "${dieToSave.name}" saved successfully!`, 'success');
      
      if (onSave) {
        onSave(dieToSave);
      }
    } catch (error) {
      console.error('Failed to save die:', error);
      setIsSaveModalOpen(false);
      showToast('Failed to save die. Please try again.', 'error');
    }
  };

  const handleReset = () => {
    reset();
    if (onReset) {
      onReset();
    }
  };

  const handleDuplicate = async () => {
    if (!initialDie?.id) return;
    
    try {
      const duplicated = await duplicateDie(initialDie.id);
      if (duplicated) {
        showToast(`Die "${duplicated.name}" created successfully!`, 'success');
      }
    } catch (error) {
      console.error('Failed to duplicate die:', error);
      showToast('Failed to duplicate die. Please try again.', 'error');
    }
  };

  const handleShare = () => {
    if (isValid) {
      const result = generateDieLink(die);
      if (result) {
        setShareResult(result);
        setIsShareModalOpen(true);
      }
    }
  };

  const handleRoll = () => {
    if (isValid && !isRolling) {
      resetRoll(); // Reset any previous result
      roll(die);
    }
  };

  const handleBatchUpdate = (updates: Array<{ faceId: number; updates: Partial<Face> }>) => {
    updates.forEach(({ faceId, updates: faceUpdates }) => {
      updateFace(faceId, faceUpdates);
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader title="Create Your Custom Die" />
        
        {/* Die name input */}
        <div className="max-w-md mb-8">
          <Input
            id="die-name"
            label="Die Name"
            value={die.name}
            onChange={(e) => updateName(e.target.value)}
            onBlur={() => markFieldTouched('name')}
            placeholder="My Custom Die"
            maxLength={MAX_NAME_LENGTH}
            showCharacterCount
            error={
              shouldShowError('name')
                ? errors.find((e) =>
                    // TODO: Enhance validation system to return structured errors with field names
                    // (e.g., { field: 'name', message: '...' }) to enable more reliable error-to-field mapping
                    // without string searching. Current implementation uses string matching as a workaround.
                    typeof e === 'string'
                      ? e.toLowerCase().includes('name')
                      : false
                  )
                : undefined
            }
          />
        </div>

        {/* Validation errors - T021: Only show after user interaction */}
        {errors.length > 0 && (validationState.submitAttempted || validationState.touchedFields.size > 0) && (
          <div 
            className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg"
            role="alert"
          >
            <h3 className="text-sm font-semibold text-danger-800 mb-2">
              Please fix the following issues:
            </h3>
            <ul className="list-disc list-inside text-sm text-danger-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main layout: Config Panel + Face List */}
        {/* T033-T037: Mobile-responsive layout with reordered elements */}
        {/* Mobile (<768px): DieConfigPanel -> FaceList -> Buttons */}
        {/* Desktop (≥768px): Left column (DieConfigPanel + Buttons) | Right column (FaceList) */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left column wrapper - only groups items on desktop */}
          {/* On mobile: uses 'contents' to make children direct flex items so order works */}
          {/* On desktop: becomes a flex column container */}
          <div className="contents lg:flex lg:flex-col lg:gap-6 lg:w-1/2">
            {/* T034: Configuration section - order: 1 on mobile */}
            <div className="order-1">
              <DieConfigPanel
                sides={die.sides}
                backgroundColor={die.backgroundColor}
                textColor={die.textColor}
                contentType={die.contentType}
                onSidesChange={updateSides}
                onBackgroundColorChange={updateBackgroundColor}
                onTextColorChange={updateTextColor}
                onContentTypeChange={updateContentType}
              />
            </div>

            {/* T036: Action buttons - order: 3 on mobile (after face list) */}
            {/* On desktop: directly after config panel in left column */}
            <div className="order-3 lg:order-2 space-y-3">
              {rollState !== 'complete' && (
                <Button
                  onClick={handleRoll}
                  variant="primary"
                  disabled={!isValid || isRolling}
                  className="w-full"
                >
                  {isRolling ? 'Rolling...' : 'Roll Die'}
                </Button>
              )}
              <Button
                onClick={handleSaveClick}
                variant="primary"
                disabled={!isValid}
                className="w-full"
              >
                Save Die
              </Button>
              <Button
                onClick={handleShare}
                variant="secondary"
                disabled={!isValid}
                className="w-full"
              >
                Share
              </Button>
              {initialDie?.id && (
                <Button
                  onClick={handleDuplicate}
                  variant="secondary"
                  disabled={!isValid}
                  className="w-full"
                >
                  Duplicate
                </Button>
              )}
              <Button
                onClick={handleReset}
                variant="secondary"
                className="w-full"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* T035: Face List or Roll Result - order: 2 on mobile (between config and buttons) */}
          {/* On desktop: right column, takes remaining space */}
          <div className="order-2 lg:flex-1">
            {rollState === 'rolling' && (
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md dark:shadow-neutral-900">
                <RollAnimation isRolling={true} />
              </div>
            )}
            
            {rollState === 'complete' && rollResult && (
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md dark:shadow-neutral-900">
                <RollResult result={rollResult} die={die} />
                <div className="mt-6">
                  <Button
                    onClick={handleRoll}
                    variant="primary"
                    className="w-full"
                  >
                    Roll Again
                  </Button>
                </div>
              </div>
            )}
            
            {rollState === 'idle' && (
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md dark:shadow-neutral-900">
                <FaceList
                  faces={die.faces}
                  onUpdateFace={updateFace}
                  onBatchUpdate={handleBatchUpdate}
                  onSidesChange={updateSides}
                  currentSides={die.sides}
                />
              </div>
            )}
          </div>
        </div>

        {/* Help text */}
        <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
          <h3 className="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-2">
            Quick Tips
          </h3>
          <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-1 list-disc list-inside">
            <li>Choose between number, text, or color faces</li>
            <li>Number type auto-populates faces with sequential numbers</li>
            <li>Text faces can have up to 20 characters</li>
            <li>Color faces display as solid colors (no text)</li>
            <li>Create dice with 2-101 sides</li>
          </ul>
        </div>
        
        {/* Share error */}
        {shareError && (
          <div 
            className="mt-4 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg"
            role="alert"
          >
            <p className="text-sm font-semibold text-danger-800">
              ✕ {shareError}
            </p>
          </div>
        )}
        
        {/* Share modal */}
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share Your Die"
          cancelText="Close"
        >
          {shareResult && (
            <ShareContent
              url={shareResult.url}
              urlLength={shareResult.urlLength}
              isTooLong={shareResult.isTooLong}
            />
          )}
        </Modal>
        
        {/* Save confirmation modal */}
        <Modal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          title="Save Die"
          onConfirm={handleConfirmSave}
          confirmText="Save"
          confirmDisabled={!isValid}
        >
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Your die &quot;{die.name || 'Untitled Die'}&quot; will be saved to your library.
            </p>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded border border-neutral-200 dark:border-neutral-600">
              <div className="text-xs text-neutral-500 space-y-1">
                <p><strong>Sides:</strong> {die.sides}</p>
                <p><strong>Content Type:</strong> {die.contentType}</p>
                <p><strong>Background:</strong> {die.backgroundColor}</p>
              </div>
            </div>
          </div>
        </Modal>
    </div>
  );
}
