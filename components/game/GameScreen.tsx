"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { PlayingCard, Suit, Rank } from "./PlayingCard";
import {
  CardPositions,
  createPosition,
  toPixelPosition,
} from "@/lib/card-positions";

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

const suits: Suit[] = ["hearts", "spades", "clubs", "diamonds"];
const ranks: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

function generateDeck(): Card[] {
  const deck: Card[] = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}`,
      });
    });
  });
  return deck;
}

// START PHASE: all cards stacked in center (deck), face down
function createStartPhaseState(deck: Card[]): CardPositions {
  const positions: CardPositions = {};
  deck.forEach((card, index) => {
    // Stack cards in center (0.5, 0.5) with slight offset for depth
    positions[card.id] = createPosition(
      0.5,
      0.5,
      0, // no rotation
      index, // z-index increases for each card
      false, // cards start face down in deck
    );
  });
  return positions;
}

// DEAL PHASE: player hands around the edges (6 cards per player: 3 face down, 3 face up on top)
function createDealPhaseState(
  deck: Card[],
  numPlayers: number,
  containerWidth: number = 800, // default estimate
  containerHeight: number = 600,
  overlap: boolean = false, // true = cards overlap, false = side by side
): CardPositions {
  const positions: CardPositions = {};
  const cardsPerPlayer = 6; // 3 face down + 3 face up

  // Card dimensions
  const cardWidth = 80;
  const cardHeight = 128;

  // Card spacing based on overlap mode
  const cardWidthPercent = cardWidth / containerWidth;
  const cardHeightPercent = cardHeight / containerHeight;
  const gapPercent = 0.01; // small gap between cards
  const cardSpacing = overlap
    ? cardWidthPercent * 0.3 // overlap mode: cards overlap by 70%
    : cardWidthPercent + gapPercent; // side-by-side mode: full width + gap

  // Calculate positions around the perimeter
  const angleStep = (Math.PI * 2) / numPlayers;

  deck.forEach((card, index) => {
    const playerIndex = Math.floor(index / cardsPerPlayer);
    const cardInHand = index % cardsPerPlayer;
    const isFaceUpGroup = cardInHand >= 3; // First 3 are face down, next 3 are face up
    const cardIndexInGroup = cardInHand % 3; // 0, 1, or 2 within the group

    if (playerIndex < numPlayers) {
      // Calculate angle for this player's position
      const angle = angleStep * playerIndex - Math.PI / 2; // start at top

      // Base position on the edge
      const radius = 0.4; // distance from center
      const centerX = 0.5 + Math.cos(angle) * radius;
      const centerY = 0.5 + Math.sin(angle) * radius;

      // Rotate cards to face toward the center
      const rotation = (angle * 180) / Math.PI + 90; // convert to degrees and adjust

      // Determine which dimension to use for spacing based on rotation
      // When rotated ~90° or ~270°, card width/height are swapped in screen space
      const normalizedRotation = ((rotation % 360) + 360) % 360;
      const isRotatedSideways =
        (normalizedRotation > 45 && normalizedRotation < 135) ||
        (normalizedRotation > 225 && normalizedRotation < 315);

      // When sideways, the card's height becomes its width in screen space
      const effectiveCardSpacing = isRotatedSideways
        ? overlap
          ? cardHeightPercent * 0.3
          : cardHeightPercent + gapPercent
        : overlap
          ? cardWidthPercent * 0.3
          : cardWidthPercent + gapPercent;

      // Offset cards within the group (side by side, accounting for rotation)
      const cardOffset = (cardIndexInGroup - 1) * effectiveCardSpacing;
      let offsetX = -Math.sin(angle) * cardOffset; // perpendicular to radius
      let offsetY = Math.cos(angle) * cardOffset;

      // Calculate z-index - face-up cards must be on top
      const zIndex = isFaceUpGroup ? 1000 + index : index;

      // If face-up group, offset slightly to the right and top to show cards underneath
      if (isFaceUpGroup) {
        // Use consistent offset based on card dimensions (like spacing)
        const rightOffsetAmount = isRotatedSideways
          ? cardHeightPercent * 0.2 // horizontal cards: use height
          : cardWidthPercent * 0.2; // vertical cards: use width
        const topOffsetAmount = isRotatedSideways
          ? cardWidthPercent * 0.15 // horizontal cards: use width for vertical offset
          : cardHeightPercent * 0.15; // vertical cards: use height for vertical offset

        // Offset to the right (perpendicular to radius, same as card spacing)
        offsetX += -Math.sin(angle) * rightOffsetAmount;
        offsetY += Math.cos(angle) * rightOffsetAmount;

        // Offset toward center (along radius, inward)
        offsetX -= Math.cos(angle) * topOffsetAmount;
        offsetY -= Math.sin(angle) * topOffsetAmount;
      }

      positions[card.id] = createPosition(
        centerX + offsetX,
        centerY + offsetY,
        rotation,
        zIndex,
        isFaceUpGroup, // first 3 face down (false), next 3 face up (true)
      );
    } else {
      // Remaining cards stay in deck (center), stacked with proper z-index
      const deckCardIndex = index - numPlayers * cardsPerPlayer;
      positions[card.id] = createPosition(
        0.5,
        0.5,
        0,
        2000 + deckCardIndex,
        false,
      );
    }
  });

  return positions;
}

export type GamePhase = "start" | "deal";

interface GameScreenProps {
  phase?: GamePhase;
}

export function GameScreen({ phase = "deal" }: GameScreenProps) {
  const deck = useMemo(() => generateDeck(), []);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  // Update card positions based on phase
  const cardPositions = useMemo(() => {
    if (phase === "start") {
      return createStartPhaseState(deck);
    } else {
      return createDealPhaseState(deck, 4, 800, 600, false);
    }
  }, [phase, deck]);

  // Track container size for pixel conversion
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{ minHeight: "400px" }}
    >
      {deck.map((card) => {
        const position = cardPositions[card.id];
        const pixelPosition = toPixelPosition(
          position,
          containerSize.width,
          containerSize.height,
        );

        return (
          <PlayingCard
            key={card.id}
            suit={card.suit}
            rank={card.rank}
            style={pixelPosition}
            faceUp={position.faceUp}
          />
        );
      })}
    </div>
  );
}
