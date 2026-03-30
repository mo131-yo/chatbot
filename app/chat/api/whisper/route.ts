import { NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const convertedFile = await toFile(buffer, "input.webm", { type: "audio/webm" });

    const transcription = await openai.audio.transcriptions.create({
      file: convertedFile,
      model: "whisper-1",
      prompt: "Энэ бол монгол хэлээр ярьж буй аудио байна. Текст болгон буулгана уу.",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error("Whisper Error Details:", error);
    return NextResponse.json({ 
      error: "Transcription failed", 
      details: error?.message || "Unknown error" 
    }, { status: 500 });
  }
}