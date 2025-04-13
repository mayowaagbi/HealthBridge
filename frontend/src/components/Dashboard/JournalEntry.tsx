import { useState } from "react";
import { Button } from "../../components/ui/button";

export function JournalEntry() {
  const [entry, setEntry] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEntry(e.target.value);
  };

  const handleSave = () => {
    // In a real app, you'd send this to your backend instead of just alerting.
    alert("Journal saved: " + entry);
    setEntry("");
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Journal Entry</h3>
      <textarea
        className="w-full border rounded p-2"
        placeholder="Write your thoughts here..."
        value={entry}
        onChange={handleChange}
      />
      <Button className="mt-2" onClick={handleSave}>
        Save Entry
      </Button>
    </div>
  );
}
