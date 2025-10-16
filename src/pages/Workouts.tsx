import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Trash2, Plus } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface Workout {
  id: string;
  date: string;
  exercises: Exercise[];
}

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentExercises, setCurrentExercises] = useState<Exercise[]>([]);
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const addExercise = () => {
    if (exerciseName && sets && reps) {
      const newExercise: Exercise = {
        id: Date.now().toString(),
        name: exerciseName,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight) || 0,
      };
      setCurrentExercises([...currentExercises, newExercise]);
      setExerciseName("");
      setSets("");
      setReps("");
      setWeight("");
    }
  };

  const saveWorkout = () => {
    if (currentExercises.length > 0) {
      const newWorkout: Workout = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        exercises: currentExercises,
      };
      setWorkouts([newWorkout, ...workouts]);
      setCurrentExercises([]);
    }
  };

  const deleteExercise = (id: string) => {
    setCurrentExercises(currentExercises.filter((ex) => ex.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
        <p className="text-muted-foreground">Track your fitness journey</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Exercise</CardTitle>
          <CardDescription>Add exercises to your workout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Input
              placeholder="Exercise name"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="col-span-2"
            />
            <Input
              type="number"
              placeholder="Sets"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Weight (optional)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <Button onClick={addExercise}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {currentExercises.length > 0 && (
            <div className="space-y-2 pt-4">
              <h3 className="font-semibold">Current Workout</h3>
              {currentExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div>
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets} sets × {exercise.reps} reps
                      {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteExercise(exercise.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={saveWorkout} className="w-full">
                <Dumbbell className="mr-2 h-4 w-4" />
                Save Workout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Workout History</h2>
        {workouts.map((workout) => (
          <Card key={workout.id}>
            <CardHeader>
              <CardTitle>{workout.date}</CardTitle>
              <CardDescription>{workout.exercises.length} exercises</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.id} className="flex justify-between text-sm">
                    <span className="font-medium">{exercise.name}</span>
                    <span className="text-muted-foreground">
                      {exercise.sets}×{exercise.reps}
                      {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {workouts.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No workouts logged yet. Start tracking above!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
