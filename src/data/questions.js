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

export const TIMELINE_ORDER = ["under-2", "2-5", "5-10", "10-20", "20+"]
