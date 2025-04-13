import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = "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"; // 🔐 Replace with your actual key

const BMICalculator: React.FC = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [result, setResult] = useState<{
    bmi: number;
    category: string;
    suggestions: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculateBMI = async () => {
    setError(null);
    if (!height || !weight) {
      setError("Please enter both height and weight");
      return;
    }

    const heightValue = parseFloat(height);
    const weightValue = parseFloat(weight);
    if (isNaN(heightValue) || isNaN(weightValue)) {
      setError("Please enter valid numbers");
      return;
    }

    if (heightValue <= 0 || weightValue <= 0) {
      setError("Height and weight must be greater than zero");
      return;
    }

    setLoading(true);
    try {
      let bmiValue: number;
      if (unit === "metric") {
        bmiValue = weightValue / Math.pow(heightValue / 100, 2);
      } else {
        bmiValue = (weightValue * 703) / Math.pow(heightValue, 2);
      }
      bmiValue = Math.round(bmiValue * 10) / 10;

      const suggestion = await getBMISuggestions(bmiValue);
      setResult({
        bmi: bmiValue,
        category:
          bmiValue < 18.5
            ? "Underweight"
            : bmiValue < 25
            ? "Normal"
            : bmiValue < 30
            ? "Overweight"
            : "Obese",
        suggestions: [suggestion],
      });
    } catch (err) {
      console.error(err);
      setError("Failed to get suggestion.");
    } finally {
      setLoading(false);
    }
  };

  const getBMISuggestions = async (bmi: number): Promise<string> => {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 1,
        max_tokens: 100,
        top_p: 1,
        messages: [
          {
            role: "system",
            content:
              "Give helpful BMI suggestions. No greetings or extra text.",
          },
          {
            role: "user",
            content: `My BMI is ${bmi}.`,
          },
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    return reply?.trim() || "No suggestion available.";
  };

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>BMI Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Height ({unit === "metric" ? "cm" : "inches"})</Label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Enter your height"
          />
        </div>

        <div>
          <Label>Weight ({unit === "metric" ? "kg" : "lbs"})</Label>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter your weight"
          />
        </div>

        <div>
          <Label>Unit</Label>
          <Select
            value={unit}
            onValueChange={(val) => setUnit(val as "metric" | "imperial")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Metric (kg/cm)</SelectItem>
              <SelectItem value="imperial">Imperial (lbs/inches)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleCalculateBMI}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Calculating..." : "Calculate BMI"}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && <Skeleton className="w-full h-16" />}

        {result && (
          <Card className="mt-4 bg-muted">
            <CardContent className="space-y-2 py-4">
              <p>
                <strong>BMI:</strong> {result.bmi}
              </p>
              <p>
                <strong>Category:</strong> {result.category}
              </p>
              <p>
                <strong>Suggestion:</strong> {result.suggestions[0]}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default BMICalculator;
