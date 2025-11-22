// Branded type for percentage values (0-1)
export type Percentage = number & { __brand: "Percentage" };

export const toPercentage = (n: number): Percentage => {
  return Math.max(0, Math.min(1, n)) as Percentage;
};

export type BoundedCardPosition = {
  x: Percentage; // 0-1 (percentage of container width)
  y: Percentage; // 0-1 (percentage of container height)
  rotation: number; // degrees
  zIndex: number;
  faceUp: boolean; // whether card shows face or back
};

export type CardPositions = Record<string, BoundedCardPosition>;

export const createPosition = (
  x: number,
  y: number,
  rotation: number,
  zIndex: number,
  faceUp: boolean = true,
): BoundedCardPosition => ({
  x: toPercentage(x),
  y: toPercentage(y),
  rotation,
  zIndex,
  faceUp,
});

// Card dimensions in pixels
const CARD_WIDTH = 80; // w-20 = 5rem = 80px
const CARD_HEIGHT = 128; // h-32 = 8rem = 128px

// Helper to convert percentage position to pixel position
// Positions are centered on the card, with boundaries accounting for card size
export const toPixelPosition = (
  position: BoundedCardPosition,
  containerWidth: number,
  containerHeight: number,
) => {
  // Calculate card size as percentage of container
  const cardWidthPercent = CARD_WIDTH / containerWidth;
  const cardHeightPercent = CARD_HEIGHT / containerHeight;

  // Clamp position to keep card fully in bounds
  const minX = cardWidthPercent / 2;
  const maxX = 1 - cardWidthPercent / 2;
  const minY = cardHeightPercent / 2;
  const maxY = 1 - cardHeightPercent / 2;

  const clampedX = Math.max(minX, Math.min(maxX, position.x));
  const clampedY = Math.max(minY, Math.min(maxY, position.y));

  // Convert to pixels, centering the card on the position
  const left = clampedX * containerWidth - CARD_WIDTH / 2;
  const top = clampedY * containerHeight - CARD_HEIGHT / 2;

  return {
    left,
    top,
    transform: `rotate(${position.rotation}deg)`,
    zIndex: position.zIndex,
    position: "absolute" as const,
  };
};
