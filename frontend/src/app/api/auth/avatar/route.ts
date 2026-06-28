import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  let userId: number | null = null;
  
  try {
    const body = await req.json();
    userId = body.userId;
    const { age, gender } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    const safeAge = age || 25;
    const safeGender = gender || "cyberpunk hacker";

    const prompt = `A highly detailed, futuristic cyberpunk cartoon avatar of a ${safeAge} year old ${safeGender}. Flat vector style, neon colors, glowing eyes, mysterious atmosphere. High quality, digital art, profile picture format.`;

    const isFakeKey = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("your-openai-api-key");

    if (isFakeKey) {
      // Use a cool Hackathon fallback avatar
      const fallbackUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}-${safeAge}&backgroundColor=f97316`;
      await db.update(users).set({ avatarUrl: fallbackUrl }).where(eq(users.id, userId));
      return NextResponse.json({ success: true, avatarUrl: fallbackUrl });
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    });

    const avatarUrl = response.data[0].url;

    if (avatarUrl) {
      await db.update(users).set({ avatarUrl }).where(eq(users.id, userId));
      return NextResponse.json({ success: true, avatarUrl });
    }

    return NextResponse.json({ success: false, error: "Failed to generate avatar" });
  } catch (error: any) {
    console.error("Avatar API Error:", error);
    
    // Fallback if OpenAI fails (e.g. no credits, rate limit)
    if (userId) {
      const fallbackUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}-fallback&backgroundColor=0ea5e9`;
      await db.update(users).set({ avatarUrl: fallbackUrl }).where(eq(users.id, userId));
      return NextResponse.json({ success: true, avatarUrl: fallbackUrl });
    }
    
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
