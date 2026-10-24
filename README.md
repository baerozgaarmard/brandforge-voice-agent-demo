# BrandForge — Voice Agent Demo (v2)

A plain, single-screen demo of an AI phone receptionist for local businesses. Pick a business, press **Start call**, and hold a simulated call — type or use the mic — and watch the appointment fill in live. Built for **BrandForge Media** outreach to US clients.

**Target demo URL:** https://brandforge-voice-agent-demo.vercel.app/
**GitHub:** https://github.com/baerozgaarmard/brandforge-voice-agent-demo

## Design (v2)

Rebuilt after feedback that v1 looked like an AI template and the voices sounded robotic.

- One screen, nothing else: slim header, one plain line ("An AI receptionist that answers in your voice."), business tabs, the call panel, a voice selector, and the live appointment panel.
- Solid off-white background, white panels, thin borders, small radius, system sans font, one muted green accent. No gradients, no glow, no shadows, no stock or AI imagery, no hype copy.
- Removed from v1: the gradient hero, the gold "MAIN USP" card, the how-it-works strip, quick-chips, the "what a real build adds" section, business cards with icons, emojis.

## Voice engine note — VoiceStudio was tried first (24 Oct 2026)

At Ayush's direction, the clips were first attempted with **VoiceStudio** (https://github.com/debpalash/VoiceStudio, AGPL-3.0 app; default engine `k2-fsa/OmniVoice`), running fully locally and headless on this machine via its Python CLI (`omnivoice.cli.infer`, voice-design mode — no Electron app needed).

What actually happened, honestly:

- ✅ Repo obtained, backend/engine installed in a venv (torch 2.14 CPU, transformers 5.20), package imports fine.
- ✅ Model `k2-fsa/OmniVoice` downloaded from Hugging Face (~3.3 GB total; the download stalled twice and needed a resume with Xet disabled).
- ✅ Generation **works** on this CPU-only VM (2 vCPU, ~8 GB RAM, no GPU): model loads in ~25 s, and one test greeting was produced — kept at `audio/auditions/voicestudio-test-female-greeting.wav` (voice design: "female, young adult, american accent").
- ❌ **Too slow for a 38-clip set:** that single ~5-second greeting took **212 seconds** of generation (32 diffusion steps). The FAQ clips are 30–43 s of audio each and scale worse — the full set was estimated at roughly **4–5 hours** of continuous CPU generation.

**Decision: fallback.** The demo's clips were therefore generated with the Hatch TTS catalog voices below (the original audition plan). If this demo is ever run on a GPU machine, VoiceStudio/OmniVoice is installed and proven at `~/vs-work/` (venv + model cache) and the whole clip set can be re-rendered with it at ~seconds per line.

## Voices (v2) — all agent speech is pre-generated clips

No browser `speechSynthesis` is used anywhere for the agent's voice (that robotic sound is gone). **Every agent line is a pre-rendered MP3 clip** in one of two auditioned voices:

| Slot | Voice ID | Name | Why it was picked |
|---|---|---|---|
| Female | `avocado_v2:vdc_NOID87` | Composed Pendulum | Catalog traits: low-pitched, reassuring, calm, helpful, candid. Top quality rating (aesthetics 3.0). Chosen over brighter/theatrical options that read as "performed" rather than like a real receptionist. |
| Male | `avocado_v2:vdc_12430` | Neighborly Gate | Catalog traits: friendly, chatty, caring, helpful, warm, medium-pitched. Top quality rating (aesthetics 3.0). The most everyday, conversational male profile in the shortlist. |

Replaced and deleted: Aria (`avocado_v2:MAI_01`) and Helio (`avocado_v2:MAI_03`) clips from v1.

**Honest note for Ayush:** these two were picked from catalog descriptions + successful renders — an agent cannot literally listen. Please listen to the two chosen sample greetings first — `audio/greeting-dental-f.mp3` (female) and `audio/greeting-dental-m.mp3` (male). If either still doesn't sound natural to your ear, say the word and it can be swapped to another auditioned voice (see below) and all clips re-rendered.

### Auditions

8 candidates were rendered with the same receptionist test line and kept in `audio/auditions/` (working files — safe to exclude from deploy):

Female: `f1-composed-pendulum.mp3` (chosen), `f2-curious-ladder.mp3` (`avocado_v2:vdc_NOID39`), `f3-questioning-candle.mp3` (`avocado_v2:vdc_NOID59`), `f4-cheerful-sunflower.mp3` (`avocado_v2:Vanessa`)
Male: `m1-neighborly-gate.mp3` (chosen), `m2-affirming-hearth.mp3` (`avocado_v2:vdc_29090`), `m3-loyal-backpack.mp3` (`avocado_v2:vdc_NOID46`), `m4-warm-pebble.mp3` (`avocado_v2:chip`)

Voices with theatrical traits (raspy, nasal, breathy, husky, gravelly, smoky) were screened out before auditioning.

## Clip map (38 clips, all in both voices)

Per business (`audio/<kind>-<business>-<f|m>.mp3`, business = dental / hvac / realestate / salon):

| Clip kind | Content |
|---|---|
| `greeting` | "Thank you for calling [business] in [city]. This is Alex, how can I help you today?" |
| `menu` | Lists that business's services |
| `faq` | One combined key-info clip: hours + location + all prices. The exact answer to the question asked (hours / location / price) is shown as text in the transcript. |

Shared flow clips (`audio/flow-<key>-<f|m>.mp3`):

| Key | Content |
|---|---|
| `ask-name` | "Great, I can book that for you. May I have your full name, please?" |
| `ask-phone` | "Thanks. What is the best phone number for your confirmation text?" |
| `ask-time` | "And what day and time works best for you? For example, tomorrow at ten A.M." |
| `lets-book` | "Perfect. Let me get you booked in." |
| `fallback` | "Sorry, I didn't catch that. Could you say that once more?" |
| `confirm` | Generic confirmation — "Your appointment is confirmed. The details are on your screen, and a confirmation will be texted to you." The caller's name/time are **not** spoken (TTS can't say them dynamically); they appear in the transcript summary and appointment panel. |
| `goodbye` | "You're welcome. Thanks for calling. Goodbye, and we will see you soon." |

Total: 4 businesses × 3 kinds × 2 voices (24) + 7 shared × 2 voices (14) = **38 clips**.

Known trade-off of the all-clips architecture: a few on-screen sentences are dynamic (e.g. "Thanks, Sarah", the price of the chosen service, the booking summary). Those details are on screen; the spoken clips stay generic so the voice never turns robotic.

## "Your own voice" option

The voice selector has three plain options: **Female / Male / Your own voice**. Choosing "Your own voice" expands a simple recorder: "Record 30 seconds. In the full build, this becomes your agent's voice." — record, stop, play back. Honest labelling is kept: in this demo the agent keeps using the female voice; the recording is the enrolment sample only. In a paid build, that sample is used to clone the owner's voice and the agent answers in it.

## The 4 businesses

| Business | Type | City | Highlights |
|---|---|---|---|
| BrightSmile Dental | Dental clinic | Austin, TX | Cleaning $99 new patients, free implant consults |
| CoolAir Home Services | HVAC + plumbing | Dallas, TX | $89 AC diagnostic, 24/7 emergency |
| HarborView Realty | Real estate agency | Miami, FL | Free viewings & valuations |
| Glow Studio | Salon / med spa | Los Angeles, CA | Haircut from $65, free med-spa consults |

## Flow

Greet (clip) → understand request → answer FAQs (hours / location / price, any time, then resume) → collect service → name → phone → time → confirmed appointment in the panel. Mic input uses the browser's speech **recognition** (the caller's voice only — Chrome recommended); the agent never speaks through the browser.

## Run locally

```bash
cd ~/workspace/brandforge-voice-agent-demo
python3 -m http.server 8932
# open http://localhost:8932
```

No build step, no API keys, no backend.

## Testing (v2, 24 Oct 2026)

- `node --check` passes on `app.js` and `businesses.js`.
- Local serve: page, CSS, JS and **all 38 clips return HTTP 200**.
- Automated dental flow test (DOM stub, clip playback stubbed): start call → book a cleaning → mid-flow hours FAQ (FAQ clip played, flow resumed at name step) → name/phone/time → stage `done`, lead captured correctly, 8 clips queued/played in order. **PASS.**
- One bad render caught and fixed: `faq-salon-m.mp3` initially rendered at 179 s (faulty generation); re-rendered to ~32 s.

## Honest limits / what the real build adds

- This demo is a scripted simulation (rule-based dialogue), not a live AI phone call. No real phone number is dialled.
- Voice output is pre-generated clips, so free-form sentences can't be spoken — a production build uses streaming TTS in the same (or the owner's cloned) voice.
- A production build (Vapi/Retell + telephony) adds a real inbound number, live conversation, calendar booking, SMS confirmations, and call recording/transfer.
