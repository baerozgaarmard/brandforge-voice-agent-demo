// Business profiles for the BrandForge voice agent demo.
// Each profile: knowledge base (hours, location, FAQs, services with prices),
// sample customer prompts (chips), and a greeting key matching audio clips.
window.BUSINESSES = {
  dental: {
    id: "dental",
    label: "Dental Clinic",
    icon: "🦷",
    name: "BrightSmile Dental",
    city: "Austin, Texas",
    phoneDisplay: "(512) 555-0142",
    hours: "Monday to Friday, 8 AM to 6 PM, and Saturday 9 AM to 2 PM. We're closed on Sundays.",
    hoursShort: "Mon–Fri 8–6 · Sat 9–2",
    location: "We're at 4210 South Lamar Boulevard, Austin, Texas, with free parking right outside.",
    services: [
      { key: "cleaning", label: "Teeth Cleaning", price: "$99 for new patients", keywords: ["clean", "cleaning", "checkup", "check-up", "polish"] },
      { key: "exam", label: "Exam & X-Ray", price: "$79", keywords: ["exam", "x-ray", "xray", "check up"] },
      { key: "whitening", label: "Teeth Whitening", price: "$299", keywords: ["whiten", "white", "bright"] },
      { key: "implants", label: "Implant Consultation", price: "free", keywords: ["implant", "missing tooth"] },
      { key: "emergency", label: "Emergency / Tooth Pain Visit", price: "same-day, from $59 for the emergency exam", keywords: ["pain", "hurt", "emergency", "toothache", "broke", "chipped"] }
    ],
    greeting: "Thank you for calling BrightSmile Dental in Austin, Texas. This is Alex, how can I help you today?",
    confirm: "You're all set! Your appointment at BrightSmile Dental is confirmed. We'll send a text reminder to your phone before your visit.",
    chips: ["I'd like to book a cleaning", "What are your hours?", "How much is teeth whitening?", "Where are you located?", "I have a toothache, it's urgent"],
    clips: { greetingF: "audio/greeting-dental-f.mp3", greetingM: "audio/greeting-dental-m.mp3", confirmF: "audio/confirm-dental-f.mp3" }
  },
  hvac: {
    id: "hvac",
    label: "HVAC / Home Services",
    icon: "🛠️",
    name: "CoolAir Home Services",
    city: "Dallas, Texas",
    phoneDisplay: "(214) 555-0187",
    hours: "We're open Monday to Saturday, 7 AM to 8 PM, with 24/7 emergency call-out for heating and cooling.",
    hoursShort: "Mon–Sat 7–8 · 24/7 emergency",
    location: "We cover the greater Dallas area and our office is at 11880 Greenville Avenue, Dallas, Texas.",
    services: [
      { key: "acrepair", label: "AC Repair Visit", price: "$89 diagnostic, applied to the repair if you go ahead", keywords: ["ac", "air condition", "not cooling", "broken", "repair", "hot"] },
      { key: "tuneup", label: "AC / Heating Tune-Up", price: "$69", keywords: ["tune", "maintenance", "service plan", "check"] },
      { key: "install", label: "New System Installation Quote", price: "free in-home quote", keywords: ["install", "new system", "replace", "quote"] },
      { key: "plumbing", label: "Plumbing Call-Out", price: "$79 call-out", keywords: ["plumb", "leak", "pipe", "water heater", "drain"] },
      { key: "emergency", label: "Emergency Call-Out", price: "24/7, $129 emergency fee", keywords: ["emergency", "urgent", "no heat", "flooding"] }
    ],
    greeting: "Thank you for calling CoolAir Home Services in Dallas, Texas. This is Alex, how can I help you today?",
    confirm: "You're all set! Your service visit with CoolAir Home Services is confirmed. Our technician will call you thirty minutes before arrival.",
    chips: ["My AC stopped cooling", "What are your hours?", "How much is a tune-up?", "Do you cover my area?", "I need someone urgently"],
    clips: { greetingF: "audio/greeting-hvac-f.mp3", greetingM: "audio/greeting-hvac-m.mp3", confirmF: "audio/confirm-hvac-f.mp3" }
  },
  realestate: {
    id: "realestate",
    label: "Real Estate",
    icon: "🏡",
    name: "HarborView Realty",
    city: "Miami, Florida",
    phoneDisplay: "(305) 555-0119",
    hours: "Our office is open Monday to Friday, 9 AM to 7 PM, and Saturday 10 AM to 4 PM. Agents take viewing calls seven days a week.",
    hoursShort: "Mon–Fri 9–7 · Sat 10–4",
    location: "We're at 900 Biscayne Boulevard, Miami, Florida, and we cover Miami-Dade and Broward.",
    services: [
      { key: "viewing", label: "Book a Property Viewing", price: "free", keywords: ["viewing", "see a house", "tour", "visit", "showing"] },
      { key: "buying", label: "Buying a Home — Agent Callback", price: "free consultation", keywords: ["buy", "buying", "looking for a home", "purchase"] },
      { key: "selling", label: "Sell / Free Home Valuation", price: "free valuation", keywords: ["sell", "selling", "valuation", "worth", "list my"] },
      { key: "renting", label: "Rentals Enquiry", price: "free", keywords: ["rent", "rental", "lease", "apartment"] }
    ],
    greeting: "Thank you for calling HarborView Realty in Miami, Florida. This is Alex, how can I help you today?",
    confirm: "You're all set! Your request with HarborView Realty is confirmed. An agent will text you shortly to confirm the details.",
    chips: ["I'd like to book a viewing", "What are your hours?", "I want to sell my house", "Do you have rentals?", "Where are you based?"],
    clips: { greetingF: "audio/greeting-realestate-f.mp3", greetingM: "audio/greeting-realestate-m.mp3", confirmF: "audio/confirm-realestate-f.mp3" }
  },
  salon: {
    id: "salon",
    label: "Salon / Med Spa",
    icon: "💇",
    name: "Glow Studio Salon & Med Spa",
    city: "Los Angeles, California",
    phoneDisplay: "(310) 555-0163",
    hours: "We're open Tuesday to Saturday, 10 AM to 8 PM, and Sunday 11 AM to 5 PM. We're closed on Mondays.",
    hoursShort: "Tue–Sat 10–8 · Sun 11–5",
    location: "You'll find us at 736 Melrose Avenue, Los Angeles, California, near Fairfax.",
    services: [
      { key: "haircut", label: "Haircut & Style", price: "from $65", keywords: ["haircut", "cut", "hair"] },
      { key: "color", label: "Color / Balayage", price: "from $120", keywords: ["color", "colour", "balayage", "highlight", "dye"] },
      { key: "facial", label: "Signature Facial", price: "$110", keywords: ["facial", "skin", "glow"] },
      { key: "massage", label: "Massage (60 min)", price: "$95", keywords: ["massage", "spa", "relax"] },
      { key: "consult", label: "Med Spa Consultation", price: "free", keywords: ["botox", "med spa", "consult", "filler", "laser"] }
    ],
    greeting: "Thank you for calling Glow Studio Salon and Med Spa in Los Angeles. This is Alex, how can I help you today?",
    confirm: "You're all set! Your appointment at Glow Studio is confirmed. We'll send a text reminder before your visit.",
    chips: ["I'd like to book a haircut", "What are your hours?", "How much is a facial?", "Where are you located?", "Do you do balayage?"],
    clips: { greetingF: "audio/greeting-salon-f.mp3", greetingM: "audio/greeting-salon-m.mp3", confirmF: "audio/confirm-salon-f.mp3" }
  }
};
