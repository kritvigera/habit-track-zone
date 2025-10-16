import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

export default function Todos() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Review project proposal", completed: false, priority: "high" },
    { id: 2, text: "Team meeting at 2pm", completed: false, priority: "medium" },
    { id: 3, text: "Update documentation", completed: false, priority: "low" },
    { id: 4, text: "Respond to emails", completed: true, priority: "medium" },
  ]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: newTodo,
          completed: false,
          priority: "medium",
        },
      ]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Todo List</h2>
        <p className="text-muted-foreground">Manage your daily tasks and priorities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="What needs to be done?"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTodo()}
            />
            <Button onClick={addTodo}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Tasks ({todos.filter((t) => !t.completed).length} pending)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent/5 transition-colors"
            >
              <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
              <span className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                {todo.text}
              </span>
              <Badge className={getPriorityColor(todo.priority)} variant="secondary">
                {todo.priority}
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {todos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tasks yet. Add your first task above!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
