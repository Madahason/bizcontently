import { OpenAIStream } from "ai";
import OpenAI from "openai";
import keyword_extractor from "keywords-extractor";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Scene {
  content: string;
  type: string;
  keywords: string[];
  sentiment: {
    mood: "happy" | "sad" | "neutral" | "excited" | "serious" | "angry";
    intensity: number; // 0 to 1
  };
  visualStyle: {
    lighting: "bright" | "dark" | "natural" | "dramatic";
    pace: "slow" | "medium" | "fast";
    colorScheme: string[];
  };
  suggestedMusic: {
    genre: string;
    tempo: "slow" | "medium" | "fast";
    mood: string;
  };
}

interface AnalysisResult {
  scenes: Scene[];
  overallTone: string;
  suggestedStyle: string;
}

const SCENE_ANALYSIS_PROMPT = `Analyze the following script section and break it down into natural scenes. For each scene:
1. Identify the main context and purpose
2. Extract key visual elements and actions
3. Determine the emotional tone and intensity
4. Suggest appropriate visual style and music

Provide the analysis in the following JSON format:
{
  "scenes": [{
    "content": "scene text",
    "type": "scene type (intro/action/dialogue/etc)",
    "keywords": ["key", "visual", "elements"],
    "sentiment": {
      "mood": "emotional tone",
      "intensity": 0.8 // 0 to 1
    },
    "visualStyle": {
      "lighting": "bright/dark/natural/dramatic",
      "pace": "slow/medium/fast",
      "colorScheme": ["primary", "secondary", "accent"]
    },
    "suggestedMusic": {
      "genre": "music genre",
      "tempo": "slow/medium/fast",
      "mood": "music mood"
    }
  }],
  "overallTone": "overall script tone",
  "suggestedStyle": "suggested visual style"
}

Script section:`;

export async function analyzeScript(
  scriptContent: string
): Promise<AnalysisResult> {
  try {
    // Use OpenAI for contextual understanding and scene segmentation
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert video script analyst and cinematographer. Analyze scripts to identify natural scene breaks, emotional tones, and visual elements.",
        },
        {
          role: "user",
          content: SCENE_ANALYSIS_PROMPT + "\n\n" + scriptContent,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const analysis = JSON.parse(completion.choices[0].message.content || "{}");

    // Enhance keyword extraction using NLP
    const enhancedScenes = await Promise.all(
      analysis.scenes.map(async (scene: Scene) => {
        const extractedKeywords = keyword_extractor.extract(scene.content, {
          language: "english",
          remove_digits: true,
          return_changed_case: true,
          remove_duplicates: true,
        });

        // Merge AI-generated keywords with NLP-extracted keywords
        const combinedKeywords = Array.from(
          new Set([...scene.keywords, ...extractedKeywords])
        );

        return {
          ...scene,
          keywords: combinedKeywords,
        };
      })
    );

    return {
      ...analysis,
      scenes: enhancedScenes,
    };
  } catch (error) {
    console.error("Script analysis error:", error);
    throw new Error("Failed to analyze script");
  }
}

export function getVisualSuggestions(scene: Scene): string[] {
  // Generate specific visual suggestions based on scene analysis
  const suggestions: string[] = [];

  // Add suggestions based on mood
  switch (scene.sentiment.mood) {
    case "happy":
      suggestions.push("bright lighting", "warm colors", "upbeat movement");
      break;
    case "sad":
      suggestions.push("soft lighting", "muted colors", "slow motion");
      break;
    case "excited":
      suggestions.push("dynamic lighting", "vibrant colors", "fast cuts");
      break;
    case "serious":
      suggestions.push("dramatic lighting", "high contrast", "steady shots");
      break;
    // Add more moods and suggestions
  }

  // Add suggestions based on keywords
  scene.keywords.forEach((keyword) => {
    suggestions.push(`footage related to "${keyword}"`);
  });

  return suggestions;
}

export function getMusicSuggestions(scene: Scene): string[] {
  // Generate music suggestions based on scene analysis
  const suggestions: string[] = [];

  suggestions.push(
    `${scene.suggestedMusic.genre} music`,
    `${scene.suggestedMusic.tempo} tempo`,
    `${scene.suggestedMusic.mood} mood`
  );

  // Add specific suggestions based on sentiment intensity
  if (scene.sentiment.intensity > 0.8) {
    suggestions.push("strong crescendos", "dramatic peaks");
  } else if (scene.sentiment.intensity < 0.3) {
    suggestions.push("subtle undertones", "ambient sounds");
  }

  return suggestions;
}
