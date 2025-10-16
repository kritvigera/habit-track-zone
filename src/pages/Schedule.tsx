import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

interface ScheduleItem {
  id: string;
  time: string;
  activity: string;
}

export default function Schedule() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { id: "1", time: "09:00", activity: "Morning workout" },
    { id: "2", time: "10:00", activity: "Team meeting" },
  ]);
  const [newTime, setNewTime] = useState("");
  const [newActivity, setNewActivity] = useState("");

  const addScheduleItem = () => {
    if (newTime && newActivity) {
      const newItem: ScheduleItem = {
        id: Date.now().toString(),
        time: newTime,
        activity: newActivity,
      };
      setScheduleItems([...scheduleItems, newItem].sort((a, b) => a.time.localeCompare(b.time)));
      setNewTime("");
      setNewActivity("");
    }
  };

  const deleteItem = (id: string) => {
    setScheduleItems(scheduleItems.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground">Plan your day efficiently</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Schedule Item</CardTitle>
          <CardDescription>Add activities to your daily schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-32"
            />
            <Input
              type="text"
              placeholder="Activity"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addScheduleItem()}
            />
            <Button onClick={addScheduleItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {scheduleItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-semibold">{item.time}</span>
                  <span>{item.activity}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {scheduleItems.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No activities scheduled. Add one above!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
