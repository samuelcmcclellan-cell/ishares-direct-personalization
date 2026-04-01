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

// Yellow left accent bar
s1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 0.12, h: 5.625,
  fill: { color: C.yellow },
});

// Headline — large, clean, commanding
s1.addText("From ETF Provider\nto Personalization Engine", {
  x: 0.6, y: 0.5, w: 8.5, h: 1.4,
  fontSize: 34, color: C.black, bold: true, fontFace: "Arial Black", valign: "top", margin: 0, lineSpacingMultiple: 1.1,
});

// Subhead — one crisp sentence
s1.addText("iShares has the scale, lineup, and brand to guide self-directed investors from product selection to personalized portfolios.", {
  x: 0.6, y: 2.0, w: 8.0, h: 0.6,
  fontSize: 14, color: C.medGray, fontFace: "Arial", valign: "top", margin: 0,
});

// Thin divider
s1.addShape(pres.shapes.LINE, {
  x: 0.6, y: 2.75, w: 3.0, h: 0,
  line: { color: C.yellow, width: 3 },
});

// Three clean thesis points — generous spacing, no bullet clutter
const points = [
  "75M+ self-directed investors want guidance but don't meet advisor minimums or need advisor-level services — they need a product-embedded solution.",
  "Schwab, Vanguard, and Wealthfront are racing to own the personalization layer. iShares isn't in the race yet.",
  "The path forward: start with simple allocation models, then layer in AI-driven personalization over time.",
];
points.forEach((item, i) => {
  s1.addText(item, {
    x: 0.6, y: 3.05 + i * 0.5, w: 8.5, h: 0.48,
    fontSize: 12, color: C.darkGray, fontFace: "Arial", valign: "top", margin: 0,
  });
});

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
    { text: item, options: { color: C.darkGray } },
  ], {
    x: 0.65, y: 3.20 + i * 0.35, w: 2.53, h: 0.32,
    fontSize: 9, fontFace: "Arial", valign: "top", margin: 0,
  });
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
  "12-step adaptive intake + 3 AI open-text insights",
  "8 risk-scored portfolios from 27 iShares ETFs",
  "Multi-factor scoring from 6+ behavioral signals",
  "Theme overlays: AI, Clean, Infra, Defense",
];
m2Items.forEach((item, i) => {
  s2.addText([
    { text: item, options: { color: C.darkGray } },
  ], {
    x: 3.73, y: 3.04 + i * 0.35, w: 2.53, h: 0.32,
    fontSize: 9, fontFace: "Arial", valign: "top", margin: 0,
  });
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
    { text: item, options: { color: C.darkGray } },
  ], {
    x: 6.82, y: 3.04 + i * 0.35, w: 2.53, h: 0.32,
    fontSize: 9, fontFace: "Arial", valign: "top", margin: 0,
  });
});

addFooter(s2, "2");

// ── Save ──
const outPath = "public/deck/iShares_Direct_Personalization_2_Slides.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("Saved:", outPath);
});
