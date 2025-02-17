import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { LoadingSpinner } from "./LoadingSpinner";

interface SEOAnalysisResult {
  primaryKeywords: Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
    relevance: number;
    intent: string;
  }>;
  secondaryKeywords: Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
    parentKeyword: string;
  }>;
  contentSuggestions: Array<{
    title: string;
    description: string;
    targetKeywords: string[];
    estimatedDifficulty: number;
  }>;
  optimization: {
    titleSuggestions: string[];
    metaDescription: string;
    headingStructure: string[];
    contentGaps: string[];
  };
}

export function SEOAnalyzer() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [existingContent, setExistingContent] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOAnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !targetMarket) {
      setError("Topic and target market are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/seo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetMarket,
          existingContent: existingContent || undefined,
          competitors: competitors
            ? competitors.split(",").map((c) => c.trim())
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze SEO opportunities");
      }

      const data = await response.json();
      setResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to use the SEO Analyzer</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">SEO Analyzer</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Topic *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your main topic"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Target Market *
          </label>
          <input
            type="text"
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., US, Global, specific demographic"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Existing Content
          </label>
          <textarea
            value={existingContent}
            onChange={(e) => setExistingContent(e.target.value)}
            className="w-full p-2 border rounded h-32"
            placeholder="Paste your existing content here (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Competitors</label>
          <input
            type="text"
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Competitor URLs (comma-separated)"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? <LoadingSpinner /> : "Analyze SEO"}
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Primary Keywords</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.primaryKeywords.map((kw, i) => (
                <div key={i} className="p-4 border rounded">
                  <div className="font-medium">{kw.keyword}</div>
                  <div className="text-sm text-gray-600">
                    Volume: {kw.searchVolume.toLocaleString()}
                    <br />
                    Difficulty: {kw.difficulty}/100
                    <br />
                    Relevance: {kw.relevance}/10
                    <br />
                    Intent: {kw.intent}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Content Suggestions</h2>
            <div className="space-y-4">
              {result.contentSuggestions.map((suggestion, i) => (
                <div key={i} className="p-4 border rounded">
                  <div className="font-medium">{suggestion.title}</div>
                  <p className="text-gray-600 mt-2">{suggestion.description}</p>
                  <div className="mt-2">
                    <span className="text-sm font-medium">Keywords: </span>
                    {suggestion.targetKeywords.join(", ")}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Difficulty: {suggestion.estimatedDifficulty}/100
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Optimization Tips</h2>
            <div className="p-4 border rounded">
              <div className="mb-4">
                <h3 className="font-medium">Title Suggestions</h3>
                <ul className="list-disc ml-4 mt-2">
                  {result.optimization.titleSuggestions.map((title, i) => (
                    <li key={i}>{title}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="font-medium">Meta Description</h3>
                <p className="mt-2 text-gray-600">
                  {result.optimization.metaDescription}
                </p>
              </div>

              <div>
                <h3 className="font-medium">Content Gaps</h3>
                <ul className="list-disc ml-4 mt-2">
                  {result.optimization.contentGaps.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
