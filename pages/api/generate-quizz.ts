// src/app/api/generate-quizz/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const TOKEN_BUDGET = 10000;

// Constructs the prompt for generating a quiz based on the transcript
async function generateQuizMessage(transcript: string): Promise<string> {
  const introduction = `Generate 5 multiple choice questions based on the following course content. 
    For each question:
    1. Create a clear and specific question
    2. Provide 4 possible answers, with only one being correct
    3. Make sure the correct answer is clearly identified
    Format the output as a JSON array of objects, each with:
    - "question": the question text
    - "options": array of 4 possible answers
    - "correctAnswer": the correct answer (must be one of the options)
    For example:
    {
    "questions": [
            {
                "question": "What is the main function of a market economy?",
                "options": [
                        "Central resource planning",
                        "Resource allocation through price mechanism",
                        "Government control of production",
                        "Elimination of competition"
                ],
                "answer": "Resource allocation through price mechanism"
            },
            // ... 4 more questions
    ]
    }
    Make questions progressively harder, testing different aspects of understanding."${transcript}"`;

  let message = introduction;
  if (message.length > TOKEN_BUDGET) {
    message = message.slice(0, TOKEN_BUDGET); // Trim to fit token budget if needed
  }
  return message;
}

// Main API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("Received request at /api/generate-quizz");

    // Parse request JSON
    const { transcript } = req.body;
    if (!transcript) {
      console.error("Transcript parameter is missing");
      return res.status(400).json({ error: "Transcript is required" });
    }

    console.log("Transcript received for quiz generation");

    // Construct the quiz generation message
    const message = await generateQuizMessage(transcript);
    console.log("Constructed message for Groq:", message);

    // Call the Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Create a JSON array. No introduction. No formatting. Create only the expected JSON object. You must provide a 100% JSON-compatible object that can be parsed by an API.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1500,
      top_p: 1,
      stop: null,
      stream: false,
    });

    // Extract quiz questions from the Groq API response
    const response = chatCompletion.choices[0]?.message?.content || "No quiz generated.";
    console.log("Groq API response:", response);

    // Parse response into JSON
    const quizQuestions = JSON.parse(response);

    return res.status(200).json({ questions: quizQuestions });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in generate quiz API:", error.message);
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'An unknown error occurred' });
  }
}
