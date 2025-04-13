import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export function JournalEntry() {
  const [entry, setEntry] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Journal entry submitted:", entry);
    // Here you would typically send this data to your backend
    setEntry("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Write your thoughts here..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        className="min-h-[100px]"
      />
      <Button type="submit" className="w-full" disabled={!entry.trim()}>
        Save Entry
      </Button>
    </form>
  );
}
