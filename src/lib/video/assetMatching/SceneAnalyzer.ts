import OpenAI from "openai";
import { SceneElement, VisualSearchCriteria } from "./types";

interface AnalysisResult {
  elements: SceneElement[];
  style: string;
  mood: string;
  colorScheme: string[];
}

export class SceneAnalyzer {
  private openai: OpenAI;

  constructor() {
    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OpenAI API key is not configured. Please add a valid API key to your .env file. You can get one from https://platform.openai.com/api-keys"
      );
    }

    if (apiKey.startsWith("sk-proj-")) {
      throw new Error(
        "Project-scoped API keys (starting with 'sk-proj-') are not supported. Please use a regular API key from https://platform.openai.com/api-keys"
      );
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  private async analyzeWithGPT(
    sceneDescription: string
  ): Promise<AnalysisResult> {
    try {
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

Scene description: "${sceneDescription}"`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a professional cinematographer and visual analyst. Extract visual elements from scene descriptions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to get analysis from GPT-4: Empty response");
      }

      try {
        return JSON.parse(content.trim()) as AnalysisResult;
      } catch (error) {
        console.error("Failed to parse GPT response:", content);
        throw new Error(
          `Invalid response format from GPT-4: ${
            error instanceof Error ? error.message : "Unknown parsing error"
          }`
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("API key")) {
        throw error; // Re-throw API key related errors
      }
      console.error("GPT analysis error:", error);
      throw new Error(
        `Failed to analyze scene with GPT-4: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  public async analyzeScene(
    sceneDescription: string
  ): Promise<VisualSearchCriteria> {
    const analysis = await this.analyzeWithGPT(sceneDescription);

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
