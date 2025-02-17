declare module "keywords-extractor" {
  interface ExtractionOptions {
    language?: string;
    remove_digits?: boolean;
    return_changed_case?: boolean;
    remove_duplicates?: boolean;
  }

  interface KeywordExtractor {
    extract: (text: string, options?: ExtractionOptions) => string[];
  }

  const extractor: KeywordExtractor;
  export default extractor;
}
