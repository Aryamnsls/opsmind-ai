import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userId, age, gender } = await req.json();

    if (!userId || !age || !gender) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const prompt = `A highly detailed, futuristic cyberpunk cartoon avatar of a ${age} year old ${gender} hacker. Flat vector style, neon colors, glowing eyes, mysterious atmosphere. High quality, digital art, profile picture format.`;

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
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
