import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";

// Minimum recommended values
const MIN_STEPS = 5000;
const MIN_WATER_ML = 1500; // 1.5 liters

export default function SetNewGoal() {
  const [goalType, setGoalType] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!goalType || !goalTarget) {
        throw new Error("Please select a goal type and enter a target.");
      }

      const numericTarget = Number(goalTarget);
      if (isNaN(numericTarget)) {
        throw new Error("Please enter a valid number for the target.");
      }

      // Validate minimum values
      if (goalType === "steps" && numericTarget < MIN_STEPS) {
        throw new Error(`Minimum step goal is ${MIN_STEPS.toLocaleString()}`);
      }

      if (goalType === "water" && numericTarget < MIN_WATER_ML) {
        throw new Error(`Minimum water goal is ${MIN_WATER_ML}ml`);
      }

      // Submit to backend
      const response = await fetch(
        `http://localhost:3000/api/goals/${goalType}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ target: numericTarget }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update goal");
      }

      toast.success("Goal updated successfully!");
      setGoalType("");
      setGoalTarget("");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set New Health Goal</CardTitle>
        <CardDescription>
          Define a new health objective to work towards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-type">Goal Type</Label>
            <Select onValueChange={setGoalType} value={goalType}>
              <SelectTrigger id="goal-type">
                <SelectValue placeholder="Select a goal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="steps">
                  Daily Steps (min {MIN_STEPS.toLocaleString()})
                </SelectItem>
                <SelectItem value="water">
                  Water Intake (min {MIN_WATER_ML}ml)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-target">Target</Label>
            <Input
              id="goal-target"
              placeholder="Enter your target"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              type="number"
              min={goalType === "steps" ? MIN_STEPS : MIN_WATER_ML}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Set Goal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
