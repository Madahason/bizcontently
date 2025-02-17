import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";
import { defaultModel } from "../config";

const seoAnalysisSchema = z.object({
  primaryKeywords: z.array(
    z.object({
      keyword: z.string(),
      searchVolume: z.number(),
      difficulty: z.number().min(1).max(100),
      relevance: z.number().min(1).max(10),
      intent: z.string(),
    })
  ),
  secondaryKeywords: z.array(
    z.object({
      keyword: z.string(),
      searchVolume: z.number(),
      difficulty: z.number().min(1).max(100),
      parentKeyword: z.string(),
    })
  ),
  contentSuggestions: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      targetKeywords: z.array(z.string()),
      estimatedDifficulty: z.number().min(1).max(100),
    })
  ),
  optimization: z.object({
    titleSuggestions: z.array(z.string()),
    metaDescription: z.string(),
    headingStructure: z.array(z.string()),
    contentGaps: z.array(z.string()),
  }),
});

interface SEOAnalysisInput {
  topic: string;
  targetMarket: string;
  existingContent?: string;
  competitors?: string[];
}

/**
 * Creates a chain for SEO analysis and optimization
 */
export function createSEOAnalysisChain() {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an expert SEO analyst. Analyze topics for keyword opportunities, 
    content gaps, and optimization potential. Consider search intent, competition, and current trends.`,
    ],
    [
      "human",
      `Analyze SEO opportunities for:
    Topic: {topic}
    Target Market: {targetMarket}
    Existing Content: {existingContent}
    Competitors: {competitors}
    
    Provide detailed keyword analysis, content suggestions, and optimization recommendations.`,
    ],
  ]);

  return RunnableSequence.from([
    {
      topic: (input: SEOAnalysisInput) => input.topic,
      targetMarket: (input: SEOAnalysisInput) => input.targetMarket,
      existingContent: (input: SEOAnalysisInput) =>
        input.existingContent || "None",
      competitors: (input: SEOAnalysisInput) =>
        input.competitors?.join(", ") || "None",
    },
    prompt,
    defaultModel,
    StructuredOutputParser.fromZodSchema(seoAnalysisSchema),
  ]);
}

const contentOptimizationSchema = z.object({
  readabilityScore: z.number().min(1).max(100),
  improvements: z.array(
    z.object({
      type: z.string(),
      suggestion: z.string(),
      priority: z.number().min(1).max(10),
      impact: z.string(),
    })
  ),
  seoScore: z.number().min(1).max(100),
  keywordUsage: z.array(
    z.object({
      keyword: z.string(),
      frequency: z.number(),
      placement: z.array(z.string()),
      optimization: z.string(),
    })
  ),
  structuralAnalysis: z.object({
    headingStructure: z.string(),
    paragraphLength: z.string(),
    sentenceVariety: z.string(),
    transitionWords: z.array(z.string()),
  }),
});

interface ContentOptimizationInput {
  content: string;
  targetKeywords: string[];
  contentType: string;
  audience: string;
}

/**
 * Creates a chain for optimizing content for SEO and readability
 */
export function createContentOptimizationChain() {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an expert content optimizer. Analyze and improve content for SEO, 
    readability, and engagement while maintaining natural language and user value.`,
    ],
    [
      "human",
      `Optimize this content:
    Content: {content}
    Target Keywords: {targetKeywords}
    Content Type: {contentType}
    Target Audience: {audience}
    
    Provide detailed optimization suggestions while maintaining content quality.`,
    ],
  ]);

  return RunnableSequence.from([
    {
      content: (input: ContentOptimizationInput) => input.content,
      targetKeywords: (input: ContentOptimizationInput) =>
        input.targetKeywords.join(", "),
      contentType: (input: ContentOptimizationInput) => input.contentType,
      audience: (input: ContentOptimizationInput) => input.audience,
    },
    prompt,
    defaultModel,
    StructuredOutputParser.fromZodSchema(contentOptimizationSchema),
  ]);
}
