/**
 * gemini.js — Gemini 2.5 Flash client singleton
 * Uses @google/genai SDK with Google AI Studio API key (no billing card required).
 * All agent modules import { ai, SchemaType } from here.
 */
const { GoogleGenAI } = require('@google/genai');

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    '[gemini.js] GEMINI_API_KEY is not set.\n' +
    'Get a free key at https://aistudio.google.com and add it to your .env file.'
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Default model — confirmed working with multimodal + responseSchema
const MODEL = 'gemini-2.5-flash';

/**
 * Helper: call Gemini with a responseSchema for structured JSON output.
 * @param {object} params
 * @param {Array}  params.parts    — array of { text } or { inlineData / fileData } parts
 * @param {object} params.schema   — JSON Schema object for responseSchema
 * @param {string} params.system   — optional system instruction
 * @returns {object} parsed JSON matching schema
 */
async function structuredCall({ parts, schema, system }) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts }],
    ...(system && { systemInstruction: system }),
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  });

  const text = typeof response.text === 'function' ? response.text() : response.text;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`[gemini.js] Failed to parse response as JSON: ${text.slice(0, 200)}`);
  }
}

module.exports = { ai, MODEL, structuredCall };
