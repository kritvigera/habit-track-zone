import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Apple, Trash2, Plus } from "lucide-react";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  time: string;
}

export default function Nutrition() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [dailyGoal] = useState(2000);

  const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
  const progress = Math.min((totalCalories / dailyGoal) * 100, 100);

  const addFood = () => {
    if (foodName && calories) {
      const newFood: FoodItem = {
        id: Date.now().toString(),
        name: foodName,
        calories: parseInt(calories),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setFoods([...foods, newFood]);
      setFoodName("");
      setCalories("");
    }
  };

  const deleteFood = (id: string) => {
    setFoods(foods.filter((food) => food.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nutrition</h1>
        <p className="text-muted-foreground">Track your daily calorie intake</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Summary</CardTitle>
          <CardDescription>
            {totalCalories} / {dailyGoal} calories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Consumed: {totalCalories} kcal</span>
            <span>Remaining: {Math.max(0, dailyGoal - totalCalories)} kcal</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Food</CardTitle>
          <CardDescription>Add food items to track calories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Food name"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addFood()}
            />
            <Input
              type="number"
              placeholder="Calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addFood()}
              className="w-32"
            />
            <Button onClick={addFood}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Meals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {foods.map((food) => (
              <div
                key={food.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5"
              >
                <div className="flex items-center gap-4">
                  <Apple className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{food.name}</p>
                    <p className="text-sm text-muted-foreground">{food.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{food.calories} kcal</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteFood(food.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {foods.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No food logged yet. Start tracking above!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
