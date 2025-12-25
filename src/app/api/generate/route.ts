import { NextRequest, NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      return NextResponse.json(
        { error: 'FAL API key not configured. Add FAL_KEY to .env.local' },
        { status: 500 }
      );
    }

    // Configure fal client with API key
    fal.config({
      credentials: falKey,
    });

    // Prepare image URLs for the request (max 8)
    const imageUrls: string[] = images.slice(0, 8);

    // Build the prompt for the Christmas card
    const fullPrompt = `Create a cute illustrated card with the elements (i.e., figures with their clothes and decorations, pets, and other notable features) from all the reference images using comic style. You need to ensure the main figure of each reference image is present in the card (in this case, there are ${images.length} reference images). Use playful pastel colors and soft shading. Add festive hand-drawn text above the characters that reads Happy Holidays. Add a smaller friendly message that reads Sending joy your way. Use aspect ratio 1:1.`;

    // Call FAL.ai nano-banana-pro/edit API using the official client
    const result = await fal.subscribe("fal-ai/nano-banana-pro/edit", {
      input: {
        prompt: fullPrompt,
        image_urls: imageUrls,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS" && update.logs) {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log('FAL result:', result.data);
    console.log('Request ID:', result.requestId);

    // Extract the image URL from the response
    const responseData = result.data as { images?: { url: string }[] };
    
    if (responseData.images?.[0]?.url) {
      return NextResponse.json({ imageUrl: responseData.images[0].url });
    }

    throw new Error('No image in response');
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate card' },
      { status: 500 }
    );
  }
}
