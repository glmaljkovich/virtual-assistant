import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient, play } from "elevenlabs";

export async function POST(req: NextRequest) {
    const body = await req.json()
    const elevenlabs = new ElevenLabsClient()
    const austinVoice = "Xb3zeLrTi6F4ziIcXdwk"
    const audio = await elevenlabs.generate({
      voice: austinVoice,
      text: body.text,
      model_id: "eleven_turbo_v2",
      optimize_streaming_latency: "1"
    });

    return new Response(audio as any, {
        headers: { "Content-Type": "audio/mpeg" }
    });
}