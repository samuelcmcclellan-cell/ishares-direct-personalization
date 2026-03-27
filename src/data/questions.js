export const STEPS = [
  {
    id: "goal",
    title: "What are you investing for?",
    description: "Select the primary goal for this investment.",
    type: "single-select",
    options: [
      { id: "retirement",       label: "Retirement",       icon: "Sunset",    description: "Building long-term wealth for retirement" },
      { id: "education",        label: "Education",        icon: "GraduationCap", description: "Saving for college or advanced education" },
      { id: "home",             label: "Home Purchase",    icon: "Home",      description: "Saving for a down payment or property" },
      { id: "wealth-building",  label: "Wealth Building",  icon: "TrendingUp", description: "General long-term growth" },
      { id: "income",           label: "Income Generation",icon: "DollarSign", description: "Generating regular portfolio income" },
    ],
  },
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
      { id: "sell-all",  label: "Sell everything",              riskScore: 1, description: "I can't afford to lose more" },
      { id: "sell-some", label: "Sell some to limit losses",    riskScore: 2, description: "I'd reduce my exposure" },
      { id: "hold",      label: "Hold steady and wait it out",  riskScore: 3, description: "Markets recover over time" },
      { id: "buy-more",  label: "Buy more at lower prices",     riskScore: 4, description: "Volatility is opportunity" },
      { id: "buy-aggressive", label: "Significantly increase my position", riskScore: 5, description: "I have a very long horizon" },
    ],
  },
  {
    id: "deep-dive-prompt",
    title: "Want more precise recommendations?",
    description: "Two quick follow-up questions can help us fine-tune your portfolio.",
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
          { id: "25-50",    label: "25–50%",     modifier: -0.5 },
          { id: "over-50",  label: "Over 50%",   modifier: -1 },
        ],
      },
      {
        id: "experience",
        label: "How long have you been investing in stocks or ETFs?",
        options: [
          { id: "never",     label: "Never",           modifier: -1 },
          { id: "under-1",   label: "Less than 1 year", modifier: -0.5 },
          { id: "1-5",       label: "1–5 years",       modifier: 0 },
          { id: "5+",        label: "5+ years",        modifier: 0.5 },
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
    description: "Down payment size affects how we balance growth vs. stability.",
    type: "single-select",
    options: [
      { id: "under-50k",   label: "Under $50K",     description: "Starter home or partial down payment" },
      { id: "50k-100k",    label: "$50K – $100K",    description: "Mid-range target" },
      { id: "100k-200k",   label: "$100K – $200K",   description: "Significant down payment" },
      { id: "over-200k",   label: "$200K+",          description: "High-value property" },
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
  "wealth-building": {
    id: "goal-followup",
    title: "What's most important to you?",
    description: "This helps us calibrate growth vs. stability in your portfolio.",
    type: "single-select",
    options: [
      { id: "max-growth",     label: "Maximum growth — I can handle the ups and downs", riskNudge: 0.5,  description: "Higher risk, higher potential" },
      { id: "steady-growth",  label: "Steady growth with less volatility",              riskNudge: -0.5, description: "Balanced approach" },
      { id: "preserve-grow",  label: "Preserve what I have and grow slowly",            riskNudge: -1,   description: "Capital preservation first" },
    ],
  },
}

export const TIMELINE_ORDER = ["under-2", "2-5", "5-10", "10-20", "20+"]
