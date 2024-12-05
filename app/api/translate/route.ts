import { Groq } from "groq-sdk";

export const runtime = 'edge';

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GROQ API key not configured' }), 
      { status: 500 }
    );
  }

  const groq = new Groq({
    apiKey: apiKey,
  });

  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'No prompt provided' }), 
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful English to Tagalog translator. Provide only the conversational translation, no need for explanations and context.'
        },
        {
          role: 'user',
          content: `Translate this to Tagalog: "${prompt}"`
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 1024,
      stream: true,
    });

    // Create a ReadableStream to handle the completion
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              // Format as SSE
              const data = `data: ${JSON.stringify({ text })}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }
          }
          // Send end message
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Translation error:', error);
    const status = error.status || 500;
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
} 