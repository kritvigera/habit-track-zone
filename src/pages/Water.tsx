import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Droplet, Plus, Minus } from "lucide-react";

export default function Water() {
  const [intake, setIntake] = useState(1200); // in ml
  const goal = 2500; // in ml
  const glassSize = 250; // in ml

  const addGlass = () => {
    if (intake < goal) {
      setIntake(Math.min(intake + glassSize, goal));
    }
  };

  const removeGlass = () => {
    if (intake > 0) {
      setIntake(Math.max(intake - glassSize, 0));
    }
  };

  const percentage = (intake / goal) * 100;
  const glasses = Math.floor(intake / glassSize);
  const goalGlasses = Math.floor(goal / glassSize);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Water Tracker</h2>
        <p className="text-muted-foreground">Stay hydrated throughout the day</p>
      </div>

      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-accent" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-end gap-1">
              <span className="text-6xl font-bold text-accent">{intake / 1000}</span>
              <span className="text-2xl text-muted-foreground mb-2">L</span>
            </div>
            <p className="text-lg text-muted-foreground">
              of {goal / 1000}L goal
            </p>
            <Progress value={percentage} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {glasses} / {goalGlasses} glasses ({glassSize}ml each)
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button size="lg" variant="outline" onClick={removeGlass} disabled={intake === 0}>
              <Minus className="h-5 w-5" />
            </Button>
            <Button size="lg" onClick={addGlass} disabled={intake >= goal} className="min-w-[150px]">
              <Plus className="h-5 w-5 mr-2" />
              Add Glass
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-3 mt-6">
            {Array.from({ length: goalGlasses }).map((_, i) => (
              <div
                key={i}
                className={`h-16 rounded-lg border-2 flex items-center justify-center transition-all ${
                  i < glasses
                    ? "bg-accent/20 border-accent"
                    : "bg-muted/20 border-muted"
                }`}
              >
                <Droplet
                  className={`h-6 w-6 ${
                    i < glasses ? "text-accent fill-accent" : "text-muted"
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hydration Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">• Drink a glass of water when you wake up</p>
          <p className="text-sm">• Keep a water bottle at your desk</p>
          <p className="text-sm">• Set reminders every 2 hours</p>
          <p className="text-sm">• Drink before, during, and after exercise</p>
        </CardContent>
      </Card>
    </div>
  );
}
