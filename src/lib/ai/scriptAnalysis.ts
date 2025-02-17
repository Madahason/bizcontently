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

You must respond with valid JSON only, no other text. Use this exact format:
{
  "scenes": [{
    "content": "scene text",
    "type": "scene type (intro/action/dialogue/etc)",
    "keywords": ["key", "visual", "elements"],
    "sentiment": {
      "mood": "emotional tone",
      "intensity": 0.8
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
    console.log(
      "Starting script analysis with content length:",
      scriptContent.length
    );

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Use OpenAI for contextual understanding and scene segmentation
    console.log("Sending request to OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert video script analyst and cinematographer. You must respond with valid JSON only, no other text. Analyze scripts to identify natural scene breaks, emotional tones, and visual elements.",
        },
        {
          role: "user",
          content: SCENE_ANALYSIS_PROMPT + "\n\n" + scriptContent,
        },
      ],
      temperature: 0.7,
    });

    console.log("Received response from OpenAI");

    if (!completion.choices[0].message.content) {
      throw new Error("Empty response from OpenAI");
    }

    let analysis;
    try {
      analysis = JSON.parse(completion.choices[0].message.content.trim());
      console.log("Successfully parsed OpenAI response");
    } catch (parseError) {
      console.error(
        "Failed to parse OpenAI response:",
        completion.choices[0].message.content
      );
      throw new Error("Invalid JSON response from OpenAI");
    }

    if (!analysis.scenes || !Array.isArray(analysis.scenes)) {
      console.error("Invalid analysis structure:", analysis);
      throw new Error("Invalid analysis structure from OpenAI");
    }

    // Enhance keyword extraction using NLP
    console.log(
      "Starting keyword extraction for",
      analysis.scenes.length,
      "scenes"
    );
    const enhancedScenes = await Promise.all(
      analysis.scenes.map(async (scene: Scene, index: number) => {
        try {
          console.log(
            `Processing scene ${index + 1}/${analysis.scenes.length}`
          );
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
        } catch (keywordError) {
          console.error(
            `Failed to extract keywords for scene ${index + 1}:`,
            keywordError
          );
          return scene; // Return original scene if keyword extraction fails
        }
      })
    );

    console.log("Successfully completed script analysis");
    return {
      ...analysis,
      scenes: enhancedScenes,
    };
  } catch (error) {
    // Enhanced error logging
    console.error("Script analysis error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      scriptLength: scriptContent.length,
    });

    // Rethrow with more specific error message
    throw new Error(
      error instanceof Error
        ? `Script analysis failed: ${error.message}`
        : "Failed to analyze script"
    );
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
