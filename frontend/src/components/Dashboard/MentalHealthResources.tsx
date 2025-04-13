import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { BookOpen } from "lucide-react";
import { LoadingSpinner } from "../LoadingSpinner";

export default function MentalHealthResources() {
  interface Article {
    title: string;
    source: string;
    url: string;
  }

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          "https://newsapi.org/v2/top-headlines?country=us&category=health&apiKey=54b9dbfa5cec42d8ae0f99925d739e58"
        );

        // Extract only relevant article details
        interface ApiResponse {
          articles: ApiArticle[];
        }

        interface ApiArticle {
          title: string;
          source: {
            name: string;
          };
          url: string;
        }

        const formattedArticles: Article[] = response.data.articles.map(
          (article: ApiArticle) => ({
            title: article.title,
            source: article.source.name,
            url: article.url,
          })
        );

        setArticles(formattedArticles.slice(0, 5)); // Limit to 5 articles
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  return (
    <Card>
      <CardHeader>
        {/* <CardTitle>Latest Mental Health News</CardTitle>
        <CardDescription>Stay updated with key health insights</CardDescription> */}
      </CardHeader>
      <CardContent className="border-0">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ul className="space-y-2">
            {articles.map((article, index) => (
              <li key={index} className="border-b pb-2">
                <a
                  href={article.url} // Use the external URL directly
                  target="_blank" // Open in a new tab
                  rel="noopener noreferrer" // Security best practice
                  className="flex items-center text-blue-600 hover:underline"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  {article.title}
                </a>
                <p className="text-xs text-gray-500">
                  Source: {article.source}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
