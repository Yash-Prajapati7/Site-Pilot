import {
  BASE_REQUIREMENTS,
  PREBUILT_TEMPLATES,
  COMPONENT_LIBRARY,
  getTemplateById,
} from '../config/templates.js';
import { GENERATION_MODE } from '../config/constants.js';

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
 * @returns {string} Fully stitched prompt ready for the AI model
 */
export function buildSystemPrompt({
  prompt,
  templateId,
  mode = GENERATION_MODE.PREBUILT,
  selections,
  branding = {},
  previousHtml = '',
}) {
  const userPrompt = (prompt || '').trim() || 'Build a modern, complete, professional website.';

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
  if (branding.userProvidedColorPallete?.trim()) {
    colorBlock = `
╔══════════════════════════════════════════════════════════╗
║  MANDATORY CUSTOM CSS COLOR PALETTE (:root)              ║
╚══════════════════════════════════════════════════════════╝
The user has specified the following exact CSS color palette:
${branding.userProvidedColorPallete.trim()}

CRITICAL COLOR & DESIGN DIRECTIVES:
1. Define these EXACT custom properties inside the :root selector in the <style> tag.
2. The entire website's visual aesthetic, backgrounds, hero gradients, buttons, cards, borders, accents, and navigation MUST strictly surround and use these exact CSS custom properties.`;
  } else if (branding.primaryColor || branding.bgColor) {
    colorBlock = `
╔══════════════════════════════════════════════════════════╗
║  BRAND COLOR SCHEME & THEME (from Tenant Schema)          ║
╚══════════════════════════════════════════════════════════╝
- Primary Brand Color    : ${branding.primaryColor || '#8B5CF6'}
- Secondary Brand Color  : ${branding.secondaryColor || '#6D28D9'}
- Accent Color           : ${branding.accentColor || '#06B6D4'}
- Background Color       : ${branding.bgColor || branding.backgroundColor || '#0D0D1A'}
- Text Color             : ${branding.textColor || '#FFFFFF'}
- Heading Font           : ${branding.fontHeading || 'Outfit'}
- Body Font              : ${branding.fontBody || 'Inter'}

Harmonize these brand colors within the chosen design system rules.`;
  }

  // 4. Previous version context (for styling continuity during iterative edits)
  const previousVersionContext = previousHtml
    ? `
╔══════════════════════════════════════════════════════════╗
║  PREVIOUS VERSION (for styling & layout reference)       ║
╚══════════════════════════════════════════════════════════╝
Use this as a reference to maintain design consistency, color scheme, typography, and layout patterns:
\`\`\`html
${previousHtml}
\`\`\`
Maintain its visual styling and structure while implementing the user's modifications.\n`
    : '';

  // 5. Brand Identity Block
  const brandAssetsBlock = `
╔══════════════════════════════════════════════════════════╗
║  BRAND ASSETS & CONTENT                                  ║
╚══════════════════════════════════════════════════════════╝
Company Name        : ${branding.companyName || 'My Company'}
Company Description : ${branding.companyDescription || ''}
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
        `╔══════════════════════════════════════════════════════════╗`,
        `║  PAGE COMPONENT SPECIFICATIONS                           ║`,
        `╚══════════════════════════════════════════════════════════╝`,
        'Build each section EXACTLY as described. Ensure visual consistency — pick ONE cohesive color palette and font pairing for the entire page.',
        '',
        orderedHints.join('\n\n'),
      ].join('\n');
    }
  }

  if (!designSystemBlock && template) {
    designSystemBlock = [
      `╔══════════════════════════════════════════════════════════╗`,
      `║  DESIGN SYSTEM: ${template.name.toUpperCase()} — ${template.subtitle.toUpperCase()}`,
      `╚══════════════════════════════════════════════════════════╝`,
      (template.designInstructions || template.geminiInstructions || '').trim(),
      '',
      `╔══════════════════════════════════════════════════════════╗`,
      `║  PAGE SECTIONS (include ALL, in this exact order)        ║`,
      `╚══════════════════════════════════════════════════════════╝`,
      template.sections.map((s, i) => `  ${i + 1}. ${s}`).join('\n'),
    ].join('\n');
  }

  // 7. Assemble full prompt
  const parts = [
    BASE_REQUIREMENTS,
    '',
    designSystemBlock,
    '',
    brandAssetsBlock,
    previousVersionContext,
    `╔══════════════════════════════════════════════════════════╗`,
    `║  USER'S WEBSITE REQUEST                                  ║`,
    `╚══════════════════════════════════════════════════════════╝`,
    userPrompt,
  ].filter((p) => p !== undefined && p !== null);

  return parts.join('\n');
}
