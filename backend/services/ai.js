import { generateText } from 'ai';
import { buildSystemPrompt } from './promptBuilder.js';
import { JS_TYPES, AI_CONFIG } from '../config/constants.js';

/**
 * Call the Vercel AI SDK with configured AI model at configured reasoning level.
 * Stitches system prompt from template design rules, branding schema, and user prompt.
 * 
 * @param {string|Object} promptInput - Clean user prompt string OR structured options object
 * @param {object} [branding] - Brand configuration (if promptInput is string)
 * @param {string} [previousHtml] - Previous version HTML (if editing)
 * @returns {Promise<string>} Generated raw HTML
 */
export async function generateWithAISDK(promptInput, branding = {}, previousHtml = '') {
  let promptToModel = '';

  if (typeof promptInput === JS_TYPES.OBJECT && promptInput !== null) {
    promptToModel = buildSystemPrompt(promptInput);
  } else if (typeof promptInput === JS_TYPES.STRING) {
    if (promptInput.includes('OUTPUT FORMAT — MANDATORY REQUIREMENTS')) {
      promptToModel = promptInput;
    } else {
      promptToModel = buildSystemPrompt({
        prompt: promptInput,
        branding,
        previousHtml,
      });
    }
  }

  console.log(`[AI_SDK] Calling AI model ${AI_CONFIG.MODEL} (${AI_CONFIG.PROVIDER}) with ${AI_CONFIG.REASONING} reasoning...`);
  const startTime = Date.now();
  try {
    const result = await generateText({
      model: AI_CONFIG.MODEL,
      prompt: promptToModel,
      reasoning: AI_CONFIG.REASONING,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[AI_SDK] Model response received in ${elapsed}s (${(result.text || '').length} chars).`);

    let html = result.text || '';

    // Strip markdown code fences if output is wrapped
    html = html.replace(/^```html?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    return html;
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`[AI_SDK] [ERROR] Model call failed after ${elapsed}s: ${err.message}`);
    throw new Error(`AI SDK Error: ${err.message}`);
  }
}

/**
 * @deprecated Use generateWithAISDK instead.
 */
export async function generateWithGemini(userPrompt, branding, previousHtml = '') {
  console.warn('[DEPRECATED] generateWithGemini is deprecated. Forwarding to generateWithAISDK.');
  return generateWithAISDK(userPrompt, branding, previousHtml);
}
