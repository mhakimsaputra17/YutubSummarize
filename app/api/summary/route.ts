import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import { Innertube } from 'youtubei.js/web';
import OpenAI from 'openai';
import redis from '@/utils/redis'; // Import Redis

// Load environment variables from .env file
dotenv.config();

// Konfigurasi OpenAI
const token = process.env.OPENAI_API_KEY;
const endpoint = process.env.OPENAI_API_ENDPOINT || "https://models.inference.ai.azure.com";
const modelName = process.env.OPENAI_MODEL_NAME || "gpt-4o-mini";

const openai = new OpenAI({
  apiKey: token,
  baseURL: endpoint,
});

// Fungsi untuk memecah transkrip menjadi chunk
function chunkTranscript(text: string, maxChunkSize: number = 4000): string[] {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk: string[] = [];
  let currentSize = 0;

  for (const word of words) {
    const wordTokens = Math.ceil(word.length / 4);
    if (currentSize + wordTokens > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [word];
      currentSize = wordTokens;
    } else {
      currentChunk.push(word);
      currentSize += wordTokens;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  return chunks;
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const { id } = await request.json();

    // Validasi input
    if (!id) {
      return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
    }

    // Cek cache Redis untuk summary
    const cachedSummary = await redis.get(`video:${id}:summary`);
    if (cachedSummary) {
      console.log('Summary retrieved from Redis cache');
      const response = NextResponse.json(JSON.parse(cachedSummary));
      // Tambahkan cache headers untuk client (1 jam)
      response.headers.set('Cache-Control', 'public, max-age=3600');
      return response;
    }

    // Inisialisasi Innertube dengan konfigurasi
    const youtube = await Innertube.create({
      lang: 'en', // Bahasa default
      location: 'US', // Lokasi default
      retrieve_player: false, // Tidak perlu mengambil player
    });

    // Ambil informasi video
    const info = await youtube.getInfo(id);

    // Ambil data transkrip
    const transcriptData = await info.getTranscript();

    // Format transkrip dengan timestamp
    const segments = transcriptData?.transcript?.content?.body?.initial_segments.map(
      (segment: any) => ({
        startTime: segment.start_ms / 1000, // Konversi ms ke detik
        endTime: segment.end_ms / 1000, // Konversi ms ke detik
        text: segment.snippet?.text?.trim(), // Teks transkrip
      })
    );

    // Jika tidak ada transkrip, kembalikan pesan error
    if (!segments) {
      return NextResponse.json({ error: 'Transcript not available' }, { status: 404 });
    }

    // Gabungkan teks transkrip menjadi satu string
    const transcriptText = segments.map((segment: any) => segment.text).join(' ');

    // Pecah transkrip menjadi chunk jika terlalu panjang
    const chunks = chunkTranscript(transcriptText);
    const summaries = [];

    // Generate summary untuk setiap chunk
    for (const chunk of chunks) {
      const prompt = `Summarize this YouTube video transcript in the same language as the transcript. Focus on the most important points and provide a concise summary. Use headings and emojis to make it more engaging. Format the summary neatly.

Example format:
📌 **Main Points**:
- Point 1
- Point 2

💡 **Key Takeaways**:
- Takeaway 1
- Takeaway 2

🎯 **Conclusion**:
- Final thought

Transcript:
${chunk}`;

      const response = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: modelName,
      });
      summaries.push(response.choices[0].message.content);
    }

    // Gabungkan semua summary menjadi satu
    let finalSummary;
    if (summaries.length > 1) {
      const combinedPrompt = `Create a cohesive summary from these sections. Use the same language as the transcript. Focus on the most important points and provide a concise summary. Use headings and emojis to make it more engaging. Format the summary neatly.

Sections:
${summaries.map((s, i) => `Section ${i + 1}:\n${s}`).join('\n\n')}`;

      const finalResponse = await openai.chat.completions.create({
        messages: [{ role: "user", content: combinedPrompt }],
        model: modelName,
      });
      finalSummary = finalResponse.choices[0].message.content;
    } else {
      finalSummary = summaries[0];
    }

    // Simpan ke Redis cache dengan expiry 7 hari
    await redis.set(`video:${id}:summary`, JSON.stringify({ summary: finalSummary }), 'EX', 60 * 60 * 24 * 7); // 7 hari
    console.log('Summary cached in Redis');

    // Kembalikan summary sebagai respons JSON
    const response = NextResponse.json({ summary: finalSummary });
    // Tambahkan cache headers untuk client (1 jam)
    response.headers.set('Cache-Control', 'public, max-age=3600');
    return response;
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}