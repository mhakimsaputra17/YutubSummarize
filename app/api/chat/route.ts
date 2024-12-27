import { NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js/web';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// ----------------------------------
// Tipe data untuk request body
// ----------------------------------
interface RequestPayload {
  videoId: string;
  question: string;
  history?: {
    role: string;
    content: string;
  }[];
}

// ----------------------------------
// Tipe data untuk percakapan
// ----------------------------------
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ----------------------------------
// OpenAI Configuration
// ----------------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
  baseURL: process.env.OPENAI_API_ENDPOINT ?? 'https://models.inference.ai.azure.com',
});

// Default model name
const DEFAULT_MODEL_NAME = process.env.OPENAI_MODEL_NAME ?? 'gpt-4o-mini';

// ----------------------------------
// Utility function to chunk transcript
// ----------------------------------
function chunkTranscript(text: string, maxChunkSize = 3000): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
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

// ----------------------------------
// Main POST function
// ----------------------------------
export async function POST(request: Request) {
  try {
    // Pastikan kita menggunakan tipe RequestPayload agar tidak ada 'any' di parameter
    const { videoId, question, history } = (await request.json()) as RequestPayload;

    if (!videoId || !question) {
      return NextResponse.json(
        { error: 'Missing videoId or question' },
        { status: 400 }
      );
    }

    // Format conversation history dengan tipe data yang sesuai
    const conversationHistory: ChatMessage[] = (history ?? []).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Initialize YouTube client
    const youtube = await Innertube.create({
      lang: 'en',
      location: 'US',
      retrieve_player: false,
    });

    // Fetch video info and transcript
    const info = await youtube.getInfo(videoId);
    const transcriptData = await info.getTranscript();

    // Periksa apakah transcript tersedia
    const initialSegments = transcriptData?.transcript?.content?.body?.initial_segments;
    if (!initialSegments) {
      return NextResponse.json(
        { error: 'Transcript not available' },
        { status: 404 }
      );
    }

    // Menggabungkan semua segmen transcript menjadi string
    const transcriptText = initialSegments
      .map((segment: any) => segment.snippet?.text?.trim())
      .join(' ');

    // Bagi transcript menjadi beberapa bagian (chunks) agar tidak melebihi batas token
    const chunks = chunkTranscript(transcriptText);
    const answers: string[] = [];

    // Gunakan setiap chunk sebagai konteks untuk ChatCompletion
    for (const chunk of chunks) {
      const prompt = `Based on this video transcript excerpt and the previous conversation, please answer the following question. If the answer isn't in this excerpt, respond with "NO_RELEVANT_INFO".

Previous conversation:
${conversationHistory.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

Transcript excerpt:
${chunk}

Current question: ${question}

Answer:`;

      const response = await openai.chat.completions.create({
        messages: [
          ...conversationHistory,
          { role: 'user', content: prompt },
        ],
        model: DEFAULT_MODEL_NAME,
      });

      const answer = response.choices[0]?.message?.content ?? '';
      if (answer && answer.trim() !== 'NO_RELEVANT_INFO') {
        answers.push(answer.trim());
      }
    }

    // Jika ada lebih dari satu chunk relevan, gabungkan jawaban
    let finalAnswer: string = '';
    if (answers.length > 1) {
      const combinePrompt = `Create a clear and concise answer by combining these relevant pieces of information about the question: ${question}

Information pieces:
${answers
  .map((a, i) => `Info ${i + 1}:\n${a}`)
  .join('\n\n')}`;

      const finalResponse = await openai.chat.completions.create({
        messages: [{ role: 'user', content: combinePrompt }],
        model: DEFAULT_MODEL_NAME,
      });
      finalAnswer = finalResponse.choices[0]?.message?.content ?? '';
    } else if (answers.length === 1) {
      finalAnswer = answers[0];
    } else {
      // Jika transcript tidak memiliki info relevan, gunakan jawaban umum
      const generalPrompt = `Based on our previous conversation:
${conversationHistory.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

The user asked: "${question}"

Since I couldn't find specific information about this in the video transcript, I'll provide a general answer based on my knowledge and our conversation context.

Please provide a helpful response that:
1. Acknowledges this is a general answer (not from the video)
2. Considers the context of our previous conversation
3. Gives relevant information about the topic
4. Stays factual and informative

Response:`;

      const generalResponse = await openai.chat.completions.create({
        messages: [
          ...conversationHistory,
          { role: 'user', content: generalPrompt },
        ],
        model: DEFAULT_MODEL_NAME,
      });

      finalAnswer =
        '⚠️ Note: This is a general answer as I couldn’t find specific information in the video.\n\n' +
        (generalResponse.choices[0]?.message?.content ?? '');
    }

    // Return response as JSON
    const response = NextResponse.json({ answer: finalAnswer });
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
    
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
