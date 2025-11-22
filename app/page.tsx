"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { GameScreen, GamePhase } from "@/components/game/GameScreen";

export default function Home() {
  const [health, setHealth] = useState(100);
  const [mana, setMana] = useState(50);
  const [cards, setCards] = useState(5);
  const [betAmount, setBetAmount] = useState([50]);
  const [gamePhase, setGamePhase] = useState<GamePhase>("start");
  const [gameHistory, setGameHistory] = useState([
    { id: 1, result: "Win", score: 150, timestamp: "2 min ago" },
    { id: 2, result: "Loss", score: 0, timestamp: "5 min ago" },
    { id: 3, result: "Win", score: 200, timestamp: "8 min ago" },
    { id: 4, result: "Win", score: 175, timestamp: "12 min ago" },
    { id: 5, result: "Loss", score: 0, timestamp: "15 min ago" },
  ]);

  const handleDraw = () => {
    // Toggle between phases in a circle: start -> deal -> start
    setGamePhase((prev) => (prev === "start" ? "deal" : "start"));
    setCards((prev) => prev + 1);
    setMana((prev) => Math.max(0, prev - 10));
  };

  const handlePlay = () => {
    if (cards > 0) {
      setCards((prev) => prev - 1);
      const won = Math.random() > 0.5;
      setHealth((prev) => (won ? prev + 5 : Math.max(0, prev - 15)));

      setGameHistory((prev) => [
        {
          id: Date.now(),
          result: won ? "Win" : "Loss",
          score: won ? betAmount[0] : 0,
          timestamp: "Just now",
        },
        ...prev,
      ]);
    }
  };

  const handleReset = () => {
    setHealth(100);
    setMana(50);
    setCards(5);
    setBetAmount([50]);
  };

  return (
    <div className="flex min-h-screen">
      {/* Main Game Area */}
      <div className="flex-1 flex flex-col p-6">
        {/* Test States at Top - Hidden on Mobile */}
        <div className="mb-6 hidden lg:block">
          <h1 className="text-2xl mb-4 font-bold">Card Game Terminal</h1>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{health}</div>
                <div className="text-xs text-muted-foreground mt-1">/ 100</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Mana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{mana}</div>
                <div className="text-xs text-muted-foreground mt-1">/ 100</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{cards}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  in hand
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Title - Shown only on Mobile */}
        <h1 className="text-2xl mb-4 font-bold lg:hidden">
          Card Game Terminal
        </h1>

        {/* Game Display Area */}
        <Card className="flex-1 mb-6 md:mb-6">
          <CardContent className="p-0 h-full">
            <GameScreen phase={gamePhase} />
          </CardContent>
        </Card>

        {/* Action Buttons and Dials at Bottom - Hidden on Mobile */}
        <div className="space-y-4 hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bet Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Slider
                value={betAmount}
                onValueChange={setBetAmount}
                max={200}
                step={10}
                className="w-full"
              />
              <div className="text-right font-bold">${betAmount[0]}</div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-4 gap-3">
            <Button onClick={handleDraw} disabled={mana < 10}>
              Draw
            </Button>
            <Button onClick={handlePlay} disabled={cards === 0}>
              Play
            </Button>
            <Button onClick={handleReset} variant="destructive">
              Reset
            </Button>
            <Button variant="outline">Pass</Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Game History - Hidden on Mobile */}
      <div className="w-80 border-l p-6 hidden lg:block">
        <h2 className="text-xl font-bold mb-4">Game History</h2>
        <Separator className="mb-4" />
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-3">
            {gameHistory.map((game) => (
              <Card key={game.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold">{game.result}</span>
                    <span className="text-xs text-muted-foreground">
                      {game.timestamp}
                    </span>
                  </div>
                  <div className="text-sm">
                    Score: <span className="font-bold">{game.score}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Menu Button - Bottom Right - Shown only on Mobile */}
      <div className="lg:hidden fixed bottom-6 right-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 shadow-lg"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[400px]">
            <SheetHeader>
              <SheetTitle>Game Controls</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Bet Amount</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Slider
                    value={betAmount}
                    onValueChange={setBetAmount}
                    max={200}
                    step={10}
                    className="w-full"
                  />
                  <div className="text-right font-bold">${betAmount[0]}</div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleDraw} disabled={mana < 10}>
                  Draw
                </Button>
                <Button onClick={handlePlay} disabled={cards === 0}>
                  Play
                </Button>
                <Button onClick={handleReset} variant="destructive">
                  Reset
                </Button>
                <Button variant="outline">Pass</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
