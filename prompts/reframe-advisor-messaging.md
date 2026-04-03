# Reframe advisor messaging — remove disintermediation language

## Context
The current messaging implies we're trying to replace or disintermediate financial advisors. We need to soften this. The framing should be: self-directed investors who **don't meet minimum asset requirements** or **don't require the additional services** offered by a financial advisor — not that they "don't want to pay for one."

## Edits (2 files, 2 changes)

### 1. `src/data/content.js` — line 16
**Current:**
```
"Self-directed investors want personalized guidance but don't want to pay for an advisor"
```
**Replace with:**
```
"Self-directed investors want personalized guidance but don't meet minimum asset requirements or don't require the additional services offered by a financial advisor"
```

### 2. `build-deck.cjs` — line 106
**Current:**
```
"75M+ self-directed investors want guidance but won't pay for an advisor — they need a product-embedded solution."
```
**Replace with:**
```
"75M+ self-directed investors want guidance but don't meet advisor minimums or need advisor-level services — they need a product-embedded solution."
```
(The deck version is shorter to fit the slide. It conveys the same reframe in fewer words.)

## After editing
1. Run `node build-deck.cjs` to regenerate the PowerPoint deck and confirm it exits without errors.
2. Run `npm run build` to confirm the React app builds cleanly.
3. Commit with message: `refine advisor messaging — reframe from cost objection to fit/need gap`
4. Push to remote.
