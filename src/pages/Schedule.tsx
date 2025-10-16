import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Trash2, Plus, Clock } from "lucide-react";
import { format } from "date-fns";

interface ScheduleItem {
  id: string;
  date: string;
  time: string;
  activity: string;
}

export default function Schedule() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { id: "1", date: format(new Date(), "yyyy-MM-dd"), time: "09:00", activity: "Morning workout" },
    { id: "2", date: format(new Date(), "yyyy-MM-dd"), time: "10:00", activity: "Team meeting" },
  ]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newTime, setNewTime] = useState("");
  const [newActivity, setNewActivity] = useState("");

  const addScheduleItem = () => {
    if (newTime && newActivity && selectedDate) {
      const newItem: ScheduleItem = {
        id: Date.now().toString(),
        date: format(selectedDate, "yyyy-MM-dd"),
        time: newTime,
        activity: newActivity,
      };
      setScheduleItems([...scheduleItems, newItem].sort((a, b) => 
        a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)
      ));
      setNewTime("");
      setNewActivity("");
    }
  };

  const deleteItem = (id: string) => {
    setScheduleItems(scheduleItems.filter((item) => item.id !== id));
  };

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const todayItems = scheduleItems.filter((item) => item.date === selectedDateStr);
  
  const datesWithActivities = scheduleItems.reduce((acc, item) => {
    acc[item.date] = (acc[item.date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground">Plan your day efficiently</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Schedule Item</CardTitle>
          <CardDescription>Add activities to {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "selected date"}</CardDescription>
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

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
              </CardTitle>
              <CardDescription>{todayItems.length} activities scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline axis */}
                <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-border" />
                
                {/* Time slots */}
                <div className="space-y-0">
                  {timeSlots.map((timeSlot) => {
                    const itemsAtTime = todayItems.filter((item) => item.time === timeSlot);
                    const hasItems = itemsAtTime.length > 0;

                    return (
                      <div key={timeSlot} className="relative flex items-start min-h-[60px]">
                        {/* Time label */}
                        <div className="w-14 flex-shrink-0 text-sm font-mono text-muted-foreground pt-1">
                          {timeSlot}
                        </div>

                        {/* Timeline dot */}
                        <div className={`relative z-10 w-3 h-3 rounded-full mt-2 ml-2.5 mr-4 flex-shrink-0 ${
                          hasItems ? 'bg-primary' : 'bg-muted'
                        }`} />

                        {/* Activities */}
                        <div className="flex-1 space-y-2 pt-0.5">
                          {itemsAtTime.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5"
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
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
                        </div>
                      </div>
                    );
                  })}
                </div>

                {todayItems.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No activities scheduled for this day.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
                <CardDescription>Select a date to view or add activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasActivities: (date) => {
                      const dateStr = format(date, "yyyy-MM-dd");
                      return dateStr in datesWithActivities;
                    }
                  }}
                  modifiersStyles={{
                    hasActivities: {
                      fontWeight: 'bold',
                      textDecoration: 'underline',
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                </CardTitle>
                <CardDescription>
                  {todayItems.length} {todayItems.length === 1 ? 'activity' : 'activities'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {todayItems.map((item) => (
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
                  {todayItems.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No activities for this date.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
