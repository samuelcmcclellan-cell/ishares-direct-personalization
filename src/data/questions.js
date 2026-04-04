export const STEPS = [
  {
    id: "goal",
    title: "What is your primary motivation for investing?",
    description: "Choose the single goal that matters most right now.",
    type: "single-select",
    options: [
      { id: "retirement",       label: "Retirement",        icon: "Sunset",       description: "Building long-term wealth for retirement" },
      { id: "education",        label: "Education",         icon: "GraduationCap", description: "Saving for college or advanced education" },
      { id: "home",             label: "Major Purchase",    icon: "Home",          description: "Saving for a home, car, wedding, or other large expense" },
      { id: "wealth-building",  label: "Wealth Building",   icon: "TrendingUp",    description: "General long-term growth" },
      { id: "income",           label: "Income Generation", icon: "DollarSign",    description: "Generating regular portfolio income" },
      { id: "emergency",        label: "Emergency Fund",    icon: "Shield",        description: "Building a financial safety net" },
    ],
  },
  // goal-followup injected dynamically after goal
  {
    id: "risk-preference",
    title: "Calibrate growth vs. stability",
    description: "Where do you fall on the spectrum?",
    type: "single-select",
    options: [
      { id: "1", label: "1 — Preserve",    riskNudge: -2, icon: "Shield",      description: "Protect what I have" },
      { id: "2", label: "2 — Conservative", riskNudge: -1, icon: "ShieldCheck", description: "Stability first" },
      { id: "3", label: "3 — Balanced",     riskNudge: 0,  icon: "Scale",       description: "Equal priority" },
      { id: "4", label: "4 — Growth",       riskNudge: 1,  icon: "TrendingUp",  description: "Lean into growth" },
      { id: "5", label: "5 — Max Growth",   riskNudge: 2,  icon: "Rocket",      description: "Maximize returns" },
    ],
  },
  {
    id: "ai-insight-early",
    title: "Before we dig into numbers\u2026",
    description: "We noticed something interesting about your choices so far.",
    type: "ai-insight",
    insightStep: "early",
  },
  {
    id: "financial-picture",
    title: "Your Financial Picture",
    description: "Tell us about your financial situation.",
    type: "financial-picture",
  },
  {
    id: "existing-holdings",
    title: "Do you currently have investments?",
    description: "Understanding your existing portfolio helps us complement rather than duplicate.",
    type: "single-select",
    options: [
      { id: "none",       label: "No investments yet",                 description: "This would be my first portfolio",         holdingsSignal: "none" },
      { id: "bond-heavy", label: "Yes — mostly bonds or cash savings", description: "CDs, savings bonds, money market, 401(k) in target-date", holdingsSignal: "bond-heavy" },
      { id: "balanced",   label: "Yes — a mix of stocks and bonds",    description: "Diversified across asset classes",          holdingsSignal: "balanced" },
      { id: "equity-heavy", label: "Yes — mostly stocks or equity funds", description: "Individual stocks, index funds, or equity ETFs", holdingsSignal: "equity-heavy" },
    ],
  },
  {
    id: "ai-insight-1",
    title: "Let\u2019s go a bit deeper",
    description: "Your numbers tell part of the story. Help us understand the person behind them.",
    type: "ai-insight",
    insightStep: "first",
  },
  {
    id: "account-type",
    title: "What type of account will you use?",
    description: "Account type affects tax treatment and investment options.",
    type: "single-select",
    options: [
      { id: "taxable",       label: "Taxable brokerage",     description: "Standard investment account" },
      { id: "traditional",   label: "Traditional IRA",       description: "Tax-deferred retirement account" },
      { id: "roth",          label: "Roth IRA",              description: "Tax-free growth, funded with after-tax dollars" },
      { id: "401k",          label: "401(k) / 403(b)",       description: "Employer-sponsored retirement plan" },
      { id: "unsure",        label: "I'm not sure yet",      description: "We'll still give you a great portfolio" },
    ],
  },
  // goal-conditional injected dynamically after account-type
  {
    id: "timeline",
    title: "When do you need this money?",
    description: "Your investment time horizon helps determine the right mix of growth and stability.",
    type: "single-select",
    options: [
      { id: "under-2", label: "Under 2 years",  description: "Short-term" },
      { id: "2-5",     label: "2–5 years",      description: "Near-term" },
      { id: "5-10",    label: "5–10 years",     description: "Medium-term" },
      { id: "10-20",   label: "10–20 years",    description: "Long-term" },
      { id: "20+",     label: "20+ years",      description: "Very long-term" },
    ],
  },
  {
    id: "risk",
    title: "If your portfolio dropped 20% in a month, what would you do?",
    description: "There are no wrong answers — this helps us understand your comfort with volatility.",
    type: "single-select",
    options: [
      { id: "sell-all",  label: "Sell everything",              riskScore: 2, description: "I can't afford to lose more" },
      { id: "sell-some", label: "Sell some to limit losses",    riskScore: 4, description: "I'd reduce my exposure" },
      { id: "hold",      label: "Hold steady and wait it out",  riskScore: 6, description: "Markets recover over time" },
      { id: "buy-more",  label: "Buy more at lower prices",     riskScore: 8, description: "Volatility is opportunity" },
      { id: "buy-aggressive", label: "Significantly increase my position", riskScore: 10, description: "I have a very long horizon" },
    ],
  },
  {
    id: "fomo-reaction",
    title: "Imagine your friend's portfolio gained 30% last year and yours gained 10%. How do you feel?",
    description: "This helps us understand how you react to relative performance.",
    type: "single-select",
    options: [
      { id: "switch",     label: "I'd want to switch to their strategy",  fomoScore: 3,  description: "I hate missing out on gains" },
      { id: "curious",    label: "I'd be curious but wouldn't change",    fomoScore: 1,  description: "Interesting, but I trust my plan" },
      { id: "indifferent", label: "Doesn't bother me at all",             fomoScore: 0,  description: "My plan is my plan" },
      { id: "cautious",   label: "I'd worry they're taking too much risk", fomoScore: -1, description: "Higher returns mean higher risk" },
    ],
  },
  {
    id: "ai-insight-3",
    title: "Let's make this real",
    description: "Numbers and choices only go so far. Let's see how you'd handle a scenario built from your actual situation.",
    type: "ai-insight",
    insightStep: "third",
  },
  {
    id: "income-draw",
    title: "Do you expect to withdraw from this portfolio in the next few years?",
    description: "Even if your goal isn't income, knowing if you'll need to draw matters.",
    type: "single-select",
    options: [
      { id: "no-draw",      label: "No — purely accumulation",           drawSignal: "none",    description: "Won't touch it for many years" },
      { id: "maybe-partial", label: "Maybe a partial withdrawal",         drawSignal: "partial", description: "Might need some within 3–5 years" },
      { id: "regular-draw",  label: "Yes — I'll draw periodically",       drawSignal: "regular", description: "Need periodic income or withdrawals" },
      { id: "lump-sum",      label: "Yes — one large withdrawal planned", drawSignal: "lump",    description: "Saving toward a specific payout" },
    ],
  },
  {
    id: "investment-style",
    title: "Which investing approach appeals to you?",
    description: "This helps us select the right mix of fund types.",
    type: "single-select",
    options: [
      { id: "index",  label: "Pure index investing",           description: "Low-cost, market-tracking ETFs" },
      { id: "blend",  label: "Mix of index + active",          description: "Core index with active satellite positions" },
      { id: "active", label: "Primarily active strategies",    description: "Actively managed for potential outperformance" },
    ],
  },
  {
    id: "themes",
    title: "Are you interested in any investment themes?",
    description: "Optional — select any themes you'd like reflected in your portfolio.",
    type: "multi-select",
    options: [
      { id: "ai",            label: "Artificial Intelligence",     icon: "Brain",       description: "Companies driving the AI revolution" },
      { id: "clean-energy",  label: "Clean Energy",                icon: "Zap",         description: "Solar, wind, and renewable energy companies" },
      { id: "power-infra",   label: "Power & Infrastructure",      icon: "Factory",     description: "Grid operators, utilities, electrical equipment" },
      { id: "defense",       label: "Defense & Aerospace",         icon: "Shield",      description: "Defense contractors and aerospace companies" },
      { id: "none",          label: "No thematic preference",      icon: "MinusCircle", description: "Stick with broad market exposure" },
    ],
  },
  {
    id: "ai-insight-2",
    title: "One last question",
    description: "Before we build your portfolio, we want to make sure we understand what matters most to you.",
    type: "ai-insight",
    insightStep: "second",
  },
  {
    id: "ai-portfolio-advisor",
    title: "Your AI Advisor",
    description: "We\u2019re analyzing everything you\u2019ve told us to find your ideal portfolio.",
    type: "ai-portfolio-advisor",
  },
  {
    id: "deep-dive-prompt",
    title: "Want more precise recommendations?",
    description: "A few quick follow-up questions can help us fine-tune your portfolio.",
    type: "deep-dive-gate",
  },
  {
    id: "deep-dive",
    title: "A bit more about your situation",
    description: "These details help us calibrate risk more precisely.",
    type: "multi-question",
    questions: [
      {
        id: "savings-pct",
        label: "What percentage of your total savings is this investment?",
        options: [
          { id: "under-10", label: "Under 10%",  modifier: 0 },
          { id: "10-25",    label: "10–25%",     modifier: 0 },
          { id: "25-50",    label: "25–50%",     modifier: -0.25 },
          { id: "over-50",  label: "Over 50%",   modifier: -0.5 },
        ],
      },
      {
        id: "experience",
        label: "How long have you been investing in stocks or ETFs?",
        options: [
          { id: "never",     label: "Never",           modifier: -0.5 },
          { id: "under-1",   label: "Less than 1 year", modifier: -0.25 },
          { id: "1-5",       label: "1–5 years",       modifier: 0 },
          { id: "5+",        label: "5+ years",        modifier: 0.5 },
        ],
      },
      {
        id: "emergency-fund",
        label: "Do you have 3-6 months of expenses saved outside this investment?",
        options: [
          { id: "yes-full",    label: "Yes, 6+ months",       modifier: 1 },
          { id: "yes-partial", label: "Yes, 3-6 months",      modifier: 0.5 },
          { id: "building",    label: "I'm still building it", modifier: 0 },
          { id: "no",          label: "No",                    modifier: -1 },
        ],
      },
      {
        id: "income-stability",
        label: "How would you describe your income?",
        options: [
          { id: "very-stable", label: "Very stable (salaried, tenured, etc.)",  modifier: 0.5 },
          { id: "stable",      label: "Stable with some variability",           modifier: 0 },
          { id: "variable",    label: "Variable (commission, freelance, gig)",  modifier: -0.5 },
          { id: "uncertain",   label: "Currently uncertain or between jobs",    modifier: -1 },
        ],
      },
      {
        id: "withdrawal-likelihood",
        label: "How likely are you to need some of this money unexpectedly in the next 2 years?",
        options: [
          { id: "very-unlikely", label: "Very unlikely", modifier: 0.5 },
          { id: "unlikely",      label: "Unlikely",      modifier: 0 },
          { id: "possible",      label: "Possible",      modifier: -0.5 },
          { id: "likely",        label: "Likely",         modifier: -1 },
        ],
      },
      {
        id: "checking-behavior",
        label: "If your portfolio dropped 15% this month, how soon would you look at it?",
        options: [
          { id: "quarterly",   label: "Whenever my next quarterly review is", modifier: 1 },
          { id: "monthly",     label: "End of the month",                     modifier: 0.5 },
          { id: "weekly",      label: "Within a week",                        modifier: 0 },
          { id: "daily",       label: "I'd check daily",                      modifier: -0.5 },
          { id: "immediately", label: "Immediately",                          modifier: -1 },
        ],
      },
    ],
  },
  {
    id: "preferences",
    title: "Any preferences?",
    description: "Optional — these adjust the portfolio style but aren't required.",
    type: "toggles",
    options: [
      { id: "income",   label: "Income-generating investments",     description: "Emphasize dividends and bond yields" },
      { id: "intl",     label: "Strong international exposure",     description: "Higher allocation to non-US markets" },
      { id: "taxAware", label: "Tax-aware positioning",             description: "Consider tax-loss harvesting and asset location" },
    ],
  },
  {
    id: "review",
    title: "Review your selections",
    description: "Confirm your choices or go back to adjust.",
    type: "review",
  },
]

export const GOAL_FOLLOWUPS = {
  retirement: {
    id: "goal-followup",
    title: "How old are you today?",
    description: "This helps us estimate your investment horizon to retirement.",
    type: "single-select",
    options: [
      { id: "under-30", label: "Under 30",  impliedTimeline: "20+",  description: "30+ years to grow" },
      { id: "30-39",    label: "30–39",      impliedTimeline: "20+",  description: "25-35 years to grow" },
      { id: "40-49",    label: "40–49",      impliedTimeline: "10-20", description: "15-25 years to grow" },
      { id: "50-59",    label: "50–59",      impliedTimeline: "5-10",  description: "5-15 years to grow" },
      { id: "60-plus",  label: "60+",        impliedTimeline: "2-5",   description: "Nearing or in retirement" },
    ],
  },
  education: {
    id: "goal-followup",
    title: "How many years until the funds are needed?",
    description: "We'll tailor the portfolio to your education savings timeline.",
    type: "single-select",
    options: [
      { id: "1-3",   label: "1–3 years",   impliedTimeline: "under-2", description: "Starting soon" },
      { id: "4-6",   label: "4–6 years",   impliedTimeline: "5-10",    description: "Elementary school age" },
      { id: "7-10",  label: "7–10 years",  impliedTimeline: "5-10",    description: "Time to grow" },
      { id: "10-plus", label: "10+ years",  impliedTimeline: "10-20",   description: "Long runway" },
    ],
  },
  home: {
    id: "goal-followup",
    title: "Roughly how much do you need to save?",
    description: "Target amount affects how we balance growth vs. stability.",
    type: "single-select",
    options: [
      { id: "under-50k",   label: "Under $50K",     description: "Smaller target" },
      { id: "50k-100k",    label: "$50K – $100K",    description: "Mid-range target" },
      { id: "100k-200k",   label: "$100K – $200K",   description: "Significant goal" },
      { id: "over-200k",   label: "$200K+",          description: "Large purchase" },
    ],
  },
  income: {
    id: "goal-followup",
    title: "When do you need income to begin?",
    description: "This helps us choose the right income-generating mix.",
    type: "single-select",
    options: [
      { id: "immediately",   label: "Immediately",       impliedTimeline: "under-2", description: "I need income now" },
      { id: "1-2-years",     label: "Within 1–2 years",  impliedTimeline: "under-2", description: "Starting soon" },
      { id: "3-5-years",     label: "3–5 years",         impliedTimeline: "2-5",     description: "Some time to build" },
      { id: "5-plus-years",  label: "5+ years out",      impliedTimeline: "5-10",    description: "Growing toward income" },
    ],
  },
  emergency: {
    id: "goal-followup",
    title: "How many months of expenses are you targeting?",
    description: "A larger emergency fund allows for a slightly longer time horizon.",
    type: "single-select",
    options: [
      { id: "3-months",  label: "3 months",  impliedTimeline: "under-2", description: "Basic safety net" },
      { id: "6-months",  label: "6 months",  impliedTimeline: "2-5",     description: "Recommended baseline" },
      { id: "12-months", label: "12 months", impliedTimeline: "2-5",     description: "Extended cushion" },
    ],
  },
}

export const GOAL_CONDITIONALS = {
  "retirement-older": {
    id: "goal-conditional",
    title: "Do you have other retirement savings?",
    description: "This helps us understand how this portfolio fits into your overall plan.",
    type: "single-select",
    options: [
      { id: "significant", label: "Yes, significant savings",  description: "IRA, 401(k), pension, etc.", riskNudge: 1 },
      { id: "some",        label: "Yes, some savings",         description: "Some but not substantial" },
      { id: "none",        label: "No, this is my primary",    description: "This will be my main retirement fund", riskNudge: -1 },
    ],
  },
  home: {
    id: "goal-conditional",
    title: "Is this your first time saving for a major financial goal?",
    description: "This helps us understand your experience level.",
    type: "single-select",
    options: [
      { id: "yes", label: "Yes",  description: "First time setting a major savings target" },
      { id: "no",  label: "No",   description: "I've saved for large goals before" },
    ],
  },
  education: {
    id: "goal-conditional",
    title: "Are you considering a 529 plan?",
    description: "529 plans offer tax advantages for education savings.",
    type: "single-select",
    options: [
      { id: "yes",        label: "Yes",             description: "Already have or plan to open one" },
      { id: "no",         label: "No",              description: "Not interested in a 529" },
      { id: "whats-that", label: "What's that?",    description: "I'd like to learn more" },
    ],
  },
}

export const TIMELINE_ORDER = ["under-2", "2-5", "5-10", "10-20", "20+"]
