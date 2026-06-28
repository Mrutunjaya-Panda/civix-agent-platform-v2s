/**
 * verification.js — Agent 3: Citizen Engagement & Verification
 * 
 * Uses Gemini Vision to compare an original complaint photo with a repair photo
 * to verify if the issue was actually fixed.
 */
const { structuredCall } = require('../gemini');

/**
 * Verifies a repair by comparing two images.
 * 
 * @param {string} originalImageUrl The original complaint image
 * @param {string} repairImageUrl The submitted repair image
 * @param {string} category The category of the issue
 * @returns {Promise<{isRepaired: boolean, recap: string}>}
 */
async function verifyRepair(originalImageUrl, repairImageUrl, category) {
  const prompt = [
    `You are Agent 3 (Visual Verification) for the city's civic infrastructure system.`,
    `You are verifying a repair for an issue in the category: ${category}.`,
    `Image 1 (first) is the original citizen complaint.`,
    `Image 2 (second) is the claimed repair submitted by the municipal worker.`,
    ``,
    `Analyze both images. Was the issue actually repaired in the second image?`,
    `Provide a boolean 'isRepaired' and a short 'recap' (2 sentences maximum) that will be emailed to the citizen.`,
    `If repaired, thank them for their report. If NOT repaired, explain why the proof is insufficient.`
  ].join('\n');

  const schema = {
    type: 'object',
    properties: {
      isRepaired: { 
        type: 'boolean', 
        description: 'True if the second image clearly shows the issue from the first image has been fixed.' 
      },
      recap: { 
        type: 'string', 
        description: 'A 2-sentence community engagement text explaining the decision.' 
      }
    },
    required: ['isRepaired', 'recap']
  };

  // Helper to fetch images and convert to base64 for Gemini
  async function urlToPart(url) {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    return {
      inlineData: {
        data: base64Data,
        mimeType: res.headers.get('content-type') || 'image/jpeg'
      }
    };
  }

  const result = await structuredCall({
    parts: [
      { text: prompt },
      await urlToPart(originalImageUrl),
      await urlToPart(repairImageUrl)
    ],
    schema,
    system: 'You are a strict, objective visual inspector. You must not approve fake or insufficient repairs.'
  });

  return result;
}

module.exports = { verifyRepair };
