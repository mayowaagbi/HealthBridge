import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const moods = [
  { value: "1", label: "😢 Sad" },
  { value: "2", label: "😕 Meh" },
  { value: "3", label: "😐 Okay" },
  { value: "4", label: "🙂 Good" },
  { value: "5", label: "😄 Great" },
];

export function MoodTracker() {
  const [mood, setMood] = useState<string>("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Mood submitted:", mood);
    // Here you would typically send this data to your backend
  };

  return (
    <form onSubmit={handleSubmit}>
      <RadioGroup
        value={mood}
        onValueChange={setMood}
        className="flex justify-between mb-4"
      >
        {moods.map((m) => (
          <div key={m.value} className="flex flex-col items-center">
            <RadioGroupItem
              value={m.value}
              id={`mood-${m.value}`}
              className="sr-only"
            />
            <Label
              htmlFor={`mood-${m.value}`}
              className={`cursor-pointer text-2xl ${
                mood === m.value ? "scale-125" : ""
              } transition-transform`}
            >
              {m.label.split(" ")[0]}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <Button type="submit" className="w-full" disabled={!mood}>
        Log Mood
      </Button>
    </form>
  );
}
