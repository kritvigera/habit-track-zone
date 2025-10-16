import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { BookOpen, Trash2, Pen } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
}

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const addEntry = () => {
    if (title && content) {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        title,
        content,
      };
      setEntries([newEntry, ...entries]);
      setTitle("");
      setContent("");
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8" />
          <h1 className="text-4xl font-serif font-bold tracking-tight">My Journal</h1>
        </div>
        <p className="text-muted-foreground italic">A space for your thoughts and reflections</p>
      </div>

      {/* New Entry Section */}
      <Card className="shadow-elegant">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Pen className="h-4 w-4" />
              <span>New Entry - {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <Input
              placeholder="Give your entry a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-serif border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground"
            />
            <Textarea
              placeholder="Pour your thoughts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-none border-0 focus-visible:ring-0 text-base leading-relaxed"
            />
            <div className="flex justify-end">
              <Button onClick={addEntry} size="lg">
                <BookOpen className="mr-2 h-4 w-4" />
                Save Entry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Past Entries */}
      <div className="space-y-6">
        {entries.length > 0 && (
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <h2 className="text-xl font-serif font-semibold">Previous Entries</h2>
            <Separator className="flex-1" />
          </div>
        )}

        {entries.map((entry) => (
          <Card key={entry.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Entry Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-serif font-bold mb-1">{entry.title}</h3>
                    <p className="text-sm text-muted-foreground italic">{entry.date}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEntry(entry.id)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Separator />

                {/* Entry Content */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {entry.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {entries.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-16">
              <div className="text-center space-y-2">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground italic">
                  Your journal is empty. Start documenting your journey above.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
