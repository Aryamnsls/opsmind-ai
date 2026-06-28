import { NextRequest, NextResponse } from "next/server";
import { RekognitionClient, IndexFacesCommand, CreateCollectionCommand } from "@aws-sdk/client-rekognition";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import crypto from "crypto";

const COLLECTION_ID = "opsmind-faces";
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "opsmind-logs";

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials,
});

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, name, age, gender } = body;

    if (!image || !name || !age || !gender) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Convert base64 image to Buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const imageId = crypto.randomUUID();
    const s3Key = `faces/${imageId}.jpg`;

    // 1. Ensure Collection exists
    try {
      await rekognition.send(new CreateCollectionCommand({ CollectionId: COLLECTION_ID }));
      console.log(`Created collection: ${COLLECTION_ID}`);
    } catch (e: any) {
      if (e.name !== "ResourceAlreadyExistsException") {
        console.error("Collection error:", e);
      }
    }

    // 2. Upload image to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: "image/jpeg",
      })
    );

    // 3. Index face in Rekognition
    const indexCommand = new IndexFacesCommand({
      CollectionId: COLLECTION_ID,
      Image: {
        S3Object: {
          Bucket: BUCKET_NAME,
          Name: s3Key,
        },
      },
      ExternalImageId: imageId,
      MaxFaces: 1,
      DetectionAttributes: ["ALL"],
    });

    const indexResponse = await rekognition.send(indexCommand);

    if (!indexResponse.FaceRecords || indexResponse.FaceRecords.length === 0) {
      return NextResponse.json({ success: false, error: "No face detected in the image" }, { status: 400 });
    }

    const faceId = indexResponse.FaceRecords[0].Face?.FaceId;

    if (!faceId) {
      return NextResponse.json({ success: false, error: "Failed to generate face ID" }, { status: 500 });
    }

    // 4. Save to Database
    if (!db) {
      return NextResponse.json({ success: false, error: "Database not connected" }, { status: 500 });
    }

    const newUser = await db.insert(users).values({
      name,
      email: `${imageId}@opsmind.local`, // Mock email since they didn't provide one
      age: parseInt(age),
      gender,
      faceId,
      role: "engineer",
    }).returning();

    return NextResponse.json({ success: true, user: newUser[0] });
  } catch (error: any) {
    console.error("Register API Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
