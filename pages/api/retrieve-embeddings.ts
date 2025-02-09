// src/app/api/retrieve-embeddings/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Custom error classes for better error handling
class OpenAIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIError';
  }
}

class SupabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to fetch embeddings and related documents from Supabase
async function fetchEmbeddings(query: string): Promise<string[]> {
  try {
    console.log("Generating embedding for query:", query);
    
    // Generate embedding for the input query text
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: [query],
    });

    if (!embeddingResponse.data || embeddingResponse.data.length === 0) {
      throw new OpenAIError("Failed to generate embedding from OpenAI");
    }

    const [{ embedding }] = embeddingResponse.data;
    console.log("Generated Embedding:", embedding);

    const embeddingString = `[${embedding.join(',')}]`;
    console.log("Embedding String for Query:", embeddingString);

    // Retrieve related documents from Supabase based on the embedding
    const { data: documents, error: matchError } = await supabase
      .rpc("match_documents", {
        query_embedding: embedding,
        match_threshold: 0.6,
        match_count: 5
      })
      .select("*");

    if (matchError) {
      console.error("Error from Supabase RPC:", matchError.message);
      throw new SupabaseError(`Error retrieving documents from Supabase: ${matchError.message}`);
    }

    if (!documents) {
      throw new SupabaseError("No documents returned from Supabase");
    }

    interface Document {
      id: number;
      file: string;
      text: string;
      similarity: number;
    }

    return documents.map((doc: Document) => doc.text);
  } catch (error) {
    console.error("Error in fetchEmbeddings:", error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log("Received request at /api/retrieve-embeddings");

  try {
    const { text } = req.body;
    console.log("Received text:", text);

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    // Fetch embeddings using the helper function
    const documents = await fetchEmbeddings(text);
    
    if (!documents || documents.length === 0) {
      return res.status(404).json({ 
        error: 'No relevant documents found',
        documents: [] 
      });
    }

    return res.status(200).json(documents);
  } catch (error) {
    console.error("Server error in retrieve-embeddings:", error);

    if (error instanceof OpenAIError) {
      return res.status(502).json({ 
        error: 'OpenAI service error',
        details: error.message 
      });
    }

    if (error instanceof SupabaseError) {
      return res.status(502).json({ 
        error: 'Database service error',
        details: error.message 
      });
    }

    if (error instanceof Error) {
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }

    return res.status(500).json({ 
      error: 'An unknown error occurred' 
    });
  }
}
