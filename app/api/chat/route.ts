import { NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js/web';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// OpenAI configuration
const token = process.env.OPENAI_API_KEY;
const endpoint = process.env.OPENAI_API_ENDPOINT || "https://api.openai.com/v1";
const modelName = process.env.OPENAI_MODEL_NAME || "gpt-3.5-turbo";

const openai = new OpenAI({
  apiKey: token,
  baseURL: endpoint,
});

// Function to chunk transcript
function chunkTranscript(text: string, maxChunkSize: number = 3000): string[] {
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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: Request) {
  try {
    const { videoId, question, history } = await request.json();

    if (!videoId || !question) {
      return NextResponse.json({ error: 'Missing videoId or question' }, { status: 400 });
    }

    // Format conversation history
    const conversationHistory: ChatMessage[] = history?.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) || [];

    // Initialize Innertube
    const youtube = await Innertube.create({
      lang: 'en',
      location: 'US',
      retrieve_player: false,
    });

    // Get video info and transcript
    const info = await youtube.getInfo(videoId);
    const transcriptData = await info.getTranscript();

    if (!transcriptData?.transcript?.content?.body?.initial_segments) {
      return NextResponse.json({ error: 'Transcript not available' }, { status: 404 });
    }

    // Format transcript
    const transcriptText = transcriptData.transcript.content.body.initial_segments
      .map((segment: any) => segment.snippet?.text?.trim())
      .join(' ');

    // Split transcript into chunks
    const chunks = chunkTranscript(transcriptText);
    const answers = [];

    // Process each chunk with conversation context
    for (const chunk of chunks) {
      const prompt = `Based on this video transcript excerpt and the previous conversation, please answer the following question. If the answer isn't in this excerpt, respond with "NO_RELEVANT_INFO".

Previous conversation:
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

Transcript excerpt:
${chunk}

Current question: ${question}

Answer:`;

      const response = await openai.chat.completions.create({
        messages: [
          ...conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: "user", content: prompt }
        ],
        model: modelName,
      });

      const answer = response.choices[0].message.content;
      if (answer !== "NO_RELEVANT_INFO") {
        answers.push(answer);
      }
    }

    // Combine answers if multiple relevant chunks found
    let finalAnswer;
    if (answers.length > 1) {
      const combinePrompt = `Create a clear and concise answer by combining these relevant pieces of information about the question: ${question}

Information pieces:
${answers.map((a, i) => `Info ${i + 1}:\n${a}`).join('\n\n')}`;

      const finalResponse = await openai.chat.completions.create({
        messages: [{ role: "user", content: combinePrompt }],
        model: modelName,
      });
      finalAnswer = finalResponse.choices[0].message.content;
    } else if (answers.length === 1) {
      finalAnswer = answers[0];
    } else {
      // If no relevant information found in transcript, use ChatGPT directly
      const generalPrompt = `Based on our previous conversation:
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

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
          ...conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: "user", content: generalPrompt }
        ],
        model: modelName,
      });
      
      finalAnswer = "⚠️ Note: This is a general answer as I couldn't find specific information in the video.\n\n" + 
                   generalResponse.choices[0].message.content;
    }

    const response = NextResponse.json({ answer: finalAnswer });
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    return response;
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}

