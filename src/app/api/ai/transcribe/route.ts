import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB (Whisper limit)

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Serviço de transcrição não configurado" },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "Arquivo de áudio é obrigatório" }, { status: 400 });
    }

    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Arquivo excede o limite de 25 MB (${(audioFile.size / 1024 / 1024).toFixed(1)} MB)` },
        { status: 400 }
      );
    }

    // Validate MIME type
    const validTypes = [
      "audio/webm",
      "audio/mp4",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/flac",
      "video/webm",
    ];
    if (!validTypes.some((t) => audioFile.type.startsWith(t.split("/")[0]))) {
      return NextResponse.json(
        { error: "Formato de áudio não suportado" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "pt",
      response_format: "verbose_json",
    });

    return NextResponse.json({
      text: transcription.text,
      duration: transcription.duration ?? null,
      language: transcription.language ?? "pt",
    });
  } catch (error: unknown) {
    console.error("[transcribe] Error:", error);
    const message = error instanceof Error ? error.message : "Erro na transcrição";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
