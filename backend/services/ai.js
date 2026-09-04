import { generateText } from 'ai';

/**
 * Build a comprehensive system prompt from user input + branding data,
 * then call the Vercel AI SDK with meta/muse-spark-1.2-contributor at high reasoning.
 * 
 * @param {string} userPrompt - User's generation/modification request
 * @param {object} branding - Brand configuration
 * @param {string} previousHtml - Previous version's HTML (if editing) for styling consistency
 * @returns {Promise<string>} Generated raw HTML
 */
export async function generateWithAISDK(userPrompt, branding, previousHtml = '') {
  // ── Detect if prompt already has design system instructions ────────────────
  const hasDesignSystem = /DESIGN SYSTEM:|PROFESSIONAL|GLASSMORPHISM|NEO-BRUTALISM|LUXURY DARK|NEUMORPHISM|COHERE|ELEVENLABS|LOVABLE|REPLICATE|COMPONENT SPECIFICATIONS/i.test(userPrompt);

  // ── Format services list ───────────────────────────────────────────────────
  const servicesBlock = branding.services?.length
    ? branding.services
        .map(
          (s, i) =>
            `  ${i + 1}. ${s.name} — ${s.description || 'No description'} | Price: $${s.price ?? 'N/A'}`
        )
        .join('\n')
    : '  (No services defined yet)';

  // ── Format available images ────────────────────────────────────────────────
  const imagesBlock = branding.images?.length
    ? branding.images
        .map((img, i) => `  Image ${i + 1}: ${img.url}  (alt: "${img.alt || 'image'}")`)
        .join('\n')
    : '  (No images uploaded yet)';

  // ── Format custom color palette (:root) ────────────────────────────────────
  const customPaletteBlock = branding.userProvidedColorPallete?.trim()
    ? `\n═══ MANDATORY CUSTOM CSS COLOR PALETTE (:root) ═══
The user has specified the following exact CSS color palette:
${branding.userProvidedColorPallete.trim()}

CRITICAL COLOR & DESIGN DIRECTIVES:
1. Define these EXACT custom properties inside the :root selector in the <style> tag.
2. The entire website's visual aesthetic, backgrounds, hero gradients, buttons, cards, borders, accents, and navigation MUST strictly surround and use these exact CSS custom properties (e.g., var(--color-1), var(--color-2), etc.).\n`
    : '';

  // ── Build prompt ───────────────────────────────────────────────────────────
  const previousVersionContext = previousHtml
    ? `\n═══ PREVIOUS VERSION (for styling reference) ═══\nUse this as a reference to maintain design consistency, color scheme, typography, and layout patterns:\n\`\`\`html\n${previousHtml}\n\`\`\`\n(Full previous version provided above)\n\n`
    : '';
  
  const systemPrompt = hasDesignSystem
    ? `You are an elite web developer and UI designer.
Generate a COMPLETE, production-ready, single-file HTML page with INTERNAL <style> and <script> tags.

THE USER HAS SPECIFIED DETAILED DESIGN SYSTEM AND COMPONENT INSTRUCTIONS BELOW.
FOLLOW THESE INSTRUCTIONS EXACTLY AND COMPLETELY — they take absolute priority.
Do NOT deviate from the styling, colors, typography, layouts, or component specifications provided.
${previousVersionContext}
If there is a previous version above, maintain its visual styling, color palette, typography, and component design patterns while implementing the user's new content/changes.

═══ BRAND ASSETS ═══
Company Name        : ${branding.companyName || 'My Company'}
Company Description : ${branding.companyDescription || ''}
Logo URL            : ${branding.logo || '(none)'}
Favicon URL         : ${branding.favicon || '(none)'}
${customPaletteBlock}
═══ BRAND IMAGES ═══
${imagesBlock}

═══ SERVICES OFFERED ═══
${servicesBlock}

═══ CRITICAL RULES (always apply) ═══
1. Output ONLY valid HTML — no markdown fences, no explanations, no commentary.
2. All CSS must be in a single <style> block inside <head>.
3. All JS must be in a single <script> block before </body>.
4. Use Google Fonts via @import (specified in design system) from Google Fonts CDN.
5. If a logo URL is provided, render it in the navbar/header as specified.
6. Include ALL uploaded images naturally within page sections.
7. Include a "Services" section if services are defined (use design system styling).
8. The page MUST be fully responsive (mobile-first).
9. NO external JS or CSS libraries except Google Fonts — everything self-contained.
10. Include proper <meta> viewport, charset, and a <title> tag.

═══ USER'S DESIGN & CONTENT REQUEST ═══
${userPrompt}`
    : `You are an elite web developer and UI designer.
Generate a COMPLETE, production-ready, single-file HTML page with INTERNAL <style> and <script> tags.

═══ BRAND IDENTITY ═══
Company Name        : ${branding.companyName || 'My Company'}
Company Description : ${branding.companyDescription || ''}
Logo URL            : ${branding.logo || '(none)'}
Favicon URL         : ${branding.favicon || '(none)'}
  Primary Color       : ${branding.primaryColor || '#8b5cf6'}
  Secondary Color     : ${branding.secondaryColor || '#6d28d9'}
  Accent Color        : ${branding.accentColor || '#06b6d4'}
  Background Color    : ${branding.bgColor || branding.backgroundColor || '#1a1a2e'}
  Text Color          : ${branding.textColor || '#ffffff'}
  Heading Font        : ${branding.fontHeading || 'Outfit'}
  Body Font           : ${branding.fontBody || 'Inter'}
${customPaletteBlock}
═══ BRAND IMAGES ═══
${imagesBlock}

═══ SERVICES OFFERED ═══
${servicesBlock}

${previousVersionContext}

═══ DESIGN GUIDELINES ═══
1. Output ONLY valid HTML — no markdown fences, no explanations, no commentary.
2. All CSS must be in a single <style> block inside <head>.
3. All JS must be in a single <script> block before </body>.
4. Use Google Fonts via <link> for the specified heading & body fonts.
5. If a logo URL is provided, render it in an <img> tag in the header/navbar.
6. Include ALL uploaded images naturally within the page content (hero, gallery, about sections, etc.).
7. Build a dedicated "Services" section displaying every service with name, description, and price.
8. Apply the brand color palette consistently (primary for CTAs, secondary for accents, etc.).
9. The page MUST be fully responsive (mobile-first, looks great on all devices).
10. Add smooth scroll, subtle animations/transitions, and a polished modern design.
11. NO external JS or CSS libraries — everything self-contained.
12. Include proper <meta> viewport, charset, and a <title> tag with the company name.

═══ USER REQUEST ═══
${userPrompt}`;

  console.log(`[AI_SDK] Calling AI model meta/muse-spark-1.2-contributor with high reasoning...`);
  const startTime = Date.now();
  try {
    const result = await generateText({
      model: 'meta/muse-spark-1.2-contributor',
      prompt: systemPrompt,
      reasoning: 'high',
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
