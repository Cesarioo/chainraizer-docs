import { NextApiRequest, NextApiResponse } from 'next';
import Groq from "groq-sdk";

// Custom error classes for better error handling
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class EmbeddingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmbeddingError';
  }
}

class LLMError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMError';
  }
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const TOKEN_BUDGET = 10000;
const MAX_RETRIES = 3;
const TIMEOUT = 30000; // 30 seconds

let precedentResponse = "";

// Format conversation history for context, limiting to last 3 professor messages
function formatConversationHistory(history: Array<{ sender: string; text: string }>) {
    if (!history.length) return '';
    
    const exchanges: Array<{ question: string; answer: string }> = [];
    for (let i = 0; i < history.length - 1; i++) {
      if (history[i].sender === 'user' && history[i + 1].sender === 'professor') {
        exchanges.push({
          question: history[i].text,
          answer: history[i + 1].text
        });
      }
    }
    
    const lastThreeExchanges = exchanges.slice(-3);
    const formattedExchanges = lastThreeExchanges
      .map(exchange => 
        `Student: ${exchange.question}\nLouise: ${exchange.answer}`
      )
      .join('\n\n');
      
    const lastMessage = history[history.length - 1];
    if (lastMessage.sender === 'user' && 
        (history.length === 1 || history[history.length - 2].sender === 'professor')) {
      return formattedExchanges + (formattedExchanges ? '\n\n' : '') + 
             `Student: ${lastMessage.text}`;
    }
    
    return formattedExchanges;
}

async function prepareMessage(
  query: string,
  relatedTexts: string[],
  conversationHistory: Array<{ sender: string; text: string }> = []
): Promise<string> {
  const historyText = formatConversationHistory(conversationHistory);
  const contextText = historyText 
    ? `\nContext of recent exchanges:\n${historyText}\n` 
    : '';

  const introduction = `You are Louise, Raizer community member, in a discussion with a user. Use these excerpts from the course to community's question in a pedagogical manner:\n\nNew question: "${query}"${contextText}`;

  let message = introduction;
  for (const text of relatedTexts) {
    const nextText = `\n\nRelevant excerpts from the course:\n"""\n${text}\n"""`;
    if (message.length + nextText.length > TOKEN_BUDGET) break;
    message += nextText;
  }
  
  return message;
}

// Validate conversation history
function validateConversationHistory(history: any): boolean {
  if (!Array.isArray(history)) return false;
  return history.every(entry => 
    typeof entry === 'object' &&
    'sender' in entry &&
    'text' in entry &&
    typeof entry.sender === 'string' &&
    typeof entry.text === 'string' &&
    ['user', 'professor'].includes(entry.sender)
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("Received request at /api/text-support-conversation");

    // Parse request JSON with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const { message: query, conversationHistory } = req.body;
      clearTimeout(timeoutId);

      // Validate inputs
      if (!query || typeof query !== 'string') {
        throw new ValidationError("Message is required and must be a string");
      }

      if (conversationHistory && !validateConversationHistory(conversationHistory)) {
        throw new ValidationError("Invalid conversation history format");
      }

      console.log("Query received:", query);

      // Prepare the request body once
      const requestBody = JSON.stringify({ text: query });
      
      // Retrieve embeddings with retries for fetch only
      let embeddingResponse;
      let retries = 0;

      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : `http://${req.headers.host}`;

      while (retries < MAX_RETRIES) {
        try {
          embeddingResponse = await fetch(`${baseUrl}/api/retrieve-embeddings`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.NEXT_PUBLIC_VERCEL_API_KEY}`
            },
            body: requestBody,
            signal: controller.signal,
          });

          // If successful, break the retry loop
          if (embeddingResponse.ok) break;

          // Handle rate limiting
          if (embeddingResponse.status === 429) {
            const backoffTime = Math.pow(2, retries) * 1000;
            console.log(`Rate limited, waiting ${backoffTime}ms before retry ${retries + 1}/${MAX_RETRIES}`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            retries++;
            continue;
          }

          // For other errors, try to get error text and throw
          const errorText = await embeddingResponse.text();
          throw new EmbeddingError(`Failed to retrieve embeddings: ${errorText}`);
        } catch (error) {
          // If it's a timeout, throw immediately
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error("Request timed out while fetching embeddings");
          }
          
          // On last retry, throw the error
          if (retries === MAX_RETRIES - 1) throw error;
          
          // Otherwise, increment retry counter and continue
          console.log(`Retry ${retries + 1}/${MAX_RETRIES} failed:`, error);
          retries++;
        }
      }

      // Final check for response validity
      if (!embeddingResponse || !embeddingResponse.ok) {
        throw new EmbeddingError("Failed to retrieve embeddings after retries");
      }

      // Parse related texts
      let relatedTexts = await embeddingResponse.json();
      console.log("Related texts retrieved:", relatedTexts);

      if (!Array.isArray(relatedTexts)) {
        throw new EmbeddingError("Invalid embeddings response format");
      }

      if (relatedTexts.length === 0) {
        relatedTexts = ["I can't find relevant information in the course to answer this question. Could you rephrase or ask a more specific question about the course content?"];
      }

      // Prepare the complete message with context and history
      const formattedMessage = await prepareMessage(query, relatedTexts, conversationHistory);
      console.log("Formatted message for Groq:", formattedMessage);

      // Call Groq API with error handling
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are Louise, a woman degen community member of Raizer. You must:
                - Remember you are a woman, talk very naturally
                - Show your personality
                - Respond in the minimum of words possible, remeber you are in SMS but use full words
                - in case you have "Context of recent exchanges:" please follow up the discussion
                - If the question is outside your knowledge, mention it
                - always try to link the subject back to Raizer and open to another subject to dig deeper`,
            },
            {
              role: "user",
              content: formattedMessage,
            },
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          stop: null,
          stream: false,
        });

        if (!chatCompletion.choices?.[0]?.message?.content) {
          throw new LLMError("Invalid response from Groq API");
        }

        const response = chatCompletion.choices[0].message.content;
        precedentResponse = `\n\nPrevious response: "${response}"`;
        console.log("Groq API response:", response);

        return res.status(200).json({ 
          response,
          timestamp: new Date().toISOString() 
        });

      } catch (error: any) {
        if (error?.response?.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        throw error;
      }

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }

  } catch (error) {
    console.error("Error in text support conversation API:", error);

    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    
    if (error instanceof EmbeddingError) {
      return res.status(502).json({ error: error.message });
    }
    
    if (error instanceof LLMError) {
      return res.status(502).json({ error: error.message });
    }

    if (error instanceof Error && error.name === 'AbortError') {
      return res.status(408).json({ error: "Request timed out" });
    }

    if (error instanceof Error) {
      return res.status(500).json({ 
        error: "An internal server error occurred",
        details: error.message 
      });
    }

    return res.status(500).json({ 
      error: "An unknown error occurred" 
    });
  }
}