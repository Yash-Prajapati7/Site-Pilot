// ─── Skeletal Template Builder — Design System Definitions & Payload Compiler ─
// Compiles a structured, instruction-rich prompt for the Gemini API that ensures
// a single self-contained HTML file output with embedded CSS + JS.

// ── Prebuilt Templates ────────────────────────────────────────────────────────
export const PREBUILT_TEMPLATES = [
  {
    id: 'professional',
    name: 'Professional',
    subtitle: 'Minimalist',
    description: 'Clean geometry, generous whitespace, refined Swiss-grid typography',
    palette: ['#FFFFFF', '#F9FAFB', '#111111', '#6B7280', '#0066FF'],
    fontPreview: 'Inter',
    sections: [
      'Sticky navbar (logo left, links center, CTA button right)',
      'Hero (centered headline, subtitle, two buttons, trust-signal row)',
      'Feature cards (3-column icon grid)',
      'Stats bar (4 large numbers spanning full width)',
      'Testimonials (3-column card row)',
      'CTA strip (centered heading + one button)',
      'Mega footer (4-column: brand + 3 link groups)',
    ],
    geminiInstructions: `
DESIGN SYSTEM: PROFESSIONAL MINIMALIST

Color Rules:
  - Background: pure white #FFFFFF, and light surface #F9FAFB for alternate sections
  - All headings: #111111 (near-black)
  - Body text: #374151, secondary labels: #6B7280
  - ONE accent: electric blue #0066FF (buttons, active links, icon highlights ONLY)
  - Zero gradients anywhere — solid colors only
  - Card backgrounds: #FFFFFF, borders: 1px solid #E5E7EB

Typography:
  - @import Inter (weights 300–800) from Google Fonts
  - Headings: Inter 700–800, tight tracking (-0.02em)
  - Body: Inter 400–500, line-height 1.7
  - Section labels & captions: UPPERCASE, letter-spacing 0.08em, 11–13px
  - No decorative or serif fonts

Layout — STRICT RULES:
  - Container max-width: 1200px, centered with auto margins
  - Section vertical padding: 120px top + bottom
  - 0px border-radius on ALL elements (cards, buttons, inputs, images) — NO rounded corners
  - CSS Grid for all multi-column layouts (repeat(3, 1fr) etc.)

Components:
  - Buttons: flat fill (blue bg + white text) OR ghost (1px #111 border + #111 text, transparent bg)
  - Cards: white bg, 1px solid #E5E7EB border, 0px radius, NO box-shadow
  - Navbar: position:sticky top:0, white bg, 1px solid #E5E7EB bottom border, NO blur/backdrop
  - Section dividers: 1px solid #E5E7EB horizontal rule between sections
  - Icon boxes: plain 40×40px square, blue bg, white icon — absolutely NO rounded shapes
  - Hover states: border-color to #111 only — no transforms or scale effects`,
  },

  {
    id: 'casual',
    name: 'Casual',
    subtitle: 'Glassmorphism',
    description: 'Frosted glass surfaces, ambient gradient orbs, fluid animations',
    palette: ['#0D0D1A', '#1A1A2E', '#8B5CF6', '#06B6D4', 'rgba(255,255,255,0.07)'],
    fontPreview: 'Outfit',
    sections: [
      'Floating glass navbar (fixed, blur, transparent bg)',
      'Hero (centered, gradient text on H1, animated floating shapes)',
      'Feature cards (glass morphism panels, 3-col)',
      'Stats row (4 large glowing numbers)',
      'Testimonials (glass cards)',
      'CTA (glow button, gradient background block)',
      'Footer (minimal dark with social links)',
    ],
    geminiInstructions: `
DESIGN SYSTEM: GLASSMORPHISM / CASUAL

Color Rules:
  - Body background: #0D0D1A (very dark navy-black)
  - Inject 3 fixed background "orb" divs (position:fixed, pointer-events:none, z-index:0):
      Orb 1: top:-10%, left:-5%, 700px × 700px, radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 65%), filter:blur(80px)
      Orb 2: top:30%, right:-10%, 600px × 600px, radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 65%), filter:blur(80px)
      Orb 3: bottom:5%, left:25%, 500px × 500px, radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%), filter:blur(80px)
  - Primary: purple #8B5CF6, Secondary: #6D28D9, Accent: cyan #06B6D4
  - Text: white #FFFFFF, secondary: #A0A0B8

Typography:
  - @import Outfit (400–900) + Inter (400–600) from Google Fonts
  - All H1–H3: Outfit, gradient text: background: linear-gradient(135deg, #FFFFFF, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent
  - Body: Inter

Components — CRITICAL:
  - ALL cards: background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.3)
  - Card hover: transform: translateY(-6px); box-shadow: 0 16px 48px rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.3)
  - Navbar: position:fixed; background: rgba(255,255,255,0.02); backdrop-filter: blur(32px); border-bottom: 1px solid rgba(255,255,255,0.06); border-radius: 0
  - Buttons: border-radius: 99px (pill); Primary: bg rgba(139,92,246,0.15), border 1px solid rgba(139,92,246,0.5), box-shadow: 0 0 24px rgba(139,92,246,0.3)
  - Badges: pill shape, glass treatment, border: 1px solid rgba(255,255,255,0.15)
  - Icon containers: 48×48px circle, background rgba(139,92,246,0.15), border 1px solid rgba(139,92,246,0.3)

Animations:
  - @keyframes float: translateY(0px) → translateY(-12px) → translateY(0px), 3s ease-in-out infinite
  - Apply float animation to hero image/decorative element with animation-delay variations
  - Scroll reveal via IntersectionObserver: opacity 0 → 1, translateY(30px) → translateY(0)`,
  },

  {
    id: 'funky',
    name: 'Funky',
    subtitle: 'Neo-Brutalism',
    description: 'Raw borders, offset shadows, bold asymmetry, maximum energy',
    palette: ['#FFFFF0', '#FFEC3D', '#FF6B35', '#0A0A0A', '#2D2DE0'],
    fontPreview: 'Space Grotesk',
    sections: [
      'Navbar (thick black border, logo left, links right)',
      'Hero (yellow background, oversized UPPERCASE heading, offset CTA button)',
      'Ticker marquee strip (black border top + bottom, scrolling text)',
      'Feature cards (heavy black borders, offset shadows, colored icon boxes)',
      'Stats section (massive numbers, black bold)',
      'Testimonials (box-style, bordered)',
      'Footer (pure black bg, white text, link columns)',
    ],
    geminiInstructions: `
DESIGN SYSTEM: NEO-BRUTALISM / FUNKY

Color Rules:
  - Body background: #FFFFF0 (warm off-white)
  - Hero section background: #FFEC3D (bright yellow)
  - Footer background: #0A0A0A (near black), text: #FAFAFA
  - Alternating section accents: #FF6B35 (orange) or #2D2DE0 (electric blue) for select elements
  - ALL text on light sections: #0A0A0A
  - Accent highlights: yellow #FFEC3D, orange #FF6B35, or blue #2D2DE0

Typography:
  - @import Space Grotesk (400–700) from Google Fonts
  - ALL headings: Space Grotesk 700–900, UPPERCASE, letter-spacing -0.01em
  - Hero H1: clamp(56px, 10vw, 120px), uppercase, near-black
  - Body: Space Grotesk 400, line-height 1.6
  - Numbers/stats: 80–100px, bold, often in a contrasting accent color

Layout — ABSOLUTE RULES (break any of these = wrong):
  - border-radius: 0px on EVERYTHING — cards, buttons, inputs, images, badges, ALL elements
  - ALL cards: border: 3px solid #0A0A0A; box-shadow: 6px 6px 0px #0A0A0A
  - ALL buttons: border: 3px solid #0A0A0A; box-shadow: 4px 4px 0px #0A0A0A; background: #FFEC3D; color: #0A0A0A
  - Button hover: transform: translate(4px, 4px); box-shadow: none (shadow jumps to zero)
  - Section borders: 3px solid #0A0A0A on border-top + border-bottom for each section
  - Sticky navbar: border-bottom: 3px solid #0A0A0A; background: #FFFFF0
  - Icon boxes: solid yellow or orange filled square, 3px black border

Specific Patterns:
  - Marquee ticker: <div style="overflow:hidden; border-top:3px solid #0A0A0A; border-bottom:3px solid #0A0A0A; padding:16px 0;"> with scrolling span via CSS animation (translateX from 0 to -50%)
  - Decorative sticker: position:absolute element with text like "★ NEW" or "EST. 2025", rotated 10-15deg, yellow bg, black border, 0px radius
  - Use CSS counter or large inline numbers (01, 02, 03) for feature/step numbering in 80px font`,
  },

  {
    id: 'elegant',
    name: 'Elegant',
    subtitle: 'Dark Luxury',
    description: 'Obsidian backgrounds, gold accents, editorial serif typography',
    palette: ['#080808', '#141414', '#D4AF37', '#C9B48A', '#FFFFFF'],
    fontPreview: 'Cormorant Garamond',
    sections: [
      'Navbar (dark, thin gold bottom border, logo centered or left)',
      'Hero (full 100vh, large serif heading, cinematic breathing room)',
      'Feature rows (editorial alternating image + text, 3 rows)',
      'Gallery/showcase (dark cards with gold border)',
      'Testimonials (pull-quote style, oversized gold quotation marks)',
      'CTA block (dark + gold border + ghost button)',
      'Luxury footer (4-column: brand + 3 link groups, gold accents)',
    ],
    geminiInstructions: `
DESIGN SYSTEM: LUXURY DARK / ELEGANT

Color Rules:
  - Body background: #080808 (true black)
  - Card/section backgrounds: #141414, #101010 for variety
  - ONLY gold as accent: #D4AF37 (bright gold), #C9B48A (warm champagne gold)
  - Text: #FFFFFF primary, #D1D5DB secondary, #6B7280 muted
  - NEVER use blue, green, purple, red — ONLY gold/cream + white + black

Typography — CRITICAL:
  - @import 'Cormorant Garamond' (300, 400, 500, 600) + 'Jost' (300, 400, 500, 600) from Google Fonts
  - ALL h1, h2, h3, h4: font-family: 'Cormorant Garamond', serif; font-weight: 500–600; font-style: italic on h1
  - Body, nav links, UI labels: font-family: 'Jost', sans-serif
  - Hero H1: clamp(52px, 8vw, 96px); letter-spacing: 0.02em; font-style: italic
  - Subheadings: uppercase, tracked (letter-spacing: 0.2em), 12–14px, Jost 400, color: #D4AF37
  - Gold gradient text for major headings: background: linear-gradient(135deg, #D4AF37 0%, #C9B48A 50%, #D4AF37 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent

Layout:
  - Max border-radius: 4px (nearly square)
  - Section padding: 140px vertical (very generous)
  - Cards: background #141414; border: 1px solid rgba(212,175,55,0.2); box-shadow: 0 4px 24px rgba(212,175,55,0.06)
  - Navbar: position:sticky; background: #080808; border-bottom: 1px solid rgba(212,175,55,0.3)
  - Section ornamental divider: thin 1px gold line with a centered ◆ or ✦ symbol in gold

Components:
  - Buttons PRIMARY: background: transparent; border: 1px solid #D4AF37; color: #D4AF37; letter-spacing: 0.1em; UPPERCASE; text: Jost 500
  - Button hover: background: #D4AF37; color: #080808
  - Testimonials: oversized opening " in #D4AF37 (font-size: 120px; line-height: 0.6; font-family: Cormorant)
  - Feature rows: alternating 2-col (55%/45%) with a tall image placeholder, text block with numbered label in gold

Animations:
  - Subtle fade + translate-up on scroll via IntersectionObserver
  - No bounce, no rapid motion — everything moves slowly and elegantly
  - transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1)`,
  },

  {
    id: 'playful',
    name: 'Playful',
    subtitle: 'Neumorphism',
    description: 'Soft extruded shadows, tactile depth, bubbly rounded forms',
    palette: ['#E8ECF0', '#DDE3EA', '#6C63FF', '#FF6584', '#43D99B'],
    fontPreview: 'Nunito',
    sections: [
      'Navbar (neumorphic, no border, logo left)',
      'Hero (large neumorphic card container with headline inside)',
      'Feature cards (neumorphic raised panels, 3-col)',
      'Stats row (neumorphic badge counters)',
      'Testimonials (neumorphic cards with inset avatar)',
      'CTA (soft neumorphic action card)',
      'Footer (light, minimal, soft)',
    ],
    geminiInstructions: `
DESIGN SYSTEM: NEUMORPHISM / PLAYFUL

Color Rules — ABSOLUTE:
  - Body background: EXACTLY #E8ECF0 — every element that is "raised" MUST share this same bg color
  - Neumorphic raised shadow (EXACT): box-shadow: 8px 8px 16px #c8cdd3, -8px -8px 16px #ffffff
  - Neumorphic pressed/inset shadow (EXACT): box-shadow: inset 4px 4px 8px #c8cdd3, inset -4px -4px 8px #ffffff
  - NO borders on cards (shadows provide the illusion of depth)
  - Accent: purple #6C63FF, coral-pink #FF6584, mint #43D99B
  - Dark text ONLY: #2D3748 primary, #4A5568 secondary, #718096 muted
  - This is a LIGHT theme — no dark backgrounds

Typography:
  - @import Nunito (400–800, Extra Bold) from Google Fonts — this font is key for the playful feel
  - ALL text: Nunito
  - Headings: Nunito 700–800
  - Body: Nunito 400–500, line-height 1.7

Components — EVERY element uses neumorphic treatment:
  - All cards: background: #E8ECF0; border: none; border-radius: 20px; box-shadow: 8px 8px 16px #c8cdd3, -8px -8px 16px #ffffff; padding: 32px
  - Card hover: box-shadow: 12px 12px 24px #c8cdd3, -12px -12px 24px #ffffff; transform: scale(1.02)
  - Buttons (raised): background: #E8ECF0; border: none; border-radius: 20px; box-shadow: 6px 6px 12px #c8cdd3, -6px -6px 12px #ffffff; color: #6C63FF; font-weight: 700
  - Button hover: box-shadow: inset 4px 4px 8px #c8cdd3, inset -4px -4px 8px #ffffff (pressed)
  - Input fields: border: none; background: #E8ECF0; box-shadow: inset 4px 4px 8px #c8cdd3, inset -4px -4px 8px #ffffff; border-radius: 14px
  - Icon containers: 60×60px circle, same neumorphic shadow, flex center, accent-color icon
  - Navbar: background: #E8ECF0; box-shadow: 4px 4px 10px #c8cdd3, -4px -4px 10px #ffffff; no border

Specific Patterns:
  - Float 4–6 small decorative circles (20–40px, accent colors, position:absolute) in the hero background
  - Use large emoji-style icons (2–3rem) alongside Lucide icons for a playful feel
  - Neumorphic progress indicators or badges for stats section
  - All border-radius: minimum 16px, cards/buttons at 20px, circles at 50%`,
  },

  {
    id: 'cohere',
    name: 'Cohere',
    subtitle: 'Enterprise AI',
    description: 'Controlled enterprise AI command center, deep green bands, soft stone surfaces, Unica77 & mono type',
    palette: ['#000000', '#17171C', '#003C33', '#EEECE7', '#FF7759'],
    fontPreview: 'Space Grotesk / Inter',
    sections: [
      'Announcement bar (black strip, centered microcopy, close icon) + Sticky 3-zone Nav (logo left, centered links, pill CTA right)',
      'Hero (monumental display declaration over white canvas, two-card media composition: wide product mockup card + photography card)',
      'Trust logo strip (monochrome partner marks, generous vertical breathing room)',
      'Dark feature band (deep green-black #003c33 section, white text, pale translucent capability panels)',
      'Product cards (3-column soft stone #eeece7 cards, 8px radius, pill button, checkmark rows)',
      'Research & editorial table (coral taxonomy chips #ff7759, thin hairline rules #d9d9dd, topic pills, date alignment)',
      'Contact form card (rounded 22px white card on dark band, rectangular inputs, near-black pill submit)',
      'Dark footer newsletter (#17171c background, coral "AI moves fast" tag, email subscribe field, multi-column links)',
    ],
    geminiInstructions: `
DESIGN SYSTEM: COHERE / ENTERPRISE EDITORIAL AI COMMAND CENTER

Philosophy & Atmosphere:
  - Sober enterprise AI command center with editorial restraint, precision, and architectural discipline.
  - Stark white editorial canvas (#FFFFFF) interrupted by deep green-black (#003C33) or dark navy (#071829) product bands and soft stone mineral surfaces (#EEECE7).
  - Mix of austere black-and-white UI with tactile brand imagery and abstract product frames.
  - Color arrives strictly through photography, abstract 3D media, coral (#FF7759) blog taxonomy chips, action-blue (#1863DC) links, and dark product environments.
  - Zero decorative generic gradient fills — keep UI surfaces flat and crisp. Reserve gradient fields solely for media cards.

Exact Color Tokens (:root):
  --cohere-black: #000000;
  --primary: #17171C;
  --ink: #212121;
  --deep-green: #003C33;
  --dark-navy: #071829;
  --canvas: #FFFFFF;
  --soft-stone: #EEECE7;
  --pale-green: #EDFCE9;
  --pale-blue: #F1F5FF;
  --hairline: #D9D9DD;
  --border-light: #E5E7EB;
  --card-border: #F2F2F2;
  --muted: #93939F;
  --slate: #75758A;
  --body-muted: #616161;
  --action-blue: #1863DC;
  --focus-blue: #4C6EE6;
  --coral: #FF7759;
  --coral-soft: #FFAD9B;
  --form-focus: #9B60AA;
  --on-primary: #FFFFFF;
  --on-dark: #FFFFFF;

Typography Rules:
  - @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  - Display Headlines (CohereText substitute): 'Space Grotesk', ui-sans-serif, sans-serif
    * Hero Display: clamp(52px, 7vw, 96px), weight 400, line-height 1.0, letter-spacing -1.92px (-0.03em)
    * Product Display: clamp(40px, 5.5vw, 72px), weight 400, line-height 1.0, letter-spacing -1.44px
    * Section Display: clamp(32px, 4vw, 60px), weight 400, line-height 1.0, letter-spacing -1.2px
    * Section Heading: clamp(28px, 3.5vw, 48px), weight 400, line-height 1.2, letter-spacing -0.48px
  - Body & UI Text (Unica77 Cohere Web substitute): 'Inter', Arial, sans-serif
    * Card Heading: 24px–32px, weight 400, line-height 1.2, letter-spacing -0.32px
    * Feature Heading: 20px–24px, weight 400, line-height 1.3, letter-spacing 0px
    * Body Large: 18px, weight 400, line-height 1.4, letter-spacing 0px
    * Body Default: 16px, weight 400, line-height 1.5, color #212121
    * Button: 14px, weight 500, line-height 1.71, letter-spacing 0px
    * Caption: 14px, weight 400, line-height 1.4, color #93939F
    * Micro: 12px, weight 400, line-height 1.4, color #93939F
  - Monospace Labels (CohereMono substitute): 'JetBrains Mono', monospace
    * Mono Label: 13px–14px, weight 400, uppercase, letter-spacing 0.04em (0.28px)
  - TYPOGRAPHIC PRINCIPLE: Monumental scale without heavy weights. Weight 400 with negative tracking creates an architectural, carved impression.

Shapes & Radius Scale:
  - xs: 4px (small images, search fields, article thumbnails)
  - sm: 8px (blog chips, product cards, dialogs)
  - md: 16px (medium product cards, grouped blocks)
  - lg: 22px (SIGNATURE media-card, hero photo card, dark panels, form cards)
  - xl: 30px (research/topic filter pills)
  - pill: 32px / 9999px (primary CTA buttons, tags)

Layout & Elevation:
  - Default elevation is strictly FLAT. Depth is achieved via crisp 1px borders (#D9D9DD), mineral surface alternation (#EEECE7), and full-width dark bands (#003C33).
  - Generous whitespace: 80px to 100px vertical padding between sections as a trust signal.

Component Specifications:
  1. announcement-bar:
     - Full-width black strip (#000000), 36px height, white microcopy (12px), centered text with underlined "Learn more" link and a close "×" icon at the far right.
  2. navbar:
     - Sticky top:0, background: #FFFFFF, 1px solid #D9D9DD bottom border, height: 68px.
     - 3-zone layout: Brand wordmark left, navigation menu centered (14px Inter 400, color #212121), right zone with "Sign In" link + primary near-black pill CTA button.
  3. button-primary:
     - Near-black pill (#17171C), white text (#FFFFFF), font-size 14px, font-weight 500, padding 12px 24px, border-radius: 32px (pill).
     - On dark sections (#003C33 or #17171C), inverts to white pill (#FFFFFF) with dark text (#17171C).
  4. button-secondary:
     - Text-only link, color #212121, underlined (text-underline-offset: 4px), font-size 14px, no background fill.
  5. hero:
     - Centered colossal headline over white canvas (#FFFFFF), tight line-height 1.0, negative tracking. Lead copy in 18px Inter.
     - Followed by a two-card media composition:
       * Left: wide agent console card (#17171C background, 22px radius, status chips, prompt simulator, and model responses).
       * Right: narrower photography card (22px radius, enterprise photography or abstract 3D render).
  6. trust-logo-strip:
     - Centered uppercase caption ("TRUSTED BY GLOBAL ENTERPRISE LEADERS"), followed by a row of monochrome partner logos with wide horizontal spacing and generous vertical padding.
  7. dark-feature-band:
     - Full-width deep green (#003C33) section, white text.
     - Translucent capability cards (rgba(255,255,255,0.06) bg, 1px solid rgba(255,255,255,0.12) border, 22px radius, thin-line geometric icons, white 24px heading).
  8. product-card:
     - 3-column desktop grid. Soft stone (#EEECE7) background, 8px radius, 32px padding.
     - Model tier label, 32px display title, description, small pill CTA button, hairline divider, and checkmark feature rows.
  9. blog-filter-chip & research-table:
     - Distinctive Coral (#FF7759) taxonomy chips (outline or filled with dark text, 8px radius).
     - Publication rows separated by 1px solid #D9D9DD hairline rules: publication date left, title center, topic pills right, action link on hover.
  10. contact-form-card:
     - Rounded 22px white card set against dark green or stone section.
     - Clean rectangular inputs with 1px solid #D9D9DD borders, 12px 16px padding, near-black pill submit button.
  11. footer-newsletter:
     - Dark footer (#17171C background, text #FFFFFF).
     - Coral label "AI MOVES FAST", 32px heading, single-line email input with arrow submit button, 4-column link directory with muted #93939F links.

Strict Rules (Cohere):
  - DO use white canvas as the default surface; introduce dark green (#003C33) as full-bleed product bands.
  - DO use pill-shaped near-black (#17171C) CTAs on light surfaces.
  - DO use 22px radius on major media cards and placeholder frames.
  - DO use Coral (#FF7759) for editorial taxonomy chips and small warm markers ONLY.
  - DO NOT turn coral or blue into broad decorative surface colors or button backgrounds!
  - DO NOT add heavy drop shadows to cards — rely on 1px borders and surface contrast.
  - DO NOT replace the display/body type split with one generic voice. Display is Space Grotesk 400 tight; Body is Inter 400.`,
  },

  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    subtitle: 'Pastel Editorial',
    description: 'Quietly editorial print magazine voice AI, off-white canvas, warm near-black ink, weight 300 serif, pastel gradient orbs',
    palette: ['#F5F5F5', '#292524', '#A7E5D3', '#F4C5A8', '#C8B8E0'],
    fontPreview: 'EB Garamond 300',
    sections: [
      'Top navigation (64px, off-white #f5f5f5, wordmark left, menu center, ink pill CTA right)',
      'Hero band (off-white, 64px display serif weight 300, negative tracking, ink pill CTA + outline CTA, soft pastel gradient bloom)',
      'Atmospheric gradient orb feature cards (soft radial blooms: mint, peach, lavender, sky, rose)',
      'Voice library & audio waveform preview (circular 32px voice plate, waveform visualizer card, audio glyphs)',
      'Product & feature card grid (white cards #ffffff, 16px radius, 1px hairline border #e7e5e4, subtle lift)',
      'Pricing tier cards (32px padding, 16px radius, featured tier inverted to dark ink #0c0a09)',
      'Pre-footer CTA band (96px padding, 36px serif headline weight 300, single ink pill CTA)',
      'Editorial footer (off-white #f5f5f5, 5-column link list, quiet body typography)',
    ],
    geminiInstructions: `
DESIGN SYSTEM: ELEVENLABS / PASTEL EDITORIAL VOICE AI

Philosophy & Atmosphere:
  - Reads like a quietly editorial print magazine that happens to be a voice-AI product.
  - Generous editorial pacing, restrained type weights, and understated analog elegance.
  - Base canvas is off-white (#F5F5F5) holding warm near-black ink (#292524 / #0C0A09).
  - Brand voltage is photographic and atmospheric, NOT chromatic: soft pastel gradient orbs (mint, peach, lavender, sky, rose) drift through the page as the only color moments.
  - There is NO neon accent, NO saturated CTA color, and NO developer-tools dark-mode canvas.

Exact Color Tokens (:root):
  --primary: #292524;
  --primary-active: #0C0A09;
  --ink: #0C0A09;
  --body: #4E4E4E;
  --body-strong: #292524;
  --muted: #777169;
  --muted-soft: #A8A29E;
  --hairline: #E7E5E4;
  --hairline-soft: #F0EFED;
  --hairline-strong: #D6D3D1;
  --canvas: #F5F5F5;
  --canvas-soft: #FAFAFA;
  --canvas-deep: #0C0A09;
  --surface-card: #FFFFFF;
  --surface-strong: #F0EFED;
  --surface-dark: #0C0A09;
  --surface-dark-elevated: #1C1917;
  --on-primary: #FFFFFF;
  --on-dark: #FFFFFF;
  --on-dark-soft: #A8A29E;
  --gradient-mint: #A7E5D3;
  --gradient-peach: #F4C5A8;
  --gradient-lavender: #C8B8E0;
  --gradient-sky: #A8C8E8;
  --gradient-rose: #E8B8C4;

Typography Rules:
  - @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;1,400&family=Inter:wght@400;500;600&display=swap');
  - Display Font (Waldenburg Light substitute): 'EB Garamond', 'Times New Roman', serif
    * CRITICAL RULE: Display weight MUST ALWAYS STAY AT 400 (light serif). NEVER bold display headlines!
    * display-mega (Hero H1): clamp(44px, 6vw, 64px), weight 400 (light), line-height 1.05, letter-spacing -1.92px
    * display-xl (Sub-hero): clamp(34px, 4.5vw, 48px), weight 400, line-height 1.08, letter-spacing -0.96px
    * display-lg (Section heads): clamp(28px, 3.5vw, 36px), weight 400, line-height 1.17, letter-spacing -0.36px
    * display-md: 32px, weight 400, line-height 1.13, letter-spacing -0.32px
    * display-sm: 24px, weight 400, line-height 1.2, letter-spacing 0px
  - Body & UI Font: 'Inter', sans-serif
    * body-md (Default body): 16px, weight 400, line-height 1.5, letter-spacing +0.16px (slightly looser tracking for editorial airiness)
    * body-sm (Footer body): 15px, weight 400, line-height 1.47, letter-spacing +0.15px
    * title-md: 20px, weight 500, line-height 1.35
    * title-sm: 18px, weight 500, line-height 1.44, letter-spacing 0.18px
    * button: 15px, weight 500, line-height 1.0, letter-spacing 0px
    * caption-uppercase: 12px, weight 600, uppercase, letter-spacing 0.96px
  - NEVER drop body Inter to weight 300 to match the serif — body stays at 400/500 for crisp legibility.

Atmospheric Gradient Orbs (SIGNATURE PATTERN):
  - Pastel gradient stops appear ONLY as soft radial blooms inside gradient-orb-card and behind hero headlines:
    background: radial-gradient(circle at center, rgba(167,229,211,0.5) 0%, rgba(244,197,168,0.3) 40%, rgba(200,184,224,0.15) 70%, transparent 85%); filter: blur(50px);
  - NEVER use gradient orbs as button fills, text colors, or solid card surfaces! They are pure atmosphere.

Shapes & Radius Scale:
  - pill (9999px): ALL CTA buttons, badges, sub-actions
  - full (9999px): 32px circular voice icon plates, avatars
  - xl (16px): Feature cards, pricing tiers, waveform cards
  - xxl (24px): Gradient orb atmospheric cards
  - md (8px): Form text inputs

Layout & Elevation:
  - Section vertical rhythm: 96px padding between bands. Cards sit with 16–24px gap.
  - Hairline + soft drop: Cards use 1px solid #E7E5E4. Hover state lifts with subtle shadow: 0 4px 16px rgba(0, 0, 0, 0.04).

Component Specifications:
  1. top-nav:
     - 64px height, background #F5F5F5, 1px solid #E7E5E4 bottom border.
     - Serif wordmark left, menu links centered (15px Inter 500 #0C0A09), right side: "Sign in" text link + near-black ink pill button "Try free".
  2. button-primary:
     - Warm near-black pill (#292524), text #FFFFFF, font-size 15px, font-weight 500, padding 10px 20px, height 40px, border-radius: 9999px.
     - Active/press: #0C0A09.
  3. button-outline:
     - Transparent pill, text #0C0A09, border 1px solid #D6D3D1, padding 9px 19px, height 40px, border-radius: 9999px.
  4. hero-band:
     - Centered display headline in light serif (64px, weight 400, letter-spacing -1.92px), subhead in 16px Inter, two CTAs (primary ink pill + outline pill).
     - Atmospheric pastel gradient bloom drifting softly behind the centered copy.
  5. gradient-orb-card:
     - Large card (24px radius, #FAFAFA background, 32px padding) with soft pastel radial orbs (mint, peach, lavender, sky, rose) and minimal editorial serif title.
  6. audio-waveform-card:
     - Pure white card (#FFFFFF, 16px radius, 24px padding, 1px solid #E7E5E4).
     - Contains circular play button, animated/styled waveform bars, voice metadata, and preview duration.
  7. voice-row & voice-icon-circular:
     - Horizontal list row: 32px circular plate (#F0EFED background with initials/waveform glyph) left, voice title and category centered, audio preview button right.
  8. feature-card:
     - 3-column desktop grid. Pure white (#FFFFFF) background, 16px radius, 1px solid #E7E5E4, 24px padding.
  9. pricing-tier-card & pricing-tier-featured:
     - White cards with 16px radius, 1px hairline border, 32px padding.
     - Featured tier inverts to dark ink (#0C0A09) with white text. Both tiers use 9999px pill buttons.
  10. cta-band:
     - Pre-footer with 96px padding, centered 36px serif headline weight 400, single ink pill CTA.
  11. footer:
     - Off-white canvas (#F5F5F5), 5-column link directory (15px Inter 400, #4E4E4E), copyright strip.

Strict Rules (ElevenLabs):
  - DO reserve #292524 (ink pill) as the primary action color.
  - DO keep display serif weight at 400 (light). NEVER bold display copy!
  - DO use Inter with slight positive tracking (+0.16px) for body copy.
  - DO use pastel gradient orbs strictly as atmospheric decoration.
  - DO NOT introduce saturated bright button colors (no blue, green, purple buttons). Ink pill is the only primary CTA color.
  - DO NOT use sharp 0px corners on buttons — pill geometry (9999px) is the brand standard.`,
  },

  {
    id: 'lovable',
    name: 'Lovable',
    subtitle: 'Warm Parchment',
    description: 'Parchment cream canvas, charcoal ink, opacity-driven depth, signature button inset shadows, 6px border radius',
    palette: ['#F7F4ED', '#1C1C1C', '#ECEAE4', '#5F5F5D', '#FCFBF8'],
    fontPreview: 'Plus Jakarta Sans / Humanist',
    sections: [
      'Sticky top nav on cream (#f7f4ed), humanist wordmark, dark CTA with inset shadow and 6px radius',
      'Hero section (warm parchment, 60px weight 600 headline with -1.5px letter-spacing, charcoal inset CTA + ghost button)',
      'AI chat / prompt input box (generous cream input with #eceae4 border, 9999px pill suggestion tags, mode toggle)',
      'Template / project showcase gallery (grid of cards with 12px radius, 1px solid #eceae4 border, image + title)',
      'Stats bar (large 48px metrics, weight 600, muted gray label below, generous horizontal spacing)',
      'Feature cards (cream cards #f7f4ed, 12px radius, 1px solid #eceae4 border, no heavy drop shadows)',
      'Full-width warm footer (16px radius container, 1px solid #eceae4 border, multi-column link grid, soft bottom wash)',
    ],
    geminiInstructions: `
DESIGN SYSTEM: LOVABLE / WARM PARCHMENT & HUMANIST ANALOG

Philosophy & Atmosphere:
  - Radiates warmth through restraint — approachable, organic, and human, like a beautifully crafted designer notebook.
  - Built on a creamy, parchment-toned background (#F7F4ED). NEVER use cold pure white (#FFFFFF) as page background.
  - Organic charcoal ink (#1C1C1C) provides sharp readability without harsh digital black.
  - Opacity-driven depth model: all gray shades are derived from #1C1C1C at varying opacities for complete tonal harmony.
  - Depth is border-driven (#ECEAE4) and tactile (inset shadows on buttons), NOT floating on heavy drop shadows.

Exact Color Tokens (:root):
  --cream: #F7F4ED;
  --charcoal: #1C1C1C;
  --off-white: #FCFBF8;
  --border-light: #ECEAE4;
  --border-interactive: rgba(28, 28, 28, 0.4);
  --charcoal-83: rgba(28, 28, 28, 0.83);
  --charcoal-82: rgba(28, 28, 28, 0.82);
  --charcoal-40: rgba(28, 28, 28, 0.4);
  --charcoal-04: rgba(28, 28, 28, 0.04);
  --charcoal-03: rgba(28, 28, 28, 0.03);
  --muted-gray: #5F5F5D;
  --ring-blue: rgba(59, 130, 246, 0.5);
  --focus-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;

SIGNATURE INSET SHADOW ON DARK BUTTONS (MANDATORY):
  box-shadow: rgba(255, 255, 255, 0.2) 0px 0.5px 0px 0px inset, rgba(0, 0, 0, 0.2) 0px 0px 0px 0.5px inset, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;

Typography Rules:
  - @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
  - Primary Font (Camera Plain Variable substitute): 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif
  - STRICT TWO-WEIGHT SYSTEM:
    * Weight 400: Body copy, links, button labels, UI text, metadata
    * Weight 600: Headings, display titles, stats numbers
    * NEVER use weight 700 (bold) or 800!
  - Hierarchy & Negative Letter-Spacing:
    * Display Hero: clamp(42px, 6vw, 60px), weight 600, line-height 1.05–1.10, letter-spacing -1.5px
    * Section Heading: clamp(32px, 4.5vw, 48px), weight 600, line-height 1.10, letter-spacing -1.2px
    * Sub-heading: 36px, weight 600, line-height 1.10, letter-spacing -0.9px
    * Card Title: 20px, weight 400, line-height 1.25, letter-spacing 0px
    * Body Large: 18px, weight 400, line-height 1.38, color #5F5F5D
    * Body Default: 16px, weight 400, line-height 1.5, color #5F5F5D
    * Button Label: 16px, weight 400, line-height 1.5, color #FCFBF8 (on dark) or #1C1C1C (on ghost)
    * Caption: 14px, weight 400, line-height 1.5, color #5F5F5D

Shapes & Radius Scale:
  - 6px (Standard): Buttons, input fields, navigation controls
  - 12px (Card): Standard cards, image containers, template showcase items
  - 16px (Container): Large containers, footer wrapper
  - 9999px (Full Pill): Reserved ONLY for action suggestion tags and icon toggle buttons. Standard buttons use 6px!

Layout & Elevation:
  - Level 0 (Flat): Cream background (#F7F4ED), no box shadows on cards.
  - Level 1 (Bordered): 1px solid #ECEAE4 defines all card and image boundaries.
  - Level 2 (Inset): The signature tactile inset shadow on dark buttons.
  - Focus state: Soft diffused shadow rgba(0, 0, 0, 0.1) 0px 4px 12px + 2px ring blue.
  - Section vertical padding: 80px to 128px for lavish editorial breathing room.

Component Specifications:
  1. navigation:
     - Fixed/sticky on cream (#F7F4ED) background, 1px solid #ECEAE4 bottom border.
     - Brand logo left, links centered (16px weight 400, #1C1C1C), right CTA: dark button (#1C1C1C, 6px radius, signature inset shadow).
  2. button-primary (Primary Dark):
     - Background: #1C1C1C, color: #FCFBF8, padding: 8px 16px, border-radius: 6px, font-size: 16px, font-weight: 400.
     - Applies the exact signature multi-layer inset shadow. Active: opacity 0.8.
  3. button-outline (Ghost):
     - Background: transparent, color: #1C1C1C, border: 1px solid rgba(28, 28, 28, 0.4), border-radius: 6px, padding: 8px 16px.
  4. hero:
     - Warm parchment background, 60px weight 600 headline with tight -1.5px tracking, 18px subtitle in #5F5F5D.
     - Paired primary dark button (with inset shadow) and ghost button.
     - Soft atmospheric warm wash (pink/orange/blue tint) softly blooming behind hero.
  5. ai-chat-input:
     - Prominent prompt input container with 1px solid #ECEAE4 border, cream surface, input textarea.
     - Suggestion pills below with 9999px full-pill radius, 1px solid #ECEAE4 border, and hover border darkening.
     - Voice/action toggle pill button with inset shadow.
  6. template-gallery:
     - Grid of template cards on cream (#F7F4ED) background, each card: 12px radius, 1px solid #ECEAE4 border.
     - Image with 12px top radius, clean title below. Hover: border darkens to rgba(28, 28, 28, 0.4).
  7. stats-bar:
     - Large metrics: 48px+ weight 600 with -1.2px letter-spacing, #1C1C1C.
     - Descriptive labels below in #5F5F5D, 16px weight 400. Horizontal layout with generous spacing.
  8. feature-card:
     - Background #F7F4ED (matches page), border 1px solid #ECEAE4, radius 12px, padding 24px. No box shadow.
  9. footer:
     - Container with 16px border-radius, 1px solid #ECEAE4 border, cream fill with soft bottom gradient wash, multi-column links.

Strict Rules (Lovable):
  - DO use warm cream (#F7F4ED) as page foundation — NEVER pure white.
  - DO use the exact multi-layer inset shadow on dark buttons.
  - DO use #ECEAE4 borders for card containment instead of drop shadows.
  - DO maintain the strict two-weight system: 400 for body/UI, 600 for headings. NEVER use weight 700!
  - DO NOT apply 9999px pill radius on rectangular buttons — buttons use 6px radius! Pills are for suggestion tags/toggles only.
  - DO NOT introduce saturated accent colors — palette is intentionally warm neutral.`,
  },

  {
    id: 'replicate',
    name: 'Replicate',
    subtitle: 'Zine & Hot Orange',
    description: 'Warm cream canvas, hot orange primary CTA, bold 72px+ display type, monospace code wells, fully rounded interactive pills',
    palette: ['#F9F7F3', '#EA2804', '#202020', '#F3F0E8', '#FFFFFF'],
    fontPreview: 'Bricolage Grotesque',
    sections: [
      'Top nav bar (warm cream #f9f7f3, wordmark left, explore/pricing/docs links, GitHub icon + orange pill CTA right)',
      'Hero band (full-bleed hot orange #ea2804 band or warm cream opener with massive 72px-128px display headline, subtitle, pill CTAs)',
      'Model cards grid (white cards #ffffff, 10px radius, 1:1 square thumbnail, model slug, green running status badge)',
      'Code story & walkthrough section (dark inversion #202020 band, 2-up split: narrative copy left, JetBrains Mono code well with language tabs right)',
      'Collection tiles (cream-on-cream tiles inside surface-bone #f3f0e8 band, pill category tags)',
      'Pricing tiers (3 cards: 2 white + center card inverted to dark #202020 with white text, pill action buttons)',
      'Contributor community mosaic (band of 40px circular contributor avatars over warm textured canvas)',
      'Global footer (surface-deep #000000, off-white text, multi-column links, divider)',
    ],
    geminiInstructions: `
DESIGN SYSTEM: REPLICATE / ART ZINE & ML PLAYGROUND

Philosophy & Atmosphere:
  - Developer-tools platform with the soul of an indie art zine: "AI lab notebook crossed with print magazine".
  - Warm cream canvas (#F9F7F3) replaces the cold white or dark dev-tool defaults.
  - Hot orange accent (#EA2804) acts like an ink stamp — reserved strictly for the primary CTA, hero band, and links. Scarcely used: at most one orange element per viewport!
  - Monumental grotesque display type (up to 128px) packed tightly with lineHeight: 1.0 and negative letter-spacing.
  - Dark code wells (#202020) sit inside the cream canvas like printed pull-quotes.
  - Soft precision: EVERY interactive element is fully rounded (border-radius: 9999px). Content cards use 10px radius.

Exact Color Tokens (:root):
  --primary: #EA2804;
  --primary-deep: #C01F00;
  --on-primary: #FFFFFF;
  --ink: #202020;
  --body: #3A3A3A;
  --charcoal: #575757;
  --mute: #646464;
  --ash: #8D8D8D;
  --stone: #BBBBBB;
  --on-dark: #FCFCFC;
  --on-dark-mute: rgba(252, 252, 252, 0.72);
  --canvas: #F9F7F3;
  --surface-bone: #F3F0E8;
  --surface-card: #FFFFFF;
  --surface-dark: #202020;
  --surface-deep: #000000;
  --hairline: rgba(32, 32, 32, 0.12);
  --hairline-strong: #202020;
  --divider-dark: rgba(255, 255, 255, 0.2);
  --hero-warm: #EA2804;
  --hero-glow: #FF6A3D;
  --hero-pink: #F4A8A0;
  --badge-success: #2B9A66;
  --link: #EA2804;

Typography Rules:
  - @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  - Display Font (rb-freigeist-neue substitute): 'Bricolage Grotesque', 'Space Grotesk', sans-serif
    * display-xxl (Hero): clamp(60px, 9vw, 128px), weight 700–800, line-height 1.0, letter-spacing -3px (-0.03em)
    * display-xl (Section openers): clamp(42px, 5.5vw, 72px), weight 700, line-height 1.0, letter-spacing -1.8px
    * display-lg: clamp(32px, 4vw, 48px), weight 700, line-height 1.0, letter-spacing -1.0px
    * display-md: 30px, weight 600, line-height 1.2, letter-spacing -0.5px
  - UI & Body Font (basier-square substitute): 'Plus Jakarta Sans', 'Inter', sans-serif
    * body-lg: 18px, weight 400, line-height 1.56
    * body-md: 16px, weight 400, line-height 1.5, color #3A3A3A
    * body-sm: 14px, weight 400, line-height 1.43
    * button-md: 16px, weight 600, line-height 1.0
    * button-sm: 14px, weight 600, line-height 1.0
    * caption: 12px, weight 400, line-height 1.33
  - Monospace Code Font: 'JetBrains Mono', monospace
    * code-md: 14px, weight 400, line-height 1.43
    * code-sm: 11px, weight 400, line-height 1.5
  - STRICT LANES: Display in Bricolage Grotesque, Body in Plus Jakarta Sans, Code in JetBrains Mono. Never mix lanes.

Shapes & Radius Scale:
  - full (9999px): ALL interactive elements — buttons, inputs, status badges, avatars, sub-nav pills
  - md (10px): Model cards, collection tiles, code wells
  - lg (16px): Pricing tiers, larger feature containers
  - none (0px): Full-bleed hero band, footer

Layout & Elevation:
  - Section vertical rhythm: 96px vertical padding between bands.
  - Elevation is colour-blocking: cream canvas (#F9F7F3) → orange hero (#EA2804) → bone inset (#F3F0E8) → dark code band (#202020) → deep black footer (#000000).
  - 1px hairline dividers (rgba(32,32,32,0.12)) replace drop shadows on cream surfaces.

Component Specifications:
  1. nav-bar:
     - 60px height, background #F9F7F3, bottom border 1px solid rgba(32,32,32,0.12).
     - Logo wordmark left, links centered (14px Plus Jakarta Sans 600 #202020), right: GitHub icon + "Sign in" link + hot orange pill CTA.
  2. button-primary:
     - Background: #EA2804, color: #FFFFFF, border-radius: 9999px (pill), height: 44px, padding: 12px 24px, font-size: 16px, font-weight: 600.
     - Pressed/active: background #C01F00.
  3. button-dark:
     - Background: #202020, color: #FCFCFC, border-radius: 9999px, height: 44px, padding: 12px 24px, font-size: 16px, font-weight: 600.
  4. button-outline:
     - Background: #FFFFFF, color: #202020, border: 1px solid #202020, border-radius: 9999px, height: 44px, padding: 11px 23px.
  5. hero-band:
     - Full-bleed section with background #EA2804 and atmospheric radial glow mesh (radial-gradient(ellipse at 50% 30%, #FF6A3D 0%, #EA2804 55%, #C01F00 100%)).
     - Massive headline in white (up to 128px, line-height 1.0, tracking -3px), crisp subtitle, paired dark button and outline button.
  6. model-card:
     - 4-column desktop grid. Pure white (#FFFFFF) background, 10px radius, 16px padding, 1px solid rgba(32,32,32,0.12).
     - 1:1 square image thumbnail with 10px radius, model slug in bold, description in #575757, and green status pill ("● Running", #2B9A66 bg, white text) bottom-left.
  7. code-block (Dark Walkthrough Band):
     - Full-bleed #202020 dark band. 2-column split: narrative copy left, code block well right.
     - Code well: background #000000, 10px radius, padding 24px, code-tab strip on top (Python, Node.js, cURL) with active tab having orange (#EA2804) indicator, JetBrains Mono font.
  8. collection-tile:
     - Warm cream tiles inside surface-bone #F3F0E8 band, 10px radius, pill category tag chips.
  9. pricing-tier:
     - 3-tier grid. Left and right cards: white (#FFFFFF) with 16px radius. Center recommended card: inverted to dark (#202020) with white text. All cards use 9999px pill buttons.
  10. contributor-avatar:
     - Band of 40px circular contributor avatars with usernames and model stats over warm cream canvas.
  11. footer:
     - Full-bleed #000000 surface, 64px padding, white headings, muted links in 4 columns, copyright row.

Strict Rules (Replicate):
  - DO use warm cream (#F9F7F3) as default page background. White appears only inside cards and inputs.
  - DO reserve hot orange (#EA2804) for the primary CTA, hero band, and links — max 1 orange element per viewport.
  - DO set EVERY interactive element to 9999px (full pill) — buttons, inputs, badges, avatars.
  - DO use tight lineHeight: 1.0 and negative letter-spacing (-1.8px to -3px) on display headlines.
  - DO NOT put code in light boxes — code wells are always dark (#202020 or #000000).
  - DO NOT add drop shadows on cream surfaces — elevation is strictly colour-blocking.`,
  },
];

// ── Component Library ─────────────────────────────────────────────────────────
export const COMPONENT_LIBRARY = {
  navbar: {
    label: 'Navigation Bar',
    icon: '⬛',
    variants: [
      {
        id: 'navbar-1',
        name: 'Classic App Bar',
        description: 'Logo left · links center · CTA button right',
        geminiHint: 'Sticky navbar: logo + brand name far-left, 4–5 navigation links in the center, one prominent CTA button (e.g. "Get Started" or "Sign Up") far-right. Mobile: hide links, show hamburger icon that toggles a dropdown menu via JavaScript.',
      },
      {
        id: 'navbar-2',
        name: 'Centered Brand',
        description: 'Logo centered · links split symmetrically left & right',
        geminiHint: 'Navbar with brand logo/wordmark exactly centered, 3 navigation links on the left half and 3 on the right half. Symmetrical and balanced. No separate CTA button — the rightmost link acts as the call-to-action with a subtle visual distinction.',
      },
      {
        id: 'navbar-3',
        name: 'Mega Menu',
        description: 'Primary links with hoverable dropdown mega-menu panels',
        geminiHint: 'Navbar with logo far-left, 3–4 top-level nav links each with a down-arrow indicator. On hover, a full-width mega-menu panel drops down showing 3 columns of sub-links with icons and descriptions. Right side: search icon + user avatar icon. JavaScript handles hover open/close with smooth CSS transitions.',
      },
      {
        id: 'navbar-4',
        name: 'Minimal Strip',
        description: 'Logo only left · single CTA right · ultra-clean',
        geminiHint: 'Ultra-minimal navbar: logo/wordmark far-left, one CTA button far-right. No navigation links in the bar — only a hamburger icon (hidden on desktop, shown on mobile) that opens a fullscreen overlay menu via JavaScript. Maximum breathing room.',
      },
      {
        id: 'navbar-5',
        name: 'Announcement + Nav',
        description: 'Thin promo bar above · standard navbar below',
        geminiHint: 'Two-layer header: thin announcement/promo bar on very top (colored background, centered short promotional text + optional × dismiss button that hides the bar via JavaScript). Standard navbar directly below with logo left, links center, CTA right.',
      },
    ],
  },

  hero: {
    label: 'Hero Section',
    icon: '⬜',
    variants: [
      {
        id: 'hero-1',
        name: 'Centered Minimal',
        description: 'Badge · bold H1 · subtitle · dual CTA buttons',
        geminiHint: 'Centered hero (min-height: 90vh, flex center): small badge/tag element above the heading, large bold H1 (2–3 lines, clamp(42px, 7vw, 72px)), one-sentence subtitle paragraph in a muted color, two side-by-side CTA buttons (primary filled + secondary ghost). Below the buttons: a row of 4–5 trust badges or partner logos. No background image — use the theme\'s gradient or solid background.',
      },
      {
        id: 'hero-2',
        name: 'Split Screen',
        description: '50/50 split: content text left · product visual right',
        geminiHint: 'Two-column hero (CSS Grid 1fr 1fr, align-items:center, min-height: 90vh): left column has badge, H1, subtitle paragraph, two stacked or side-by-side CTA buttons; right column has a large product screenshot, device mockup, or illustration in a styled container with a themed border/shadow. Mobile: columns stack vertically (content top, image bottom).',
      },
      {
        id: 'hero-3',
        name: 'Typographic Bold',
        description: 'Oversized display H1 spanning full width',
        geminiHint: 'Typography-first hero: enormous H1 (clamp(64px, 12vw, 140px), font-weight 900) spanning the full container width, line-breaks for visual rhythm. ONE keyword in the heading highlighted with a different color or background fill. Below: single subtitle line (max 70 chars) + one CTA button. Optional: thin horizontal CSS marquee/ticker strip scrolling company name or tagline.',
      },
      {
        id: 'hero-4',
        name: 'Bento Grid',
        description: 'Heading top · staggered bento-card mosaic below',
        geminiHint: 'Bento-style hero: centered heading (H1) and subtitle at the top. Below: a CSS grid "bento mosaic" — approximately 4 cells at varying sizes: one tall-wide card (grid-row/column span), two standard cards, one wide short card. Cards show product features, stats (big number + label), or feature screenshots. Each card is themed with the design system.',
      },
      {
        id: 'hero-5',
        name: 'Immersive Overlay',
        description: 'Full-screen gradient bg · centered overlay text · scroll arrow',
        geminiHint: 'Full 100vh hero: body-spanning gradient background (use 2–3 color radial gradient positioned asymmetrically). Semi-transparent dark overlay div (background: rgba(0,0,0,0.4)). Content: bold white H1, subtitle, one CTA button — all absolutely centered (flexbox center). At the very bottom center: animated bouncing scroll-down arrow (CSS keyframe, no JS needed).',
      },
    ],
  },

  features: {
    label: 'Features / Services',
    icon: '⊞',
    variants: [
      {
        id: 'features-1',
        name: 'Icon Card Grid',
        description: '3–4 themed cards each with icon · title · description',
        geminiHint: 'Features section: centered section-heading H2 + subtext paragraph. Then a responsive 3-column grid of feature cards. Each card contains: a 48×48 colored icon container (emoji or lucide icon), bold feature title (H3), 2-sentence description in muted color. Cards use the theme\'s card styling. Mobile: single column.',
      },
      {
        id: 'features-2',
        name: 'Alternating Rows',
        description: 'Image alternates left/right with text + bullet list',
        geminiHint: 'Feature rows section: 3 alternating two-column rows (each row min-height 400px). Row 1: large image/illustration placeholder on LEFT, feature number (01), feature title H3, description paragraph, 3 checkmark bullet-list items on RIGHT. Row 2: text LEFT, image RIGHT. Row 3: image LEFT. Add a themed horizontal divider between rows. Mobile: stacks vertically.',
      },
      {
        id: 'features-3',
        name: 'Stats + Cards',
        description: 'Animated stat counters above · icon cards below',
        geminiHint: 'Two-part section. TOP: a full-width stats strip with 4 large animated counter numbers (e.g. "50K+ Users", "99.9% Uptime", "24/7 Support", "150+ Countries") — use IntersectionObserver + JS to animate the numbers counting up from 0 when visible. BOTTOM: standard 3-column icon feature cards (same structure as Icon Card Grid variant).',
      },
      {
        id: 'features-4',
        name: 'Tabbed Interface',
        description: 'Click-to-reveal: tab list left · feature detail right',
        geminiHint: 'Tabbed features section: left column (35%, flex-col) has 3–4 tab buttons stacked vertically; right column (65%) shows the selected tab\'s content: H3 title, description paragraph, 3 bullet points with checkmark icons, and a large placeholder product screenshot. JavaScript handles the tab-switching: adds .active class to clicked tab, shows the matching content panel, hides others. Add smooth CSS transition on content change.',
      },
      {
        id: 'features-5',
        name: 'Process Timeline',
        description: 'Numbered steps connected by a visual line',
        geminiHint: 'How-it-works timeline section: 4 numbered steps in a row (desktop) or column (mobile). Each step has: large step number (60–80px font, styled as "01" "02" etc.), step title H4, brief 1–2 sentence description. Steps connected by a dashed or solid line using CSS ::before or ::after pseudo-elements (position:absolute, horizontal line at step-number height). Mobile: vertical stacked layout with vertical connecting line.',
      },
    ],
  },

  footer: {
    label: 'Footer',
    icon: '▬',
    variants: [
      {
        id: 'footer-1',
        name: 'Simple Brand',
        description: 'Centered logo · social icons · copyright — nothing more',
        geminiHint: 'Minimal centered footer: logo/brand name in the theme font, tagline below in muted color, then a horizontal row of 5 social-media icon links (use Lucide icons: twitter, linkedin, github, instagram, youtube) spaced evenly, then a thin divider line, then copyright text. No link columns. Simple and clean.',
      },
      {
        id: 'footer-2',
        name: 'Four-Column Mega',
        description: 'Brand info + 3 link columns: Product · Company · Legal',
        geminiHint: 'Four-column footer (CSS Grid 1fr 1fr 1fr 1fr): Column 1 has logo, 2-sentence company description, row of 4 social icons; Column 2 "Product" with 6 inline-link items; Column 3 "Company" with 6 items; Column 4 "Legal" with 5 items. Bottom row (border-top): copyright text left, optional language selector or back-to-top link right. Mobile: 2×2 grid, then 1-col.',
      },
      {
        id: 'footer-3',
        name: 'Newsletter CTA',
        description: 'Bold subscribe CTA above · minimal copyright strip below',
        geminiHint: 'Footer with two zones. TOP ZONE: large bold heading ("Stay in the loop" or "Get updates"), subtitle, then an inline email subscribe form (text input + submit button side by side, using flexbox). BOTTOM ZONE: thin border-top divider, then one row with logo/brand left, 5 inline nav links centered, copyright text right. JavaScript shows a success message on form submit.',
      },
      {
        id: 'footer-4',
        name: 'Two-Column',
        description: 'Brand + social left · two link groups right',
        geminiHint: 'Two-section footer (CSS Grid 40% 60%): LEFT: logo + company description (2 sentences) + row of 4 social icon links stacked; RIGHT: two side-by-side columns of navigation links each with a heading (e.g. "Services", "Company") and 5–6 links. Bottom: thin border-top + copyright strip spanning full width.',
      },
      {
        id: 'footer-5',
        name: 'Minimal Strip',
        description: 'Single bar: logo left · inline links · copyright right',
        geminiHint: 'Ultra-minimal single-row footer: border-top, then one horizontal flex row with: logo/wordmark far-left, 5 inline navigation links centered (using flex gap), copyright text far-right. Padding 24px vertical. Absolutely nothing else — no columns, no social icons, no extras.',
      },
    ],
  },
};

// ── Payload Compiler ──────────────────────────────────────────────────────────

const BASE_REQUIREMENTS = `╔══════════════════════════════════════════════════════════╗
║           OUTPUT FORMAT — MANDATORY REQUIREMENTS          ║
╚══════════════════════════════════════════════════════════╝

1.  Output ONLY a single, complete HTML file
2.  Begin with <!DOCTYPE html> — absolutely nothing before it
3.  ALL CSS inside ONE <style> tag in <head>
4.  ALL JavaScript inside ONE <script> tag before </body>
5.  NO external CSS files or frameworks (no Bootstrap, no Tailwind, no CDN stylesheets)
6.  Google Fonts: use @import inside the <style> tag ONLY
7.  Lucide icons: load via <script src="https://unpkg.com/lucide@latest"></script>, call lucide.createIcons() at end of your <script>
8.  All images: https://picsum.photos/{width}/{height}?random={n} (increment n for each image)
9.  Fully responsive: include @media (max-width: 768px) breakpoint CSS
10. Include JavaScript for: smooth scroll, mobile menu toggle, scroll-reveal animations via IntersectionObserver
11. Valid HTML5 meta tags: charset, viewport, title, meta description
12. Write REAL content — no "Lorem ipsum". Invent a realistic company name, taglines, and copy.
13. The page must look complete, polished, and production-ready`.trim();

/**
 * Compiles a user's template selection + prompt into a structured Gemini API payload.
 * @param {Object} opts
 * @param {'prebuilt'|'custom'|'plain'} opts.mode
 * @param {string} [opts.templateId] - ID of prebuilt template
 * @param {Object} [opts.selections] - { navbar: 'navbar-2', hero: 'hero-1', ... }
 * @param {string} opts.userPrompt - User's description of what to build
 * @returns {{ enhancedPrompt: string, mode: string, templateName: string|null }}
 */
export function compilePayload({ mode, templateId, selections, userPrompt }) {
  const prompt = userPrompt?.trim() || 'Build a professional business website.';

  // ── Prebuilt Template ──────────────────────────────────────────────────────
  if (mode === 'prebuilt') {
    const template = PREBUILT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return _plainPayload(prompt);

    const enhancedPrompt = [
      BASE_REQUIREMENTS,
      '',
      `╔══════════════════════════════════════════════════════════╗`,
      `║  DESIGN SYSTEM: ${template.name.toUpperCase()} — ${template.subtitle.toUpperCase()}`,
      `╚══════════════════════════════════════════════════════════╝`,
      template.geminiInstructions.trim(),
      '',
      `╔══════════════════════════════════════════════════════════╗`,
      `║  PAGE SECTIONS (include ALL, in this exact order)        ║`,
      `╚══════════════════════════════════════════════════════════╝`,
      template.sections.map((s, i) => `  ${i + 1}. ${s}`).join('\n'),
      '',
      `╔══════════════════════════════════════════════════════════╗`,
      `║  USER'S WEBSITE REQUEST                                  ║`,
      `╚══════════════════════════════════════════════════════════╝`,
      prompt,
    ].join('\n');

    return {
      enhancedPrompt,
      mode: 'prebuilt',
      templateId,
      templateName: `${template.name} — ${template.subtitle}`,
      userPrompt: prompt,
    };
  }

  // ── Custom Component Build ─────────────────────────────────────────────────
  if (mode === 'custom') {
    const componentHints = Object.entries(selections || {})
      .filter(([, v]) => v)
      .map(([sectionKey, variantId]) => {
        const section = COMPONENT_LIBRARY[sectionKey];
        const variant = section?.variants.find(v => v.id === variantId);
        if (!variant) return null;
        return [
          `── ${section.label.toUpperCase()}: "${variant.name}" ──`,
          variant.geminiHint,
        ].join('\n');
      })
      .filter(Boolean);

    if (componentHints.length === 0) return _plainPayload(prompt);

    const sectionOrder = ['navbar', 'hero', 'features', 'footer'];
    const orderedHints = sectionOrder
      .map(k => {
        if (!selections?.[k]) return null;
        const section = COMPONENT_LIBRARY[k];
        const variant = section?.variants.find(v => v.id === selections[k]);
        if (!variant) return null;
        return `── ${section.label.toUpperCase()}: "${variant.name}" ──\n${variant.geminiHint}`;
      })
      .filter(Boolean);

    const enhancedPrompt = [
      BASE_REQUIREMENTS,
      '',
      `╔══════════════════════════════════════════════════════════╗`,
      `║  PAGE COMPONENT SPECIFICATIONS                           ║`,
      `╚══════════════════════════════════════════════════════════╝`,
      'Build each section EXACTLY as described. Ensure visual consistency — pick ONE cohesive color palette and font pairing for the entire page.',
      '',
      orderedHints.join('\n\n'),
      '',
      `╔══════════════════════════════════════════════════════════╗`,
      `║  USER'S WEBSITE REQUEST                                  ║`,
      `╚══════════════════════════════════════════════════════════╝`,
      prompt,
    ].join('\n');

    const selectedNames = sectionOrder
      .filter(k => selections?.[k])
      .map(k => {
        const v = COMPONENT_LIBRARY[k]?.variants.find(v => v.id === selections[k]);
        return v ? `${COMPONENT_LIBRARY[k].label}: ${v.name}` : null;
      })
      .filter(Boolean)
      .join(', ');

    return {
      enhancedPrompt,
      mode: 'custom',
      selections,
      templateName: `Custom Build (${selectedNames})`,
      userPrompt: prompt,
    };
  }

  return _plainPayload(prompt);
}

function _plainPayload(prompt) {
  return {
    enhancedPrompt: `${BASE_REQUIREMENTS}\n\n╔══════════════════════════════════════════════════════════╗\n║  USER'S WEBSITE REQUEST                                  ║\n╚══════════════════════════════════════════════════════════╝\n${prompt}`,
    mode: 'plain',
    templateName: null,
    userPrompt: prompt,
  };
}
