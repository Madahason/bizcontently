import Anthropic from "@anthropic-ai/sdk";
import { SceneElement, VisualSearchCriteria } from "./types";

interface AnalysisResult {
  elements: SceneElement[];
  style: string;
  mood: string;
  colorScheme: string[];
}

export class SceneAnalyzer {
  private anthropic: Anthropic;

  constructor() {
    // Get API key from environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error("Anthropic API key not found in environment variables");
      throw new Error(
        "Anthropic API key is not configured. Please add a valid API key to your .env file."
      );
    }

    try {
      this.anthropic = new Anthropic({
        apiKey: apiKey,
      });
    } catch (error) {
      console.error("Failed to initialize Anthropic client:", error);
      throw new Error(
        "Failed to initialize Anthropic client. Please check your API key configuration."
      );
    }
  }

  private async analyzeWithClaude(
    sceneDescription: string
  ): Promise<AnalysisResult> {
    try {
      // Validate input
      if (!sceneDescription || sceneDescription.trim().length === 0) {
        throw new Error("Scene description cannot be empty");
      }

      const prompt = `Analyze the following scene description and extract key visual elements. Format the response as JSON with the following structure:
{
  "elements": [
    {
      "type": "character" | "location" | "object",
      "description": "detailed description",
      "importance": number between 0-1,
      "attributes": {
        relevant attributes like age, gender, color, size, etc.
      }
    }
  ],
  "style": "suggested visual style (cinematic/documentary/animated/corporate/casual/artistic/minimal)",
  "mood": "emotional tone of the scene",
  "colorScheme": ["primary color", "secondary color", "accent color"]
}

Scene description: "${sceneDescription}"

Respond with ONLY the JSON, no other text.`;

      const message = await this.anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        temperature: 0.7,
        system:
          "You are a professional cinematographer and visual analyst. Extract visual elements from scene descriptions. Respond with valid JSON only.",
        messages: [{ role: "user", content: prompt }],
      });

      // Get the first content block and ensure it's text
      const contentBlock = message.content[0];
      if (!contentBlock || contentBlock.type !== "text" || !contentBlock.text) {
        throw new Error("Invalid response format from Claude");
      }

      // Clean and parse the response
      const cleanedText = contentBlock.text.trim();
      try {
        const result = JSON.parse(cleanedText);
        return this.validateAnalysisResult(result);
      } catch (parseError) {
        console.error("Failed to parse Claude response:", cleanedText);
        console.error("Parse error:", parseError);
        throw new Error("Invalid JSON response from Claude");
      }
    } catch (error) {
      console.error("Claude analysis error:", error);
      throw error;
    }
  }

  private validateAnalysisResult(result: any): AnalysisResult {
    // Validate required fields
    if (!result.elements || !Array.isArray(result.elements)) {
      throw new Error("Invalid response: missing or invalid elements array");
    }
    if (!result.style || typeof result.style !== "string") {
      throw new Error("Invalid response: missing or invalid style");
    }
    if (!result.mood || typeof result.mood !== "string") {
      throw new Error("Invalid response: missing or invalid mood");
    }
    if (!result.colorScheme || !Array.isArray(result.colorScheme)) {
      throw new Error("Invalid response: missing or invalid colorScheme");
    }

    // Validate and clean up elements
    result.elements = result.elements.map((element: any) => ({
      type: element.type || "object",
      description: element.description || "",
      importance: Math.max(0, Math.min(1, element.importance || 0.5)),
      attributes: element.attributes || {},
    }));

    return result as AnalysisResult;
  }

  public async analyzeScene(
    sceneDescription: string
  ): Promise<VisualSearchCriteria> {
    const analysis = await this.analyzeWithClaude(sceneDescription);

    // Validate and process the elements
    const validatedElements = analysis.elements.map((element) => ({
      ...element,
      importance: Math.max(0, Math.min(1, element.importance)), // Ensure importance is between 0-1
    }));

    // Sort elements by importance
    validatedElements.sort((a, b) => b.importance - a.importance);

    return {
      sceneDescription,
      style: analysis.style as any, // We'll validate this against the VisualStyle type
      elements: validatedElements,
      mood: analysis.mood,
      colorScheme: analysis.colorScheme,
    };
  }

  public async enhanceSearchCriteria(
    criteria: VisualSearchCriteria
  ): Promise<VisualSearchCriteria> {
    // If criteria already has detailed elements, return as is
    if (criteria.elements && criteria.elements.length > 0) {
      return criteria;
    }

    // Otherwise, analyze the scene description
    const analysis = await this.analyzeScene(criteria.sceneDescription);

    // Merge the analysis with existing criteria
    return {
      ...criteria,
      elements: analysis.elements,
      mood: criteria.mood || analysis.mood,
      colorScheme: criteria.colorScheme || analysis.colorScheme,
      style: criteria.style || (analysis.style as any),
    };
  }
}
