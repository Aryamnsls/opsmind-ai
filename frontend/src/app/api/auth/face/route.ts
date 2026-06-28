import { NextRequest, NextResponse } from "next/server";
import { RekognitionClient, SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const COLLECTION_ID = "opsmind-faces";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
    }

    // Convert base64 image to Buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const command = new SearchFacesByImageCommand({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: buffer },
      FaceMatchThreshold: 90,
      MaxFaces: 1,
    });

    try {
      const response = await rekognition.send(command);

      if (response.FaceMatches && response.FaceMatches.length > 0) {
        const match = response.FaceMatches[0];
        const faceId = match.Face?.FaceId;

        if (faceId) {
          const foundUsers = await db.select().from(users).where(eq(users.faceId, faceId)).limit(1);

          if (foundUsers.length > 0) {
            return NextResponse.json({
              success: true,
              recognized: true,
              user: foundUsers[0],
            });
          }
        }
      }

      return NextResponse.json({ success: true, recognized: false });
    } catch (rekogError: any) {
      console.error("Rekognition Search Error:", rekogError);
      return NextResponse.json({ success: true, recognized: false, error: rekogError.message });
    }
  } catch (error: any) {
    console.error("Face Auth API Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
