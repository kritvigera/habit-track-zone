import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ListChecks } from "lucide-react";

interface Habit {
  id: number;
  name: string;
  completed: boolean;
  streak: number;
}

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: 1, name: "Morning meditation", completed: true, streak: 12 },
    { id: 2, name: "Exercise", completed: true, streak: 8 },
    { id: 3, name: "Read for 30 minutes", completed: false, streak: 5 },
    { id: 4, name: "Journal entry", completed: true, streak: 15 },
    { id: 5, name: "Drink 2L water", completed: true, streak: 20 },
    { id: 6, name: "No social media before 9am", completed: false, streak: 3 },
  ]);

  const toggleHabit = (id: number) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  const completedCount = habits.filter((h) => h.completed).length;
  const percentage = (completedCount / habits.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Daily Habits</h2>
        <p className="text-muted-foreground">Track your daily routines and build consistency</p>
      </div>

      <Card className="border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-success" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-success">
              {completedCount} / {habits.length}
            </div>
            <p className="text-sm text-muted-foreground">habits completed</p>
            <Progress value={percentage} className="h-3 [&>div]:bg-success" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Habits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/5 transition-colors"
            >
              <Checkbox checked={habit.completed} onCheckedChange={() => toggleHabit(habit.id)} />
              <span className={`flex-1 ${habit.completed ? "line-through text-muted-foreground" : ""}`}>
                {habit.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-warning">{habit.streak}</span>
                <span className="text-xs text-muted-foreground">day streak</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={day} className="text-center">
                <div className="text-xs text-muted-foreground mb-2">{day}</div>
                <div
                  className={`h-12 rounded-lg border-2 flex items-center justify-center ${
                    i < 4
                      ? "bg-success/20 border-success"
                      : i === 4
                      ? "bg-warning/20 border-warning"
                      : "bg-muted/20 border-muted"
                  }`}
                >
                  {i < 4 ? (
                    <span className="text-sm font-bold text-success">6/6</span>
                  ) : i === 4 ? (
                    <span className="text-sm font-bold text-warning">{completedCount}/6</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
