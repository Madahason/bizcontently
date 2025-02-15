import { NextResponse } from "next/server";
import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { searchTerm } = await req.json();

    if (!searchTerm) {
      return NextResponse.json(
        { error: "Search term is required" },
        { status: 400 }
      );
    }

    // First, search for videos
    const searchResponse = await youtube.search.list({
      part: ["id", "snippet"],
      q: searchTerm,
      type: ["video"],
      maxResults: 50, // Get maximum results to increase chances of finding viral videos
      order: "viewCount", // Sort by view count to prioritize popular videos
    });

    if (!searchResponse.data.items) {
      return NextResponse.json({ videos: [] });
    }

    // Get video statistics for all videos
    const videoIds = searchResponse.data.items.map((item) => item.id?.videoId);
    const videoStatsResponse = await youtube.videos.list({
      part: ["statistics"],
      id: videoIds,
    });

    // Get channel statistics for all channels
    const channelIds = searchResponse.data.items.map(
      (item) => item.snippet?.channelId
    );
    const channelStatsResponse = await youtube.channels.list({
      part: ["statistics"],
      id: [...new Set(channelIds)], // Remove duplicates
    });

    // Create a map of channel stats for quick lookup
    const channelStatsMap = new Map();
    channelStatsResponse.data.items?.forEach((channel) => {
      if (channel.id) {
        channelStatsMap.set(channel.id, channel.statistics);
      }
    });

    // Combine video data with statistics and filter viral videos
    const videos = searchResponse.data.items
      .map((item, index) => {
        const videoStats = videoStatsResponse.data.items?.[index]?.statistics;
        const channelStats = channelStatsMap.get(item.snippet?.channelId);

        if (!videoStats || !channelStats) return null;

        const viewCount = parseInt(videoStats.viewCount || "0");
        const subscriberCount = parseInt(channelStats.subscriberCount || "0");
        const averageViews =
          parseInt(channelStats.viewCount || "0") /
          parseInt(channelStats.videoCount || "1");

        // Check if video is viral (more views than subscribers or average channel views)
        const isViral = viewCount > subscriberCount || viewCount > averageViews;

        if (!isViral) return null;

        return {
          id: item.id?.videoId,
          title: item.snippet?.title,
          thumbnail: item.snippet?.thumbnails?.high?.url,
          channelTitle: item.snippet?.channelTitle,
          publishedAt: item.snippet?.publishedAt,
          statistics: {
            viewCount,
            likeCount: videoStats.likeCount,
            commentCount: videoStats.commentCount,
          },
          viralMetrics: {
            subscriberCount,
            averageChannelViews: Math.round(averageViews),
            viewsToSubscriberRatio: (viewCount / subscriberCount).toFixed(2),
            viewsToAverageRatio: (viewCount / averageViews).toFixed(2),
          },
        };
      })
      .filter(Boolean); // Remove null entries

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch viral videos" },
      { status: 500 }
    );
  }
}
