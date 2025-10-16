import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const totalSeconds = isBreak ? 5 * 60 : 25 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            setIsActive(false);
            if (!isBreak) {
              setCompletedPomodoros(completedPomodoros + 1);
            }
            // Auto-switch to break or work
            setIsBreak(!isBreak);
            setMinutes(isBreak ? 25 : 5);
            setSeconds(0);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isBreak, completedPomodoros]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(isBreak ? 5 : 25);
    setSeconds(0);
  };

  const switchMode = () => {
    setIsActive(false);
    setIsBreak(!isBreak);
    setMinutes(isBreak ? 25 : 5);
    setSeconds(0);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Pomodoro Timer</h2>
        <p className="text-muted-foreground">Focus with the Pomodoro Technique</p>
      </div>

      <Card className={isBreak ? "border-success/20" : "border-warning/20"}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isBreak ? (
                <Coffee className="h-5 w-5 text-success" />
              ) : (
                <Play className="h-5 w-5 text-warning" />
              )}
              {isBreak ? "Break Time" : "Focus Time"}
            </span>
            <Button variant="outline" size="sm" onClick={switchMode}>
              Switch to {isBreak ? "Work" : "Break"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-8xl font-bold tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="flex gap-3 justify-center">
            <Button size="lg" onClick={toggleTimer} className="min-w-[150px]">
              {isActive ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button size="lg" variant="outline" onClick={resetTimer}>
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Completed Today</p>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 w-3 rounded-full ${
                    i < completedPomodoros ? "bg-warning" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-2xl font-bold mt-2">{completedPomodoros}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">1. Work for 25 minutes with full focus</p>
          <p className="text-sm">2. Take a 5-minute break</p>
          <p className="text-sm">3. After 4 pomodoros, take a longer 15-30 minute break</p>
          <p className="text-sm">4. Repeat to maintain peak productivity</p>
        </CardContent>
      </Card>
    </div>
  );
}
