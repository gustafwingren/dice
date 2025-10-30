'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Die } from '@/types';
import { useDiceSetState } from '@/hooks/useDiceSetState';
import { useDiceStorage } from '@/hooks/useDiceStorage';
import { useShareLink } from '@/hooks/useShareLink';
import { useRollDice } from '@/hooks/useRollDice';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ShareContent } from '../ShareContent';
import { RollAnimation } from './RollAnimation';
import { RollResult } from './RollResult';
import { MAX_NAME_LENGTH, MAX_DICE_PER_SET } from '@/lib/constants';
import { copyDie } from '@/lib/die-factory';
import { EditIllustration } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/layout/PageHeader';

export interface DiceSetEditorProps {
  /** Called when dice set is saved */
  onSave?: () => void;
  
  /** Called when editor is reset */
  onReset?: () => void;
}

/**
 * DiceSetEditor component - editor for creating/editing dice sets
 * 
 * Features:
 * - Add multiple dice to a set (1-6 dice)
 * - Reorder dice within the set
 * - Remove dice from the set
 * - Save dice set with name
 * - Visual preview of all dice
 */
export function DiceSetEditor({
  onSave,
  onReset,
}: DiceSetEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAddDieModalOpen, setIsAddDieModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareResult, setShareResult] = useState<{
    url: string;
    urlLength: number;
    isTooLong: boolean;
  } | null>(null);
  // Map from copied die ID to original die ID (for edit mode)
  const [originalDiceIds, setOriginalDiceIds] = useState<Map<string, string>>(new Map());

  const {
    diceSet,
    dice,
    errors,
    isValid,
    updateSetName,
    addDie,
    removeDie,
    reorderDice,
    reset,
    canAddMoreDice,
    loadDiceSet,
  } = useDiceSetState();
  
  const { dice: savedDice, diceSets, saveDiceSet, isLoading: storageLoading } = useDiceStorage();
  const { generateSetLink, error: shareError } = useShareLink();
  const { rollState, rollResult, rollSet, reset: resetRoll, isRolling } = useRollDice();
  const { showToast } = useToast();

  // Load dice set from URL parameter on mount
  useEffect(() => {
    const setId = searchParams.get('id');
    
    // Wait for storage to load before trying to find the set
    if (setId && !isLoaded && !storageLoading) {
      // Find the dice set in storage
      const diceSetToLoad = diceSets.find((s) => s.id === setId);
      if (diceSetToLoad) {
        // Create a map to track original dice IDs
        const idMap = new Map<string, string>();
        
        // Get the actual Die objects for this set and create copies
        const setDice = diceSetToLoad.diceIds
          .map((originalId) => {
            const originalDie = savedDice.find((d) => d.id === originalId);
            if (!originalDie) return undefined;
            
            const copiedDie = copyDie(originalDie); // Create copy per FR-013
            idMap.set(copiedDie.id, originalId); // Track copied ID -> original ID
            return copiedDie;
          })
          .filter((d): d is Die => d !== undefined);
        
        // Update the dice set to use the copied dice IDs
        const updatedDiceSet = {
          ...diceSetToLoad,
          diceIds: setDice.map(d => d.id),
        };
        
        // Store the ID mapping
        setOriginalDiceIds(idMap);
        
        // Load the set into the editor with the copied dice
        loadDiceSet(updatedDiceSet, setDice);
      }
      setIsLoaded(true);
    }
  }, [searchParams, diceSets, savedDice, isLoaded, loadDiceSet, storageLoading]);

  const handleSaveClick = () => {
    if (isValid) {
      setIsSaveModalOpen(true);
    }
  };
  
  const handleConfirmSave = async () => {
    try {
      // Map copied dice IDs back to original IDs when editing
      let diceIdsToSave = diceSet.diceIds;
      
      if (originalDiceIds.size > 0) {
        // We're editing an existing set, map back to original IDs
        diceIdsToSave = diceSet.diceIds.map(copiedId => {
          // If this is a copied die, use the original ID
          // Otherwise, it's a newly added die, keep its current ID
          return originalDiceIds.get(copiedId) || copiedId;
        });
      }
      
      // Provide default name if empty
      const setToSave = {
        ...diceSet,
        name: diceSet.name.trim() || 'Untitled Set',
        diceIds: diceIdsToSave, // Use original IDs
      };
      
      await saveDiceSet(setToSave);
      setIsSaveModalOpen(false);
      showToast(`Dice set "${setToSave.name}" saved successfully!`, 'success');
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Failed to save dice set:', error);
      setIsSaveModalOpen(false);
      showToast('Failed to save dice set. Please try again.', 'error');
    }
  };

  const handleReset = () => {
    reset();
    setOriginalDiceIds(new Map()); // Clear the ID mapping
    if (onReset) {
      onReset();
    }
  };

  const handleAddDieClick = () => {
    if (canAddMoreDice) {
      setIsAddDieModalOpen(true);
    }
  };

  const handleSelectDie = (die: Die) => {
    addDie(die);
    setIsAddDieModalOpen(false);
  };

  const handleMoveDieUp = (index: number) => {
    if (index > 0) {
      reorderDice(index, index - 1);
    }
  };

  const handleMoveDieDown = (index: number) => {
    if (index < dice.length - 1) {
      reorderDice(index, index + 1);
    }
  };

  const handleShare = () => {
    if (isValid && dice.length > 0) {
      const result = generateSetLink(diceSet, dice);
      if (result) {
        setShareResult(result);
        setIsShareModalOpen(true);
      }
    }
  };

  const handleRoll = () => {
    if (isValid && dice.length > 0 && !isRolling) {
      resetRoll(); // Reset any previous result
      rollSet(dice);
    }
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <PageHeader title="Create Dice Set" />
        
        {/* Set name input */}
        <div className="max-w-md mb-8">
          <Input
            id="set-name"
            label="Set Name"
            value={diceSet.name}
            onChange={(e) => updateSetName(e.target.value)}
            placeholder="My Dice Set"
            maxLength={MAX_NAME_LENGTH}
            showCharacterCount
          />
        </div>

        {/* Validation errors */}
        {errors.length > 0 && (
          <div 
            className="mb-6 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg"
            role="alert"
          >
            <h3 className="text-sm font-semibold text-danger-800 mb-2">
              ⚠️ Please fix the following issues:
            </h3>
            <ul className="list-disc list-inside text-sm text-danger-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Dice in set */}
          <div>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md dark:shadow-neutral-900">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Dice in Set ({dice.length}/{MAX_DICE_PER_SET})
                </h2>
                <div className="flex flex-col items-end gap-1">
                  <Button
                    onClick={handleAddDieClick}
                    variant="primary"
                    disabled={!canAddMoreDice}
                    size="sm"
                  >
                    + Add Die
                  </Button>
                  {!canAddMoreDice && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Maximum {MAX_DICE_PER_SET} dice reached
                    </span>
                  )}
                </div>
              </div>

              {dice.length === 0 ? (
                <div className="text-center py-12">
                  <EditIllustration className="w-20 h-20 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
                  <p className="text-neutral-900 dark:text-neutral-100 font-semibold mb-2">
                    No dice in this set yet
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                    Click &quot;Add Die&quot; to select from your saved dice.
                  </p>
                  {savedDice.length === 0 && (
                    <div className="mt-6 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800">
                      <p className="text-sm text-warning-800 dark:text-warning-200 mb-3">
                        💡 You don&apos;t have any saved dice yet.
                      </p>
                      <Button
                        onClick={() => router.push('/')}
                        variant="secondary"
                        size="sm"
                      >
                        Create Your First Die
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {dice.map((die, index) => (
                    <div
                      key={die.id}
                      className="border border-neutral-200 rounded-lg p-4 flex items-center gap-4"
                    >
                      {/* Die info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{die.name}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {die.sides} sides • {die.contentType}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleMoveDieUp(index)}
                          disabled={index === 0}
                          className="px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveDieDown(index)}
                          disabled={index === dice.length - 1}
                          className="px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeDie(die.id)}
                          className="px-2 py-1 text-sm border border-danger-300 dark:border-danger-700 text-danger-600 dark:text-danger-400 rounded hover:bg-danger-50 dark:hover:bg-danger-900/20"
                          aria-label="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-6 space-y-3">
              {rollState !== 'complete' && (
                <Button
                  onClick={handleRoll}
                  variant="primary"
                  disabled={!isValid || dice.length === 0 || isRolling}
                  className="w-full"
                >
                  {isRolling ? 'Rolling...' : 'Roll All Dice'}
                </Button>
              )}
              <Button
                onClick={handleSaveClick}
                variant="primary"
                disabled={!isValid}
                className="w-full"
              >
                Save Dice Set
              </Button>
              <Button
                onClick={handleShare}
                variant="secondary"
                disabled={!isValid || dice.length === 0}
                className="w-full"
              >
                Share
              </Button>
              <Button
                onClick={handleReset}
                variant="secondary"
                className="w-full"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Right column: Info or Roll Result */}
          <div>
            {rollState === 'rolling' && (
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
                <RollAnimation isRolling={true} />
              </div>
            )}
            
            {rollState === 'complete' && rollResult && (
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
                <RollResult result={rollResult} dice={dice} />
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
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-2">
                  About Dice Sets
                </h3>
                <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-1 list-disc list-inside">
                  <li>Add 1-6 dice to a set</li>
                  <li>Reorder dice using the arrow buttons</li>
                  <li>Each set can have a unique name</li>
                  <li>Dice remain editable individually</li>
                  <li>Roll all dice in a set together</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Share error */}
        {shareError && (
          <div 
            className="mt-4 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg"
            role="alert"
          >
            <p className="text-sm font-semibold text-danger-800 dark:text-danger-200">
              ✕ {shareError}
            </p>
          </div>
        )}
        
        {/* Share modal */}
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share Your Dice Set"
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
          title="Save Dice Set"
          onConfirm={handleConfirmSave}
          confirmText="Save"
          confirmDisabled={!isValid}
        >
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Your dice set &quot;{diceSet.name || 'Untitled Set'}&quot; with {dice.length} {dice.length === 1 ? 'die' : 'dice'} will be saved to your library.
            </p>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded border border-neutral-200 dark:border-neutral-600">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                <p><strong>Dice Count:</strong> {dice.length}</p>
                <p><strong>Dice:</strong></p>
                <ul className="ml-4 list-disc">
                  {dice.map((die) => (
                    <li key={die.id}>{die.name} ({die.sides} sides)</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Modal>

        {/* Add die modal */}
        <Modal
          isOpen={isAddDieModalOpen}
          onClose={() => setIsAddDieModalOpen(false)}
          title="Select Die to Add"
        >
          <div className="space-y-4">
            {savedDice.length === 0 ? (
              <div className="text-center py-8">
                <EditIllustration className="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
                <p className="text-neutral-900 dark:text-neutral-100 font-semibold mb-2">
                  No saved dice available
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  Create and save a die first to add it to a set.
                </p>
                <Button
                  onClick={() => router.push('/')}
                  variant="primary"
                >
                  Create a Die
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {savedDice
                  .filter(die => !diceSet.diceIds.includes(die.id))
                  .map((die) => (
                    <button
                      key={die.id}
                      onClick={() => handleSelectDie(die)}
                      className="w-full p-3 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 text-left"
                    >
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">{die.name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {die.sides} sides • {die.contentType}
                      </p>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </Modal>
    </div>
  );
}
