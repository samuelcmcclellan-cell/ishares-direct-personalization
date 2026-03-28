const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";

// BII Brand Colors
const C = {
  yellow:    "FFD100",
  black:     "000000",
  white:     "FFFFFF",
  darkGray:  "333333",
  medGray:   "666666",
  lightGray: "E5E5E5",
  orange:    "F6693D",
  gold:      "FFB800",
  green:     "00A854",
  pink:      "E8478D",
  teal:      "008B8B",
  red:       "CC0000",
};

// ── Helpers ──

function addFooter(slide, pageNum) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 4.95, w: 10.0, h: 0.675,
    fill: { color: C.darkGray },
  });
  slide.addText(
    "FOR INTERNAL USE ONLY. NOT FOR DISTRIBUTION. THIS MATERIAL IS NOT INVESTMENT ADVICE.",
    { x: 1.5, y: 5.0, w: 7.2, h: 0.55, fontSize: 6.5, color: C.white, align: "center", fontFace: "Arial", valign: "middle", bold: true }
  );
  if (pageNum) {
    slide.addText(String(pageNum), {
      x: 9.3, y: 5.08, w: 0.5, h: 0.35, fontSize: 9, color: C.white, align: "right", fontFace: "Arial", margin: 0,
    });
  }
}

function addHeadline(slide, text, opts) {
  const h = (opts && opts.h) || 0.7;
  slide.addText(text, {
    x: 0.5, y: 0.2, w: 7.2, h: h,
    fontSize: 27, color: C.black, bold: true, fontFace: "Arial Black", valign: "top", margin: 0,
  });
}

function addSubhead(slide, text, opts) {
  const y = (opts && opts.y) || 0.9;
  const h = (opts && opts.h) || 0.6;
  slide.addText(text, {
    x: 0.5, y: y, w: 9.0, h: h,
    fontSize: 13.5, color: C.medGray, fontFace: "Arial", valign: "top", margin: 0,
  });
}

function makeBigNumber(slide, number, label, x, y, w, color) {
  slide.addText(number, {
    x: x, y: y, w: w, h: 0.7,
    fontSize: 44, color: color || C.orange, bold: true, fontFace: "Arial Black", align: "center", margin: 0,
  });
  slide.addText(label, {
    x: x, y: y + 0.65, w: w, h: 0.45,
    fontSize: 11, color: C.medGray, fontFace: "Arial", align: "center", margin: 0,
  });
}

function addSource(slide, text, x, y, w) {
  slide.addText(text, {
    x: x, y: y || 4.4, w: w || 9.0, h: 0.55,
    fontSize: 7, color: "999999", fontFace: "Arial", valign: "top", margin: 0,
  });
}

// ════════════════════════════════════════════════
// SLIDE 1 — The Opportunity
// ════════════════════════════════════════════════

const s1 = pres.addSlide();

// Yellow top accent bar
s1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10.0, h: 0.08,
  fill: { color: C.yellow },
});

// Headline — declarative, punchy
addHeadline(s1, "iShares Can Own the Personalization Layer");
addSubhead(s1, "75M+ self-directed investors want portfolio guidance — not just product access. iShares has the scale, lineup, and brand to deliver it.", { y: 0.85 });

// ── Three stats in a clean row ──
const statY = 1.55;
const stats = [
  { num: "$3.9T+", label: "US AUM", color: C.orange },
  { num: "430+",   label: "US-Listed ETFs", color: C.orange },
  { num: "75M+",   label: "Self-Directed Accounts", color: C.orange },
];

// Light divider line behind stats
s1.addShape(pres.shapes.LINE, {
  x: 0.5, y: statY + 1.15, w: 9.0, h: 0,
  line: { color: C.lightGray, width: 1 },
});

stats.forEach((s, i) => {
  const x = 0.5 + i * 3.0;
  const w = 3.0;
  s1.addText(s.num, {
    x: x, y: statY, w: w, h: 0.65,
    fontSize: 40, color: s.color, bold: true, fontFace: "Arial Black", align: "center", margin: 0,
  });
  s1.addText(s.label, {
    x: x, y: statY + 0.6, w: w, h: 0.4,
    fontSize: 11, color: C.medGray, fontFace: "Arial", align: "center", margin: 0,
  });
});

// ── Core thesis — single clean block ──
const thesisY = 2.85;

s1.addText("THE OPPORTUNITY", {
  x: 0.5, y: thesisY, w: 9.0, h: 0.3,
  fontSize: 9, color: C.orange, bold: true, fontFace: "Arial", letterSpacing: 2, margin: 0,
});

const thesisPoints = [
  "Self-directed investors want guidance but won't pay for an advisor — they need a product-embedded solution",
  "Competitors (Schwab, Vanguard, Wealthfront) are racing to own this layer with robo-advisory tools",
  "iShares has the broadest ETF lineup, BII capital market assumptions, and institutional credibility to win",
  "The path: start with simple allocation models, layer in AI-driven personalization over time",
];
thesisPoints.forEach((item, i) => {
  s1.addText([
    { text: i < 2 ? "—  " : "+  ", options: { color: i < 2 ? C.orange : C.green, bold: true } },
    { text: item, options: { color: C.darkGray } },
  ], {
    x: 0.5, y: thesisY + 0.35 + i * 0.38, w: 9.0, h: 0.36,
    fontSize: 10.5, fontFace: "Arial", valign: "top", margin: 0,
  });
});

addSource(s1, "Source: BlackRock (US AUM, ETF count as of Q1 2026). Self-directed accounts: Cerulli Associates.", 0.5, 4.55, 9.0);
addFooter(s1, "1");


// ════════════════════════════════════════════════
// SLIDE 2 — Three Operating Models
// ════════════════════════════════════════════════

const s2 = pres.addSlide();

// Yellow top accent bar
s2.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10.0, h: 0.08,
  fill: { color: C.yellow },
});

addHeadline(s2, "Three Ways to Build This");
addSubhead(s2, "A spectrum from fast-to-market simplicity to full AI-powered portfolio intelligence. Start anywhere, evolve over time.");

// Arrow / progression line
s2.addShape(pres.shapes.LINE, {
  x: 0.8, y: 1.58, w: 8.4, h: 0,
  line: { color: C.lightGray, width: 2 },
});

// Three dots on the line
const dotColors = [C.green, C.orange, C.gold];
const dotX = [1.5, 4.85, 8.2];
dotX.forEach((x, i) => {
  s2.addShape(pres.shapes.OVAL, {
    x: x - 0.12, y: 1.46, w: 0.24, h: 0.24,
    fill: { color: dotColors[i] },
  });
});

// Column positions
const cols = [
  { x: 0.5,  w: 2.83, color: C.green,  label: "MODEL 1" },
  { x: 3.58, w: 2.83, color: C.orange, label: "MODEL 2" },
  { x: 6.67, w: 2.83, color: C.gold,   label: "MODEL 3" },
];

cols.forEach((col) => {
  // Model label
  s2.addText(col.label, {
    x: col.x, y: 1.82, w: col.w, h: 0.25,
    fontSize: 8.5, color: col.color, bold: true, fontFace: "Arial", align: "center", letterSpacing: 2, margin: 0,
  });
});

// Card backgrounds
const cardY = 2.1;
const cardH = 2.55;

// Model 1 card
s2.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 0.5, y: cardY, w: 2.83, h: cardH,
  fill: { color: "F7F7F7" }, rectRadius: 0.08,
  line: { color: C.lightGray, width: 0.5 },
});
// Green top accent
s2.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: cardY, w: 2.83, h: 0.06,
  fill: { color: C.green },
});

s2.addText("Portfolio Foundations", {
  x: 0.65, y: 2.25, w: 2.53, h: 0.35,
  fontSize: 14, color: C.black, bold: true, fontFace: "Arial Black", margin: 0,
});
s2.addText("Simple, fast, proven", {
  x: 0.65, y: 2.55, w: 2.53, h: 0.25,
  fontSize: 10, color: C.green, bold: true, fontFace: "Arial", margin: 0,
});

const m1Items = [
  "Static questionnaire → ~5 allocation ETFs",
  "Single-ticker portfolios (AOA, AOR, AOM, AOK)",
  "No rebalancing required",
  "Pre-approved, compliance-ready",
];
m1Items.forEach((item, i) => {
  s2.addText([
    { text: "•  ", options: { color: C.green } },
    { text: item, options: { color: C.darkGray } },
  ], {
    x: 0.65, y: 2.88 + i * 0.35, w: 2.53, h: 0.32,
    fontSize: 9, fontFace: "Arial", valign: "top", margin: 0,
  });
});

// Model 1 footer stats
s2.addText([
  { text: "4–6 wks", options: { bold: true, color: C.black } },
  { text: "  ·  ", options: { color: C.medGray } },
  { text: "$", options: { bold: true, color: C.green } },
  { text: "  ·  ", options: { color: C.medGray } },
  { text: "No AI", options: { color: C.medGray } },
], {
  x: 0.65, y: 4.3, w: 2.53, h: 0.25,
  fontSize: 9, fontFace: "Arial", margin: 0,
});


// Model 2 card
s2.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 3.58, y: cardY, w: 2.83, h: cardH,
  fill: { color: "F7F7F7" }, rectRadius: 0.08,
  line: { color: C.lightGray, width: 0.5 },
});
s2.addShape(pres.shapes.RECTANGLE, {
  x: 3.58, y: cardY, w: 2.83, h: 0.06,
  fill: { color: C.orange },
});

s2.addText("AI-Guided Portfolios", {
  x: 3.73, y: 2.25, w: 2.53, h: 0.35,
  fontSize: 14, color: C.black, bold: true, fontFace: "Arial Black", margin: 0,
});
s2.addText("Intelligent matching, curated output", {
  x: 3.73, y: 2.55, w: 2.53, h: 0.25,
  fontSize: 10, color: C.orange, bold: true, fontFace: "Arial", margin: 0,
});

const m2Items = [
  "AI-adaptive conversation profiles investors",
  "Matches to 15–20 pre-built model portfolios",
  "Full iShares + BlackRock active ETFs",
  "AI personalizes; humans curate portfolios",
];
m2Items.forEach((item, i) => {
  s2.addText([
    { text: "•  ", options: { color: C.orange } },
    { text: item, options: { color: C.darkGray } },
  ], {
    x: 3.73, y: 2.88 + i * 0.35, w: 2.53, h: 0.32,
    fontSize: 9, fontFace: "Arial", valign: "top", margin: 0,
  });
});

s2.addText([
  { text: "3–6 mos", options: { bold: true, color: C.black } },
  { text: "  ·  ", options: { color: C.medGray } },
  { text: "$$$", options: { bold: true, color: C.orange } },
  { text: "  ·  ", options: { color: C.medGray } },
  { text: "High AI", options: { color: C.medGray } },
], {
  x: 3.73, y: 4.3, w: 2.53, h: 0.25,
  fontSize: 9, fontFace: "Arial", margin: 0,
});


// Model 3 card
s2.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 6.67, y: cardY, w: 2.83, h: cardH,
  fill: { color: "F7F7F7" }, rectRadius: 0.08,
  line: { color: C.lightGray, width: 0.5 },
});
s2.addShape(pres.shapes.RECTANGLE, {
  x: 6.67, y: cardY, w: 2.83, h: 0.06,
  fill: { color: C.gold },
});

s2.addText("AI Portfolio Engine", {
  x: 6.82, y: 2.25, w: 2.53, h: 0.35,
  fontSize: 14, color: C.black, bold: true, fontFace: "Arial Black", margin: 0,
});
s2.addText("Full AI intelligence, ongoing engagement", {
  x: 6.82, y: 2.55, w: 2.53, h: 0.25,
  fontSize: 10, color: C.gold, bold: true, fontFace: "Arial", margin: 0,
});

const m3Items = [
  "LLM profiles investors + constructs portfolios",
  "Unlimited bespoke allocations in real-time",
  "Ongoing chatbot for investor questions",
  "AI agent: alerts, rebalancing, market insights",
];
m3Items.forEach((item, i) => {
  s2.addText([
    { text: "•  ", options: { color: C.gold } },
    { text: item, options: { color: C.darkGray } },
  ], {
    x: 6.82, y: 2.88 + i * 0.35, w: 2.53, h: 0.32,
    fontSize: 9, fontFace: "Arial", valign: "top", margin: 0,
  });
});

s2.addText([
  { text: "6–12 mos", options: { bold: true, color: C.black } },
  { text: "  ·  ", options: { color: C.medGray } },
  { text: "$$$$", options: { bold: true, color: C.gold } },
  { text: "  ·  ", options: { color: C.medGray } },
  { text: "Very High AI", options: { color: C.medGray } },
], {
  x: 6.82, y: 4.3, w: 2.53, h: 0.25,
  fontSize: 9, fontFace: "Arial", margin: 0,
});

addFooter(s2, "2");

// ── Save ──
const outPath = "public/deck/iShares_Direct_Personalization_2_Slides.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("Saved:", outPath);
});
