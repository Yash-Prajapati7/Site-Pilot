import {
  BASE_REQUIREMENTS,
  PREBUILT_TEMPLATES,
  COMPONENT_LIBRARY,
  getTemplateById,
} from '../config/templates.js';
import { GENERATION_MODE, JS_TYPES } from '../config/constants.js';

/**
 * Builds the complete system + design system + branding + user prompt for AI generation.
 *
 * @param {Object} opts
 * @param {string} opts.prompt - The clean user prompt/request
 * @param {string} [opts.templateId] - Prebuilt template ID (e.g., 'cohere', 'elevenlabs', 'professional')
 * @param {string} [opts.mode='prebuilt'] - 'prebuilt' | 'custom' | 'plain'
 * @param {Object} [opts.selections] - Custom component selections { navbar, hero, features, footer }
 * @param {Object} [opts.branding] - Tenant branding document / object
 * @param {string} [opts.previousHtml] - Previous HTML for iterative edits
 * @param {Array} [opts.conversationHistory] - Previous user prompts / turns (up to last 6 turns)
 * @param {string} [opts.websiteName] - Canonical website/project name
 * @param {string} [opts.businessType] - Canonical business type/niche
 * @returns {string} Fully stitched prompt ready for the AI model
 */
export function buildSystemPrompt({
  prompt,
  templateId,
  mode = GENERATION_MODE.PREBUILT,
  selections,
  branding = {},
  previousHtml = '',
  conversationHistory = [],
  websiteName = '',
  businessType = '',
}) {
  const userPrompt = (prompt || '').trim() || 'Build a modern, complete, professional website.';
  const isEditMode = Boolean(previousHtml && previousHtml.trim().length > 100);

  // Normalize chronological past turns (limit to last 6 turns)
  const pastTurns = Array.isArray(conversationHistory)
    ? conversationHistory
      .map((item) => {
        if (typeof item === JS_TYPES.STRING) return item.trim();
        if (item?.content && item?.role === 'user') return item.content.trim();
        if (item?.prompt) return item.prompt.trim();
        return '';
      })
      .filter(Boolean)
    : [];

  const recentPastTurns = pastTurns.slice(-6);
  // If the last item in history is identical to the current userPrompt, remove it from past turns
  if (recentPastTurns.length > 0 && recentPastTurns[recentPastTurns.length - 1] === userPrompt) {
    recentPastTurns.pop();
  }

  let conversationTurnsBlock = '';
  if (recentPastTurns.length > 0) {
    const turnsText = recentPastTurns
      .map((t, idx) => `  Turn ${idx + 1} (Previous Instruction): "${t}"`)
      .join('\n');
    conversationTurnsBlock = `
# PRIOR CONVERSATION HISTORY (CHRONOLOGICAL TURNS)
Review all prior instructions that shaped the previous version:
${turnsText}
  Turn ${recentPastTurns.length + 1} (LATEST INSTRUCTION TO EXECUTE NOW): "${userPrompt}"
`;
  }

  // 1. Format services list
  const servicesBlock = branding.services?.length
    ? branding.services
      .map(
        (s, i) =>
          `  ${i + 1}. ${s.name} — ${s.description || 'No description'} | Price: $${s.price ?? 'N/A'}`
      )
      .join('\n')
    : '  (No specific services defined)';

  // 2. Format available images
  const imagesBlock = branding.images?.length
    ? branding.images
      .map((img, i) => `  Image ${i + 1}: ${img.url} (alt: "${img.alt || 'image'}")`)
      .join('\n')
    : '  (No custom images uploaded; use picsum placeholders as defined in base requirements)';

  // 3. Format custom color palette (:root) or brand colors
  let colorBlock = '';
  if (isEditMode) {
    // In edit mode, the established styling and :root tokens in previousHtml MUST be preserved
    if (branding.userProvidedColorPallete?.trim()) {
      colorBlock = `
# MANDATORY CUSTOM CSS COLOR PALETTE (:root)
${branding.userProvidedColorPallete.trim()}
Ensure all modifications strictly preserve and surround these exact CSS custom properties.`;
    } else {
      colorBlock = `
# COLOR THEME DIRECTIVE (INCREMENTAL EDIT MODE)
CRITICAL: PRESERVE the exact color palette, custom CSS variables (:root tokens), surface/canvas lightness, and button colors from the PREVIOUS VERSION. Do NOT inject new conflicting brand colors or flip between dark and light modes unless explicitly requested in the latest instruction.`;
    }
  } else {
    // Initial generation from scratch
    if (branding.userProvidedColorPallete?.trim()) {
      colorBlock = `
# MANDATORY CUSTOM CSS COLOR PALETTE (:root)
The user has specified the following exact CSS color palette:
${branding.userProvidedColorPallete.trim()}

CRITICAL COLOR & DESIGN DIRECTIVES:
1. Define these EXACT custom properties inside the :root selector in the <style> tag.
2. The entire website's visual aesthetic, backgrounds, hero gradients, buttons, cards, borders, accents, and navigation MUST strictly surround and use these exact CSS custom properties.`;
    } else if (branding.primaryColor || branding.bgColor) {
      colorBlock = `
# BRAND COLOR SCHEME & THEME (from Tenant Schema)
- Primary Brand Color    : ${branding.primaryColor || '#8B5CF6'}
- Secondary Brand Color  : ${branding.secondaryColor || '#6D28D9'}
- Accent Color           : ${branding.accentColor || '#06B6D4'}
- Background Color       : ${branding.bgColor || branding.backgroundColor || '#0D0D1A'}
- Text Color             : ${branding.textColor || '#FFFFFF'}
- Heading Font           : ${branding.fontHeading || 'Outfit'}
- Body Font              : ${branding.fontBody || 'Inter'}

Harmonize these brand colors within the chosen design system rules.`;
    }
  }

  // 4. Strict Edit Mode Directives & Previous version context
  let editModeDirectives = '';
  let previousVersionContext = '';

  if (isEditMode) {
    const effectiveSiteName = websiteName || branding.companyName || 'the existing brand';
    editModeDirectives = `
# INCREMENTAL EDIT MODE — STRICT PRESERVATION RULES
You are performing an INCREMENTAL EDIT on the previous version HTML. You are NOT generating a new website from scratch.

CRITICAL INSTRUCTIONS:
1. ONLY EDIT THE PREVIOUS VERSION HTML WITH THE LATEST INSTRUCTION:
   - Use the code in PREVIOUS VERSION as your canonical base.
   - Modify ONLY what is requested by the latest instruction ("${userPrompt}").
   - Leave all other sections, functional code, and layout intact.

2. PRESERVE THE ESTABLISHED BRAND & DOMAIN IDENTITY:
   - The brand/site is for "${effectiveSiteName}"${businessType ? ` (${businessType})` : ''}.
   - OVERRIDE OF BASE REQUIREMENT #12: DO NOT invent a new company name, brand persona, or product niche.
   - DO NOT replace existing headlines, body copy, or feature texts unless explicitly requested.

3. PRESERVE THE ESTABLISHED COLOR PALETTE & VISUAL THEME:
   - Maintain the exact color scheme, CSS variables (:root tokens), background lightness/darkness, and button styles defined in the PREVIOUS VERSION.
   - If the previous version is a light theme (e.g. white/light canvas, bluish/purple accents), KEEP IT LIGHT with those exact accent colors.
   - DO NOT flip to dark mode, near-black ink, or change button colors unless explicitly requested.

4. PRESERVE JAVASCRIPT & ASSETS:
   - Retain all existing Lucide icons, mobile navigation JavaScript, scroll observers, and CSS animations.
   - Output ONLY the single, complete, updated HTML file starting with <!DOCTYPE html>.
`;

    previousVersionContext = `
# PREVIOUS VERSION (EXACT HTML TO MODIFY)
\`\`\`html
${previousHtml}
\`\`\`
Apply the user's latest instruction directly to the HTML above while strictly preserving its identity, theme, and structure.
`;
  }

  // 5. Brand Identity Block
  const effectiveCompanyName = websiteName || branding.companyName || 'My Company';
  const effectiveCompanyDesc = branding.companyDescription || '';
  const brandAssetsBlock = `
# BRAND ASSETS & CONTENT
Company Name        : ${effectiveCompanyName}
Company Description : ${effectiveCompanyDesc}
Logo URL            : ${branding.logo || '(none)'}
Favicon URL         : ${branding.favicon || '(none)'}

═══ UPLOADED BRAND IMAGES ═══
${imagesBlock}

═══ SERVICES OFFERED ═══
${servicesBlock}
${colorBlock}
`;

  // 6. Design System instructions based on mode / templateId
  let designSystemBlock = '';
  const template = templateId ? getTemplateById(templateId) : null;

  if (mode === GENERATION_MODE.CUSTOM && selections && Object.keys(selections).length > 0) {
    const sectionOrder = ['navbar', 'hero', 'features', 'footer'];
    const orderedHints = sectionOrder
      .map((k) => {
        if (!selections?.[k]) return null;
        const section = COMPONENT_LIBRARY[k];
        const variant = section?.variants.find((v) => v.id === selections[k]);
        if (!variant) return null;
        return `── ${section.label.toUpperCase()}: "${variant.name}" ──\n${variant.geminiHint}`;
      })
      .filter(Boolean);

    if (orderedHints.length > 0) {
      designSystemBlock = [
        `# PAGE COMPONENT SPECIFICATIONS`,
        'Build each section EXACTLY as described. Ensure visual consistency — pick ONE cohesive color palette and font pairing for the entire page.',
        '',
        orderedHints.join('\n\n'),
      ].join('\n');
    }
  }

  if (!designSystemBlock && template) {
    const templateInstructions = (template.designInstructions || template.geminiInstructions || '').trim();
    if (isEditMode) {
      designSystemBlock = [
        `# DESIGN SYSTEM INSPIRATION: ${template.name.toUpperCase()} — ${template.subtitle.toUpperCase()}`,
        `NOTE: Use the following guidelines ONLY for structural and stylistic reference. DO NOT override the established website copy, company name, or colors from PREVIOUS VERSION with template default names or personas.`,
        '',
        templateInstructions,
      ].join('\n');
    } else {
      designSystemBlock = [
        `# DESIGN SYSTEM: ${template.name.toUpperCase()} — ${template.subtitle.toUpperCase()}`,
        templateInstructions,
        '',
        `# PAGE SECTIONS (include ALL, in this exact order)`,
        template.sections.map((s, i) => `  ${i + 1}. ${s}`).join('\n'),
      ].join('\n');
    }
  }

  // 7. Assemble full prompt
  const parts = [
    BASE_REQUIREMENTS,
    '',
    editModeDirectives,
    '',
    designSystemBlock,
    '',
    brandAssetsBlock,
    '',
    conversationTurnsBlock,
    '',
    previousVersionContext,
    '',
    `# LATEST USER REQUEST (TURN ${recentPastTurns.length + 1})`,
    userPrompt,
  ].filter((p) => p !== undefined && p !== null);

  return parts.join('\n');
}
