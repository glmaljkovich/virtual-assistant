import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient, play } from "elevenlabs";

export async function POST(req: NextRequest) {
    const {assistant, text, previous} = await req.json()
    const elevenlabs = new ElevenLabsClient()
    const austinVoice = "Xb3zeLrTi6F4ziIcXdwk"
    const astridVoice = "Qdi0R9qF3aZ4OQvNyxyM"
    const assistantVoices = new Map(Object.entries({
      'Illia': austinVoice,
      'Amelia': astridVoice
    }))
    const audio = await elevenlabs.generate({
      voice: assistantVoices.get(assistant),
      text: text,
      model_id: "eleven_turbo_v2",
      optimize_streaming_latency: "1",
      voice_settings: {
        similarity_boost: 0.75,
        stability: 0.5
      }
    });

    return new Response(audio as any, {
        headers: { "Content-Type": "audio/mpeg" }
    });
}