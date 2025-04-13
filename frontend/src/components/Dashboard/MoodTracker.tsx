import { useState } from "react";
import { Button } from "../../components/ui/button";

export function MoodTracker() {
  const [mood, setMood] = useState<string>("");

  const handleSelectMood = (selectedMood: string) => {
    setMood(selectedMood);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">How are you feeling today?</h3>
      <div className="flex space-x-2">
        <Button
          variant={mood === "Happy" ? "default" : "outline"}
          onClick={() => handleSelectMood("Happy")}
        >
          Happy
        </Button>
        <Button
          variant={mood === "Neutral" ? "default" : "outline"}
          onClick={() => handleSelectMood("Neutral")}
        >
          Neutral
        </Button>
        <Button
          variant={mood === "Sad" ? "default" : "outline"}
          onClick={() => handleSelectMood("Sad")}
        >
          Sad
        </Button>
      </div>
      {mood && <p className="mt-2">You selected: {mood}</p>}
    </div>
  );
}
