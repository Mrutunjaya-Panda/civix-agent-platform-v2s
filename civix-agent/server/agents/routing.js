/**
 * routing.js — Agent 2: Routing & Escalation Agent
 * 
 * Generates structured grievance briefs using Gemini.
 */
const { structuredCall } = require('../gemini');

/**
 * Drafts a structured grievance brief for a ticket.
 * 
 * @param {object} ticket The ticket data from Firestore
 * @param {boolean} isEscalation Whether this is an SLA escalation (changes the tone)
 * @returns {Promise<{card: {title, summary, priority_actions}, email: string}>}
 */
async function draftGrievanceBrief(ticket, isEscalation = false) {
  const urgencyTone = isEscalation 
    ? 'HIGHLY URGENT. This issue has breached its SLA and requires immediate attention.'
    : 'Professional and concise.';

  const prompt = [
    `You are the AI Routing Agent for the ${ticket.department}.`,
    `Generate a grievance brief for the following civic issue:`,
    `Category: ${ticket.category}`,
    `Severity Score: ${ticket.severity}/10`,
    `Citizen Note: "${ticket.note || 'None provided'}"`,
    `AI Triage Reasoning: "${ticket.reasoning}"`,
    `Urgency/Tone: ${urgencyTone}`,
    ``,
    `Draft a summary card with 3 priority actions, and an email body to be dispatched to the department.`
  ].join('\n');

  const schema = {
    type: 'object',
    properties: {
      card: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'A short, punchy title for the issue' },
          summary: { type: 'string', description: 'A 2-sentence summary of the problem and impact' },
          priority_actions: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Top 3 immediate actions the field team should take'
          }
        },
        required: ['title', 'summary', 'priority_actions']
      },
      email: { 
        type: 'string', 
        description: 'Professional email body to the department detailing the issue'
      }
    },
    required: ['card', 'email']
  };

  const result = await structuredCall({
    parts: [{ text: prompt }],
    schema,
    system: 'You are a precise civic routing assistant. Generate actionable, structured briefs.'
  });

  return result;
}

module.exports = { draftGrievanceBrief };
