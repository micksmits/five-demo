# Card Game Architecture Choices

## Game State Management

### Phase System
- **START PHASE**: All 52 cards stacked in center (deck), face down
- **DEAL PHASE**: Cards dealt to players around edges (3 face down, 3 face up on top)
- Phases toggle in a circle using the Draw button: start → deal → start

### Card Positioning System

#### Type-Safe Bounded Positions
- Use branded `Percentage` type (0-1 range) for x/y coordinates
- Positions represent card center point, not top-left corner
- Automatic clamping ensures cards stay within container bounds
- Card dimensions (80px × 128px) factored into boundary calculations

#### Position Structure
```typescript
{
  x: Percentage,        // 0-1 (percentage of container width)
  y: Percentage,        // 0-1 (percentage of container height)
  rotation: number,     // degrees
  zIndex: number,       // stacking order
  faceUp: boolean       // shows card face or back
}
```

### Card Layout Modes

#### Side-by-Side vs Overlapping
- **Side-by-side mode** (`overlap: false`): Cards positioned with full card width + small gap
- **Overlapping mode** (`overlap: true`): Cards overlap by 70%, showing only 30% of each card

#### Rotation-Aware Spacing
- When cards are rotated 90° (horizontal sides), dimensions swap in screen space
- **Normal cards (top/bottom)**: Use card width for horizontal spacing
- **Rotated cards (left/right)**: Use card height for horizontal spacing
- Ensures consistent visual spacing regardless of card orientation

### Player Hand Layout

#### Deal Phase Configuration
- Supports 2-6 players
- 6 cards per player total:
  - First 3 cards: Face down at base position
  - Next 3 cards: Face up, offset slightly to top-right
- Cards arranged in groups around perimeter
- Each player positioned evenly around circular perimeter

#### Face-Up Card Offset
- Face-up cards offset to reveal face-down cards underneath
- Offset uses card dimensions for consistency:
  - **Horizontal cards**: Right offset uses height (20%), top offset uses width (15%)
  - **Vertical cards**: Right offset uses width (20%), top offset uses height (15%)

#### Z-Index Layering
- Face-down cards: Base z-index (card index)
- Face-up cards: +1000 z-index (ensures they appear on top)
- Remaining deck cards: 2000+ z-index (separate from player cards)

### Card Rendering

#### Card Component States
- **Face Up**: Shows suit icons (Heart, Spade, Club, Diamond) and rank
- **Face Down**: Shows decorative card back image
- Border: Inside border using inset box-shadow (#A08F8C, 1px)
- Card dimensions: 80px wide × 128px tall

#### Face Card Display
- **Number cards**: Large number in center with suit icon below
- **Jack/Queen**: User icon with suit icon
- **King**: Crown icon with suit icon
- **Ace**: "A" with suit icon
- Corners show rank and mini suit icon (rotated 180° in bottom-right)

## Remaining Deck Management

### Card Distribution
- **4 players × 6 cards = 24 cards dealt**
- **52 - 24 = 28 cards remain** in center deck
- Remaining cards accurately positioned and rendered in center

## Component Architecture

### GameScreen Component
- Accepts `phase` prop to determine card layout
- Uses `useMemo` to recalculate positions when phase changes
- Tracks container size for responsive pixel conversion
- Generates full 52-card deck (4 suits × 13 ranks)

### State Functions
- `createStartPhaseState()`: Positions all cards in center deck
- `createDealPhaseState()`: Distributes cards to players and remaining deck
- Both return `CardPositions` object mapping card IDs to positions

## Visual Design

### Responsive Layout
- Desktop (lg+): Shows stats, action buttons, game history sidebar
- Mobile/Tablet: Hides stats and sidebar, shows floating menu button
- Game screen adapts to container size with percentage-based positioning

### Color Scheme
- Hearts/Diamonds: Red (#EF4444)
- Spades/Clubs: Black
- Card border: #A08F8C (inside border)
- Card back: Decorative pattern image

## Future Considerations
- AI agent integration using ai-sdk for card dealing logic
- Additional game phases beyond start and deal
- Dynamic player count selection
- Animation support via framer-motion (already integrated)
