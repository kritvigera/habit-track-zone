import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Droplet, Timer, ListChecks, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">{today}</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-accent/20 hover:border-accent/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
            <CheckSquare className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 / 8</div>
            <p className="text-xs text-muted-foreground">5 remaining</p>
            <Progress value={37.5} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-accent/20 hover:border-accent/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
            <Droplet className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2 L</div>
            <p className="text-xs text-muted-foreground">Goal: 2.5 L</p>
            <Progress value={48} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-success/20 hover:border-success/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Habits</CardTitle>
            <ListChecks className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 / 6</div>
            <p className="text-xs text-muted-foreground">2 pending</p>
            <Progress value={66.7} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-warning/20 hover:border-warning/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <Timer className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h 15m</div>
            <p className="text-xs text-muted-foreground">4 pomodoros</p>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Today's Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-accent" />
              Today's Top Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/5 transition-colors">
              <div className="h-2 w-2 rounded-full bg-accent"></div>
              <span className="flex-1">Review project proposal</span>
              <span className="text-xs text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/5 transition-colors">
              <div className="h-2 w-2 rounded-full bg-warning"></div>
              <span className="flex-1">Team meeting at 2pm</span>
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/5 transition-colors">
              <div className="h-2 w-2 rounded-full bg-muted"></div>
              <span className="flex-1">Update documentation</span>
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
            <Button className="w-full mt-2" variant="outline">
              View All Tasks
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Timer className="h-4 w-4 mr-2" />
              Start Pomodoro Timer
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Droplet className="h-4 w-4 mr-2" />
              Log Water Intake
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <ListChecks className="h-4 w-4 mr-2" />
              Check Off Habit
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CheckSquare className="h-4 w-4 mr-2" />
              Add New Task
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tasks Completed</span>
                <span className="text-sm text-muted-foreground">18 / 35</span>
              </div>
              <Progress value={51.4} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Daily Habits</span>
                <span className="text-sm text-muted-foreground">28 / 42</span>
              </div>
              <Progress value={66.7} className="[&>div]:bg-success" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Workout Days</span>
                <span className="text-sm text-muted-foreground">4 / 5</span>
              </div>
              <Progress value={80} className="[&>div]:bg-warning" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
