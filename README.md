# brandforge-voice-agent-demo

**Headline USP:** “An AI receptionist that answers in YOUR voice.”

**Live demo:** https://brandforge-voice-agent-demo.vercel.app/

## Features
- 4 ready-to-test US business scenarios: dental clinic, HVAC/home services, real estate, salon/med spa — each with its own services, prices, hours and FAQs
- Simulated inbound call: type or speak, the agent answers, handles FAQs mid-flow, collects name + phone + preferred time, and confirms a booking
- Business Owner View: live lead summary (name, phone, service, time) + full call transcript — what the owner receives after every call
- Ready natural US voices to pick from, plus ⭐ **your own voice** — record a short sample and, in the full build, the agent answers in a clone of the owner's own voice so callers hear a familiar, trusted voice, not a generic robot
- Answers 24/7, books appointments, never misses a call — no API keys, no build step

A self-contained static web app (no build step, no API keys). A prospect picks a US business type, plays a customer on a simulated call (type or microphone), the agent answers FAQs, books an appointment, and the “Business Owner View” shows the captured lead + transcript — the selling moment.

## Run it
```bash
cd ~/workspace/brandforge-voice-agent-demo
python3 -m http.server 8931
# open http://localhost:8931/
```
(Opening `index.html` directly also works, except the microphone features need http/https + permission.)

## Files
- `index.html` — page structure (business picker, voice picker, own-voice card, call panel, owner view)
- `styles.css` — dark/professional BrandForge theme
- `businesses.js` — 4 business profiles: Dental Clinic (BrightSmile Dental, Austin), HVAC/Home Services (CoolAir, Dallas), Real Estate (HarborView Realty, Miami), Salon/Med Spa (Glow Studio, Los Angeles) — services, prices, hours, locations, FAQs, chips
- `app.js` — rule-based dialogue state machine: greet → reason/service → FAQ at any point (hours/price/location, then resumes) → name → phone → preferred time → confirmation; Web Speech recognition input, speechSynthesis voice output, MediaRecorder own-voice enrolment sample, live owner-view lead panel, copy lead summary
- `audio/` — 12 pre-generated studio clips (see Voices)
- `screenshot.png` — headless-Chromium screenshot of the loaded page

## Voices included
Ready voices in the UI (browser speechSynthesis, labelled): US Female — Warm, US Male — Professional, US Female — Bright, US Male — Casual, plus the ⭐ YOUR OWN VOICE option (full-build USP).

Pre-generated clips in `audio/` (generated with `/opt/hatch/bin/tts`, en):
- Greetings per business × 2 voices: US Female “Aria” (`avocado_v2:MAI_01`) and US Male “Helio” (`avocado_v2:MAI_03`) — `greeting-{dental,hvac,realestate,salon}-{f,m}.mp3`
- Booking confirmations per business in US Female — `confirm-{dental,hvac,realestate,salon}-f.mp3`

Own-voice card: the visitor reads a ~30-sec script, records via MediaRecorder, and plays it back. Honestly labelled: this demo is the enrolment step only — real cloning happens in the paid build.

## Tested
- `node --check` passes on both JS files.
- Automated DOM-stub test (`/tmp/test-demo.js`): full dental flow passes end-to-end, including a mid-flow hours FAQ — lead captured: Teeth Cleaning, Sarah Johnson, phone, “Tomorrow at 10 am”, stage = done, 13 transcript turns.
- Local `python3 -m http.server` + curl: index/CSS/JS/audio all HTTP 200.
- Headless Chromium screenshot verified visually.

## Honest limitations
- This is a **web simulation** of a phone agent: no real telephony (Twilio/Vapi), no calendar integration, no SMS — those are the paid build.
- Agent replies are rule/keyword-based for the 4 scripted businesses, not a live LLM.
- Mic input/output quality depends on the visitor's browser (Chrome best); typed input always works.
- Own-voice cloning does **not** happen in this demo — recording + playback only, labelled as such in the UI.
- Deployed live on Vercel (24 Oct 2026): https://brandforge-voice-agent-demo.vercel.app/ — GitHub repo: https://github.com/baerozgaarmard/brandforge-voice-agent-demo
