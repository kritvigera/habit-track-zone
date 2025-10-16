import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Trash2 } from "lucide-react";

interface SleepRecord {
  id: string;
  date: string;
  bedtime: string;
  wakeup: string;
  duration: string;
  quality: number;
}

export default function Sleep() {
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [bedtime, setBedtime] = useState("");
  const [wakeup, setWakeup] = useState("");
  const [quality, setQuality] = useState("3");

  const calculateDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    let hours = endH - startH;
    let minutes = endM - startM;
    
    if (hours < 0) hours += 24;
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const addSleepRecord = () => {
    if (bedtime && wakeup) {
      const newRecord: SleepRecord = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        bedtime,
        wakeup,
        duration: calculateDuration(bedtime, wakeup),
        quality: parseInt(quality),
      };
      setSleepRecords([newRecord, ...sleepRecords]);
      setBedtime("");
      setWakeup("");
      setQuality("3");
    }
  };

  const deleteRecord = (id: string) => {
    setSleepRecords(sleepRecords.filter((record) => record.id !== id));
  };

  const avgQuality = sleepRecords.length > 0
    ? (sleepRecords.reduce((sum, r) => sum + r.quality, 0) / sleepRecords.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sleep</h1>
        <p className="text-muted-foreground">Track your sleep patterns</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sleep Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Records</span>
                <span className="font-semibold">{sleepRecords.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Quality</span>
                <span className="font-semibold">{avgQuality}/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Log Sleep</CardTitle>
            <CardDescription>Record your sleep session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-muted-foreground">Bedtime</label>
                <Input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Wake up</label>
                <Input
                  type="time"
                  value={wakeup}
                  onChange={(e) => setWakeup(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Quality (1-5)</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
              />
            </div>
            <Button onClick={addSleepRecord} className="w-full">
              <Moon className="mr-2 h-4 w-4" />
              Save Sleep Record
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sleep History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sleepRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5"
              >
                <div className="flex items-center gap-4">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{record.date}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.bedtime} - {record.wakeup} ({record.duration})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Quality: {record.quality}/5</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRecord(record.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {sleepRecords.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No sleep records yet. Start tracking above!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
