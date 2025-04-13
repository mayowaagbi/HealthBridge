import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import axios from "axios";
import api from "../../api";
const MOOD_EMOJIS = [
  { label: "Happy", emoji: "😊" },
  { label: "Neutral", emoji: "😐" },
  { label: "Sad", emoji: "😢" },
  { label: "Angry", emoji: "😡" },
  { label: "Tired", emoji: "😴" },
  { label: "Sick", emoji: "🤢" },
];

export function MoodAndJournal() {
  const [selectedMood, setSelectedMood] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveEntry = async () => {
    if (!selectedMood || !journalContent) {
      alert("Please select a mood and write a journal entry.");
      return;
    }

    setLoading(true);
    console.log("Starting to save entry...");

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token not found.");
      }

      console.log("Access token found:", accessToken);

      const payload = { mood: selectedMood, journal: journalContent };
      console.log("Sending payload:", payload);

      const response = await api.post(
        "http://localhost:3000/api/entries",
        payload,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log("Server response:", response.data);

      setSelectedMood("");
      setJournalContent("");
      alert("Mood and journal saved successfully!");
    } catch (error: unknown) {
      console.error("Error saving entry:", error);

      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);

        if (error.response.status === 400) {
          alert("Invalid data. Please check your input and try again.");
        } else if (error.response.status === 401) {
          alert("Unauthorized. Please log in again.");
        } else {
          alert("Failed to save entry. Please try again later.");
        }
      } else if (axios.isAxiosError(error) && error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        alert("No response from the server. Please check your connection.");
      } else {
        // Something happened in setting up the request
        const errorMessage = (error as Error).message;
        console.error("Request setup error:", errorMessage);
        alert("Failed to send request. Please try again.");
      }
    } finally {
      setLoading(false);
      console.log("Save entry process completed.");
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Mood & Journal Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood Selection */}
        <div>
          <h3 className="text-md font-semibold">How are you feeling today?</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {MOOD_EMOJIS.map((mood) => (
              <Button
                key={mood.label}
                variant={selectedMood === mood.emoji ? "default" : "outline"}
                onClick={() => {
                  console.log("Selected mood:", mood.emoji);
                  setSelectedMood(mood.emoji);
                }}
              >
                {mood.emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* Journal Entry */}
        <div>
          <h3 className="text-md font-semibold">Journal Entry</h3>
          <Textarea
            placeholder="Write your thoughts here..."
            value={journalContent}
            onChange={(e) => {
              //   console.log("Journal content updated:", e.target.value);
              setJournalContent(e.target.value);
            }}
            className="mt-2"
          />
        </div>

        {/* Save Button */}
        <Button onClick={handleSaveEntry} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Entry"}
        </Button>
      </CardContent>
    </Card>
  );
}
