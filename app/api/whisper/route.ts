import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No audio file" }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "mn", 
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error("Whisper Error Details:", error);
    return NextResponse.json({ error: "Transcription failed", details: error.message }, { status: 500 });
  }
}