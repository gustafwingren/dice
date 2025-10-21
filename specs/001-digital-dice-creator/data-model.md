# Data Model: Digital Dice Creator

**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-21  
**Purpose**: Define TypeScript interfaces and data structures

## Core Entities

### Face

Represents a single face on a die.

```typescript
/**
 * Content type for a die face
 */
type FaceContentType = 'number' | 'text' | 'color';

/**
 * A single face on a die
 */
interface Face {
  /** Unique identifier for this face (1-indexed) */
  id: number;
  
  /** Type of content displayed on this face */
  contentType: FaceContentType;
  
  /** Display value for the face */
  value: string | number;
  
  /** Hex color code (only for contentType='color') */
  color?: string;
}
```

**Validation Rules**:
- `id`: Must be 1 to sides count (unique per die)
- `contentType`: Must be 'number', 'text', or 'color'
- `value`: Required for all types
  - For 'number': Positive integer or decimal
  - For 'text': Max 20 characters (FR-008)
  - For 'color': Empty string or color name
- `color`: Required if contentType='color', must be valid hex (#RRGGBB)

**Examples**:
```typescript
// Number face
{ id: 1, contentType: 'number', value: 1 }

// Text face
{ id: 2, contentType: 'text', value: 'Critical Hit!' }

// Color face
{ id: 3, contentType: 'color', value: '', color: '#FF5733' }
```

---

### Die

Represents a single customizable die.

```typescript
/**
 * A customizable die configuration
 */
interface Die {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** User-defined name for the die */
  name: string;
  
  /** Number of sides (2-101) */
  sides: number;
  
  /** Background color of the die (hex) */
  backgroundColor: string;
  
  /** Text color for the die (hex) */
  textColor: string;
  
  /** Content type for all faces on this die */
  contentType: FaceContentType;
  
  /** Ordered array of faces (length must equal sides) */
  faces: Face[];
  
  /** ISO 8601 timestamp of creation */
  createdAt: string;
  
  /** ISO 8601 timestamp of last modification */
  updatedAt: string;
}
```

**Validation Rules**:
- `id`: Must be valid UUID v4 format
- `name`: Required, max 50 characters
- `sides`: Integer 2-101 (FR-003)
- `backgroundColor`, `textColor`: Valid hex color codes
- `contentType`: All faces must have same type within a die (FR-004)
- `faces`: Array length must equal `sides`, ids must be sequential 1..sides
- `createdAt`, `updatedAt`: Valid ISO 8601 strings

**Invariants**:
- A die is immutable after creation (FR-018)
- Editing creates a new die with new UUID
- All faces within a die share the same contentType

**Examples**:
```typescript
// Standard 6-sided die
{
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Standard D6',
  sides: 6,
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
  contentType: 'number',
  faces: [
    { id: 1, contentType: 'number', value: 1 },
    { id: 2, contentType: 'number', value: 2 },
    { id: 3, contentType: 'number', value: 3 },
    { id: 4, contentType: 'number', value: 4 },
    { id: 5, contentType: 'number', value: 5 },
    { id: 6, contentType: 'number', value: 6 }
  ],
  createdAt: '2025-10-21T10:30:00Z',
  updatedAt: '2025-10-21T10:30:00Z'
}

// Custom text die
{
  id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  name: 'Decision Die',
  sides: 4,
  backgroundColor: '#3B82F6',
  textColor: '#FFFFFF',
  contentType: 'text',
  faces: [
    { id: 1, contentType: 'text', value: 'Yes' },
    { id: 2, contentType: 'text', value: 'No' },
    { id: 3, contentType: 'text', value: 'Maybe' },
    { id: 4, contentType: 'text', value: 'Ask again' }
  ],
  createdAt: '2025-10-21T11:00:00Z',
  updatedAt: '2025-10-21T11:00:00Z'
}

// Color die (FR-004a)
{
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  name: 'Rainbow Die',
  sides: 3,
  backgroundColor: '#000000',
  textColor: '#FFFFFF',
  contentType: 'color',
  faces: [
    { id: 1, contentType: 'color', value: '', color: '#FF0000' },
    { id: 2, contentType: 'color', value: '', color: '#00FF00' },
    { id: 3, contentType: 'color', value: '', color: '#0000FF' }
  ],
  createdAt: '2025-10-21T12:00:00Z',
  updatedAt: '2025-10-21T12:00:00Z'
}
```

---

### DiceSet

Represents a collection of 1-6 dice that can be rolled together.

```typescript
/**
 * A set of dice that can be rolled together
 */
interface DiceSet {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** User-defined name for the set */
  name: string;
  
  /** Array of die IDs in this set (1-6 dice) */
  diceIds: string[];
  
  /** ISO 8601 timestamp of creation */
  createdAt: string;
  
  /** ISO 8601 timestamp of last modification */
  updatedAt: string;
}
```

**Validation Rules**:
- `id`: Must be valid UUID v4 format
- `name`: Required, max 50 characters
- `diceIds`: Array of 1-6 valid die UUIDs (FR-001, FR-013)
- `createdAt`, `updatedAt`: Valid ISO 8601 strings

**Business Rules**:
- Minimum 1 die, maximum 6 dice per set (FR-013)
- All referenced dice must exist in user's library
- Order of diceIds determines display order
- Deleting a die should remove it from all sets (cascading)

**Examples**:
```typescript
// Single die set
{
  id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
  name: 'My Lucky Die',
  diceIds: ['550e8400-e29b-41d4-a716-446655440000'],
  createdAt: '2025-10-21T13:00:00Z',
  updatedAt: '2025-10-21T13:00:00Z'
}

// Multiple dice set
{
  id: '9b8c7d6e-5f4a-3b2c-1d0e-9f8a7b6c5d4e',
  name: 'D&D Starter Set',
  diceIds: [
    '550e8400-e29b-41d4-a716-446655440000', // D6
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // D4
    '7c9e6679-7425-40de-944b-e07fc1f90ae7'  // D8
  ],
  createdAt: '2025-10-21T14:00:00Z',
  updatedAt: '2025-10-21T14:00:00Z'
}
```

---

### ShareLink

Represents encoded data for sharing dice/sets via URL.

```typescript
/**
 * Share link configuration
 */
interface ShareLink {
  /** Type of shared content */
  type: 'die' | 'set';
  
  /** Serialized die or dice set data */
  data: Die | DiceSet;
  
  /** Array of Die objects if type='set' */
  dice?: Die[];
  
  /** Version of encoding format */
  version: number;
}
```

**Validation Rules**:
- `type`: Must be 'die' or 'set'
- `data`: Must be valid Die or DiceSet depending on type
- `dice`: Required if type='set', array of Die objects matching diceIds
- `version`: Current version is 1, for future format migrations

**Encoding Process**:
1. Serialize ShareLink to JSON
2. Compress with LZ-String
3. Base64 encode
4. Append to URL fragment: `/#share={encoded}`

**Decoding Process**:
1. Extract fragment from URL
2. Base64 decode
3. Decompress with LZ-String
4. Parse JSON to ShareLink
5. Validate all fields
6. Assign new UUIDs (don't use shared IDs to avoid conflicts)

**Examples**:
```typescript
// Share single die
{
  type: 'die',
  version: 1,
  data: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Standard D6',
    sides: 6,
    // ... full die object
  }
}

// Share dice set
{
  type: 'set',
  version: 1,
  data: {
    id: '9b8c7d6e-5f4a-3b2c-1d0e-9f8a7b6c5d4e',
    name: 'D&D Starter Set',
    diceIds: ['...', '...', '...']
  },
  dice: [
    { /* full die 1 */ },
    { /* full die 2 */ },
    { /* full die 3 */ }
  ]
}
```

---

### RollResult

Represents the result of rolling one or more dice.

```typescript
/**
 * Result of a single die roll
 */
interface DieRollResult {
  /** ID of the die that was rolled */
  dieId: string;
  
  /** The face that was rolled */
  face: Face;
  
  /** Random index (1-based) of rolled face */
  rolledIndex: number;
}

/**
 * Result of rolling a dice set
 */
interface RollResult {
  /** ID of the dice set that was rolled */
  setId: string;
  
  /** Individual results for each die */
  results: DieRollResult[];
  
  /** ISO 8601 timestamp of the roll */
  timestamp: string;
}
```

**Validation Rules**:
- `dieId`: Must match existing die
- `face`: Must be valid face from rolled die
- `rolledIndex`: Must be 1 to die.sides
- `setId`: Must match existing dice set
- `results`: Length must equal set.diceIds.length
- `timestamp`: Valid ISO 8601 string

**Business Rules**:
- Rolls use cryptographic random (crypto.getRandomValues)
- Results are not persisted (ephemeral)
- Animation duration depends on die size (FR-019)

**Examples**:
```typescript
{
  setId: '9b8c7d6e-5f4a-3b2c-1d0e-9f8a7b6c5d4e',
  results: [
    {
      dieId: '550e8400-e29b-41d4-a716-446655440000',
      face: { id: 4, contentType: 'number', value: 4 },
      rolledIndex: 4
    },
    {
      dieId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      face: { id: 2, contentType: 'text', value: 'No' },
      rolledIndex: 2
    }
  ],
  timestamp: '2025-10-21T15:30:00Z'
}
```

---

## Storage Schema

### LocalStorage Keys

```typescript
/**
 * LocalStorage key structure
 */
const STORAGE_KEYS = {
  /** Array of all saved dice */
  DICE_LIBRARY: 'diceCreator:dice',
  
  /** Array of all dice sets */
  DICE_SETS: 'diceCreator:sets',
  
  /** Schema version for migrations */
  SCHEMA_VERSION: 'diceCreator:schemaVersion',
  
  /** User preferences */
  PREFERENCES: 'diceCreator:preferences'
} as const;
```

### Storage Format

**DICE_LIBRARY** (IndexedDB via localforage):
```typescript
{
  version: 1,
  data: Die[] // Array of all saved dice
}
```

**DICE_SETS** (IndexedDB via localforage):
```typescript
{
  version: 1,
  data: DiceSet[] // Array of all dice sets
}
```

**PREFERENCES** (localStorage):
```typescript
{
  version: 1,
  data: {
    theme: 'light' | 'dark',
    animationSpeed: 'slow' | 'normal' | 'fast',
    soundEnabled: boolean
  }
}
```

---

## Relationships

### Entity Relationship Diagram

```
┌─────────────┐
│    Face     │
│ ─────────── │
│ id          │
│ contentType │
│ value       │
│ color?      │
└─────────────┘
       │
       │ 1..101
       │ (composition)
       ▼
┌─────────────┐
│     Die     │
│ ─────────── │
│ id          │
│ name        │
│ sides       │
│ faces[]     │◄────┐
│ ...         │     │
└─────────────┘     │
       │            │
       │            │
       │ 1..6       │ 1..*
       │ (reference)│ (reference)
       ▼            │
┌─────────────┐     │
│  DiceSet    │     │
│ ─────────── │     │
│ id          │     │
│ name        │     │
│ diceIds[]   │─────┘
│ ...         │
└─────────────┘
       │
       │ 0..1
       │ (encoding)
       ▼
┌─────────────┐
│ ShareLink   │
│ ─────────── │
│ type        │
│ data        │
│ dice?[]     │
│ version     │
└─────────────┘
```

**Cardinality**:
- 1 Die → 2..101 Faces (composition, faces cannot exist without die)
- 1 DiceSet → 1..6 Die references (aggregation, dice exist independently)
- 1 ShareLink → 1 Die OR 1 DiceSet + 1..6 Dice (snapshot, not live reference)

---

## Validation Functions

### Type Guards

```typescript
/**
 * Type guard for FaceContentType
 */
function isFaceContentType(value: unknown): value is FaceContentType {
  return value === 'number' || value === 'text' || value === 'color';
}

/**
 * Type guard for Face
 */
function isFace(value: unknown): value is Face {
  if (typeof value !== 'object' || value === null) return false;
  const f = value as Partial<Face>;
  
  return (
    typeof f.id === 'number' &&
    f.id >= 1 &&
    isFaceContentType(f.contentType) &&
    (typeof f.value === 'string' || typeof f.value === 'number') &&
    (f.contentType !== 'color' || (typeof f.color === 'string' && /^#[0-9A-F]{6}$/i.test(f.color)))
  );
}

/**
 * Type guard for Die
 */
function isDie(value: unknown): value is Die {
  if (typeof value !== 'object' || value === null) return false;
  const d = value as Partial<Die>;
  
  return (
    typeof d.id === 'string' &&
    typeof d.name === 'string' &&
    d.name.length > 0 &&
    d.name.length <= 50 &&
    typeof d.sides === 'number' &&
    d.sides >= 2 &&
    d.sides <= 101 &&
    Array.isArray(d.faces) &&
    d.faces.length === d.sides &&
    d.faces.every(isFace)
  );
}
```

### Validation Errors

```typescript
/**
 * Validation error types
 */
type ValidationErrorCode =
  | 'INVALID_SIDES_RANGE'
  | 'INVALID_FACE_COUNT'
  | 'INVALID_TEXT_LENGTH'
  | 'INVALID_COLOR_FORMAT'
  | 'INVALID_SET_SIZE'
  | 'MIXED_CONTENT_TYPES';

/**
 * Validation error
 */
class ValidationError extends Error {
  constructor(
    public code: ValidationErrorCode,
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

---

## Migration Strategy

### Version History

**v1** (Initial):
- All entities as defined above
- LZ-String + Base64 encoding for share links

**Future Versions**:
- v2: May add `tags: string[]` to Die for categorization
- v3: May add `statistics` to track roll history
- v4: May add `animation` customization per die

### Migration Function

```typescript
/**
 * Migrate storage data from old version to current
 */
function migrateStorage(oldVersion: number, data: unknown): unknown {
  switch (oldVersion) {
    case 1:
      // Current version, no migration needed
      return data;
    
    // Future migrations
    // case 2:
    //   return migrateV1ToV2(data);
    
    default:
      throw new Error(`Unknown schema version: ${oldVersion}`);
  }
}
```

---

## Constants

```typescript
/**
 * Application-wide constants
 */
export const CONSTANTS = {
  /** Minimum number of sides per die */
  MIN_SIDES: 2,
  
  /** Maximum number of sides per die */
  MAX_SIDES: 101,
  
  /** Minimum dice in a set */
  MIN_DICE_PER_SET: 1,
  
  /** Maximum dice in a set */
  MAX_DICE_PER_SET: 6,
  
  /** Maximum character length for text faces */
  MAX_TEXT_LENGTH: 20,
  
  /** Maximum character length for die/set names */
  MAX_NAME_LENGTH: 50,
  
  /** Default die background color */
  DEFAULT_BG_COLOR: '#FFFFFF',
  
  /** Default die text color */
  DEFAULT_TEXT_COLOR: '#000000',
  
  /** Maximum URL length to warn user */
  MAX_SAFE_URL_LENGTH: 6000,
  
  /** Current storage schema version */
  CURRENT_SCHEMA_VERSION: 1
} as const;
```
