import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { apiKey, image } = await req.json();

    if (!apiKey || !image) {
      return NextResponse.json(
        { error: "Missing API key or image" },
        { status: 400 }
      );
    }

    // 🧠 For now we simulate Decart connection
    // Next step we will connect REAL streaming API

    return NextResponse.json({
      success: true,
      message: "Backend connected successfully",
      received: {
        hasApiKey: !!apiKey,
        hasImage: !!image
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}