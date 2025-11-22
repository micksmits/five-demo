"use client";

import { motion } from "framer-motion";
import { Heart, Spade, Club, Diamond, Crown, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export type Suit = "hearts" | "spades" | "clubs" | "diamonds";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export interface PlayingCardProps {
  suit: Suit;
  rank: Rank;
  className?: string;
  style?: React.CSSProperties;
  faceUp?: boolean;
}

const suitIcons = {
  hearts: Heart,
  spades: Spade,
  clubs: Club,
  diamonds: Diamond,
};

const suitColors = {
  hearts: "text-red-500",
  spades: "text-black",
  clubs: "text-black",
  diamonds: "text-red-500",
};

const getRankDisplay = (rank: Rank) => {
  switch (rank) {
    case "J":
      return { icon: User, label: "J" };
    case "Q":
      return { icon: User, label: "Q" };
    case "K":
      return { icon: Crown, label: "K" };
    default:
      return { icon: null, label: rank };
  }
};

export function PlayingCard({
  suit,
  rank,
  className = "",
  style,
  faceUp = true,
}: PlayingCardProps) {
  const SuitIcon = suitIcons[suit];
  const suitColor = suitColors[suit];
  const { icon: RankIcon, label } = getRankDisplay(rank);

  return (
    <motion.div className={className} style={style}>
      <Card
        className="w-20 h-30 relative bg-white dark:bg-white flex items-center justify-center overflow-hidden rounded-none shadow-xs"
        // style={{ boxShadow: "inset 0 0 0 3px #A08F8C" }}
      >
        {faceUp ? (
          <>
            {/* Top Left Corner */}
            <div
              className={`absolute top-1 left-1 flex flex-col items-center ${suitColor}`}
            >
              <span className="text-xs font-bold">{rank}</span>
              <SuitIcon className="w-2 h-2" fill="currentColor" />
            </div>

            {/* Center */}
            <div
              className={`flex flex-col items-center justify-center ${suitColor}`}
            >
              {RankIcon ? (
                <RankIcon className="w-8 h-8" strokeWidth={1.5} />
              ) : (
                <span className="text-3xl font-bold">{label}</span>
              )}
              <SuitIcon className="w-5 h-5 mt-1" fill="currentColor" />
            </div>

            {/* Bottom Right Corner (rotated) */}
            <div
              className={`absolute bottom-1 right-1 flex flex-col items-center rotate-180 ${suitColor}`}
            >
              <span className="text-xs font-bold">{rank}</span>
              <SuitIcon className="w-2 h-2" fill="currentColor" />
            </div>
          </>
        ) : (
          <>
            <Image
              src="/card.png"
              alt="Card back"
              fill
              className="object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: "inset 0 0 0 2px #A08F8C" }}
            />
          </>
        )}
      </Card>
    </motion.div>
  );
}
