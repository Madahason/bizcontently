// Pexels API configuration
export const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
  throw new Error(
    "Missing PEXELS_API_KEY environment variable. Please add it to your .env file. Get your API key from https://www.pexels.com/api/"
  );
}

export const PEXELS_API_URL = "https://api.pexels.com/videos";

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  full_res: string | null;
  tags: string[];
  url: string;
  image: string;
  avg_color: string | null;
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    fps: number | null;
    link: string;
  }[];
  video_pictures: {
    id: number;
    picture: string;
    nr: number;
  }[];
  user: {
    id: number;
    name: string;
    url: string;
  };
}

export interface PexelsSearchResponse {
  page: number;
  per_page: number;
  total_results: number;
  url: string;
  videos: PexelsVideo[];
}

export async function searchPexelsVideos(
  query: string,
  perPage: number = 10,
  page: number = 1
): Promise<PexelsSearchResponse> {
  if (!PEXELS_API_KEY) {
    throw new Error("Pexels API key is not configured");
  }

  const response = await fetch(
    `${PEXELS_API_URL}/search?query=${encodeURIComponent(
      query
    )}&per_page=${perPage}&page=${page}`,
    {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch videos from Pexels: ${response.statusText}`
    );
  }

  return response.json();
}

export function getBestQualityVideo(video: PexelsVideo): string | null {
  // Sort video files by resolution (width * height) in descending order
  const sortedFiles = [...video.video_files].sort((a, b) => {
    const resA = a.width * a.height;
    const resB = b.width * b.height;
    return resB - resA;
  });

  // Get the highest quality video that's not too large
  const bestQuality = sortedFiles.find(
    (file) =>
      file.width <= 1920 && // max width 1920px (1080p)
      file.height <= 1080 && // max height 1080px
      (file.file_type === "video/mp4" || file.file_type === "video/quicktime")
  );

  return bestQuality?.link || null;
}
