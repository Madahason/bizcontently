import { NextResponse } from "next/server";
import { google } from "googleapis";

// Initialize the Google Search Console API client
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    ),
    type: "service_account",
    project_id: "bizcontently-451013",
  },
  scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
});

const searchconsole = google.searchconsole("v1");

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    // Validate input
    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY) {
      console.error("Missing GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY");
      return NextResponse.json(
        { error: "Search Console private key is not configured" },
        { status: 500 }
      );
    }

    if (!process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL) {
      console.error("Missing GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL");
      return NextResponse.json(
        { error: "Search Console client email is not configured" },
        { status: 500 }
      );
    }

    if (!process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL) {
      console.error("Missing GOOGLE_SEARCH_CONSOLE_SITE_URL");
      return NextResponse.json(
        { error: "Search Console site URL is not configured" },
        { status: 500 }
      );
    }

    console.log("Authenticating with Google...");
    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
    console.log("Using site URL:", siteUrl);

    console.log("Fetching search analytics data for keyword:", keyword);
    const response = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: getDateXDaysAgo(28),
        endDate: getDateXDaysAgo(0),
        dimensions: ["query"],
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: "query",
                operator: "contains",
                expression: keyword.toLowerCase(),
              },
            ],
          },
        ],
        rowLimit: 10,
      },
    });

    if (!response.data.rows || response.data.rows.length === 0) {
      console.log("No data found for keyword:", keyword);
      return NextResponse.json({ keywords: [] });
    }

    console.log("Found", response.data.rows.length, "results");
    const keywordIdeas = response.data.rows.map((row: any) => ({
      text: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: (row.ctr * 100).toFixed(2) + "%",
      position: row.position.toFixed(1),
    }));

    return NextResponse.json({ keywords: keywordIdeas });
  } catch (error: any) {
    console.error("Keyword research error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack,
    });

    // Check for specific error types
    if (error.code === 401) {
      return NextResponse.json(
        { error: "Authentication failed. Please check your API credentials." },
        { status: 401 }
      );
    }

    if (error.code === 403) {
      return NextResponse.json(
        {
          error:
            "Access denied. Please check your permissions in Search Console.",
        },
        { status: 403 }
      );
    }

    if (error.code === 404) {
      return NextResponse.json(
        {
          error:
            "Site not found. Please verify your site URL in Search Console.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch keyword data" },
      { status: 500 }
    );
  }
}

function getDateXDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}
