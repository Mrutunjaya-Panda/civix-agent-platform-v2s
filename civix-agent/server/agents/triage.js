/**
 * triage.js — Agent 1: Triage Agent
 *
 * Accepts an image URL + optional note, calls Gemini Vision with a structured
 * responseSchema, and applies the SPEC severity formula.
 *
 * Severity formula (SPEC):
 *   clamp(((Baseline × 0.5) + (visualSeverity × 0.5)) + clusterBonus, 1, 10)
 *
 * Baselines:
 *   Roads=6, Water=7, Electricity=8, Sanitation=5
 */
const { structuredCall } = require('../gemini');

// ── Department routing table (SPEC) ───────────────────────────────────────────
const ROUTING_TABLE = {
  Roads:       { department: 'Roads and Infrastructure Dept', contact: 'roads@civix.demo',       baseline: 6 },
  Water:       { department: 'Water Supply Board',            contact: 'water@civix.demo',       baseline: 7 },
  Electricity: { department: 'Electricity Distribution Board', contact: 'power@civix.demo',     baseline: 8 },
  Sanitation:  { department: 'Sanitation and Waste Dept',     contact: 'sanitation@civix.demo', baseline: 5 },
};

const VALID_CATEGORIES = Object.keys(ROUTING_TABLE);

/**
 * Clamp a number between min and max.
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Apply the SPEC severity formula.
 * @param {string} category - Classified category
 * @param {number} visualSeverity - Gemini Vision 1-10 score
 * @param {number} clusterBonus - 0 initially, recalculated in dedup step
 * @returns {number} Final severity score (1-10, 1 decimal place)
 */
function calcSeverity(category, visualSeverity, clusterBonus = 0) {
  const { baseline } = ROUTING_TABLE[category];
  const raw = ((baseline * 0.5) + (visualSeverity * 0.5)) + clusterBonus;
  return Math.round(clamp(raw, 1, 10) * 10) / 10;
}

/**
 * Fetch an image URL and return it as a base64 inlineData part for Gemini.
 */
async function imageUrlToInlineData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}: ${response.status}`);
  }
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  // Only keep the base mime type (strip charset if any)
  const mimeType = contentType.split(';')[0].trim();
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return { inlineData: { mimeType, data: base64 } };
}

/**
 * Run the Triage Agent.
 *
 * @param {object} params
 * @param {string} params.imageUrl  — Cloudinary (or any public) image URL
 * @param {string} [params.note]    — Optional citizen description
 * @param {number} [params.clusterBonus=0] — Populated by dedup step in report.js
 * @returns {Promise<{category, severity, reasoning, department, contact}>}
 */
async function triageReport({ imageUrl, note = '', clusterBonus = 0 }) {
  // 1. Convert image to base64 inlineData for Gemini
  const imagePart = await imageUrlToInlineData(imageUrl);

  // 2. Build prompt
  const textPart = {
    text: [
      'You are a civic infrastructure triage system for Bhubaneswar, India.',
      'Analyze the image and classify the civic issue shown.',
      note ? `Citizen note: "${note}"` : '',
      '',
      'Respond ONLY with the JSON schema requested.',
      `Valid categories: ${VALID_CATEGORIES.join(', ')}.`,
      'visualSeverity is your raw 1-10 assessment of the physical damage visible in the photo.',
      '1 = cosmetic/negligible, 5 = moderate disruption, 10 = dangerous/life-threatening.',
    ].filter(Boolean).join('\n'),
  };

  // 3. Call Gemini Vision with structured output
  const schema = {
    type: 'object',
    properties: {
      category:       { type: 'string', enum: VALID_CATEGORIES },
      visualSeverity: { type: 'number', description: 'Physical damage severity 1-10' },
      reasoning:      { type: 'string', description: 'One sentence explanation for the classification and severity' },
    },
    required: ['category', 'visualSeverity', 'reasoning'],
  };

  const geminiResult = await structuredCall({
    parts: [textPart, imagePart],
    schema,
    system: 'You are a precise civic triage classifier. Output valid JSON only.',
  });

  const { category, visualSeverity, reasoning } = geminiResult;

  // 4. Validate category
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`[triage] Gemini returned invalid category: "${category}". Expected one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // 5. Apply severity formula
  const severity = calcSeverity(category, visualSeverity, clusterBonus);
  const { department, contact } = ROUTING_TABLE[category];

  return { category, severity, reasoning, department, contact, visualSeverity };
}

module.exports = { triageReport, calcSeverity, ROUTING_TABLE, VALID_CATEGORIES };
