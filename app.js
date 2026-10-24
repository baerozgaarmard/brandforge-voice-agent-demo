// BrandForge Voice Agent Demo — rule-based dialogue engine + browser voice.
(function () {
  "use strict";
  var BIZ = window.BUSINESSES;
  var state = {
    bizId: "dental",
    stage: "idle", // idle | reason | name | phone | time | done
    lead: { name: "", phone: "", service: "", time: "" },
    transcript: [],
    voiceChoice: "female-warm"
  };

  var $ = function (id) { return document.getElementById(id); };
  var transcriptEl = $("transcript"), chipsEl = $("chips"), inputEl = $("userInput");

  /* ---------- Voice handling (browser speechSynthesis) ---------- */
  var synth = window.speechSynthesis || null;
  var allVoices = [];
  function loadVoices() {
    if (!synth) return;
    allVoices = synth.getVoices() || [];
    renderVoicePicker();
  }
  function pickBrowserVoice(choice) {
    if (!allVoices.length) return null;
    var en = allVoices.filter(function (v) { return /^en[-_]US/i.test(v.lang) || /^en/i.test(v.lang); });
    var pool = en.length ? en : allVoices;
    function find(re) { for (var i = 0; i < pool.length; i++) { if (re.test(pool[i].name)) return pool[i]; } return null; }
    var femaleWarm = find(/samantha|zira|aria|jenny|female|google us english/i) || pool[0];
    var malePro = find(/david|guy|christopher|alex|daniel|male/i) || pool[1] || pool[0];
    var femaleBright = find(/amber|samantha|zira/i) || femaleWarm;
    var maleCasual = find(/ryan|eric|alex|david/i) || malePro;
    var map = { "female-warm": femaleWarm, "male-pro": malePro, "female-bright": femaleBright, "male-casual": maleCasual };
    return map[choice] || pool[0];
  }
  var VOICE_OPTIONS = [
    { id: "female-warm", label: "US Female — Warm", note: "Friendly receptionist tone" },
    { id: "male-pro", label: "US Male — Professional", note: "Calm, confident front-desk tone" },
    { id: "female-bright", label: "US Female — Bright", note: "Upbeat, great for salons & retail" },
    { id: "male-casual", label: "US Male — Casual", note: "Relaxed, great for home services" },
    { id: "own", label: "⭐ YOUR OWN VOICE", note: "Full build only — cloned from your 30-sec sample (see card at left)" }
  ];
  function renderVoicePicker() {
    var html = "";
    VOICE_OPTIONS.forEach(function (v) {
      var actual = "";
      if (v.id !== "own" && synth) {
        var bv = pickBrowserVoice(v.id);
        if (bv) actual = ' · <span class="dim">plays as: ' + bv.name + "</span>";
      }
      html += '<label class="voice-opt"><input type="radio" name="voice" value="' + v.id + '"' +
        (state.voiceChoice === v.id ? " checked" : "") + "> <span><strong>" + v.label + "</strong>" +
        '<span class="dim small-text"> — ' + v.note + actual + "</span></span></label>";
    });
    $("voicePicker").innerHTML = html;
    Array.prototype.forEach.call(document.querySelectorAll('input[name="voice"]'), function (r) {
      r.addEventListener("change", function () { state.voiceChoice = r.value; renderClips(); });
    });
  }
  function speak(text) {
    if (state.voiceChoice === "own") return; // honest: cloning is full-build only
    if (!synth) return;
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(text);
      var v = pickBrowserVoice(state.voiceChoice);
      if (v) { u.voice = v; u.lang = v.lang; }
      u.rate = 1.0;
      synth.speak(u);
    } catch (e) { /* voice is best-effort; text always shows */ }
  }

  /* ---------- Sample clips ---------- */
  function renderClips() {
    var b = BIZ[state.bizId];
    var items = [
      { src: b.clips.greetingF, label: "Greeting — US Female (Warm)" },
      { src: b.clips.greetingM, label: "Greeting — US Male (Professional)" },
      { src: b.clips.confirmF, label: "Booking confirmation — US Female (Warm)" }
    ];
    $("clipList").innerHTML = items.map(function (c) {
      return '<div class="clip"><span>' + c.label + ' · ' + b.name + '</span><audio controls preload="none" src="' + c.src + '"></audio></div>';
    }).join("");
  }

  /* ---------- Business picker ---------- */
  function renderBiz() {
    $("bizPicker").innerHTML = Object.keys(BIZ).map(function (id) {
      var b = BIZ[id];
      return '<button class="biz-card' + (id === state.bizId ? " active" : "") + '" data-biz="' + id + '">' +
        '<span class="biz-icon">' + b.icon + '</span><strong>' + b.label + '</strong><span class="dim small-text">' + b.name + "</span></button>";
    }).join("");
    Array.prototype.forEach.call(document.querySelectorAll(".biz-card"), function (c) {
      c.addEventListener("click", function () { selectBiz(c.getAttribute("data-biz")); });
    });
    var b = BIZ[state.bizId];
    $("bizProfile").innerHTML = "<strong>" + b.name + "</strong> · " + b.city + "<br><span class='dim'>🕐 " +
      b.hoursShort + " · 📞 " + b.phoneDisplay + "</span><br>Services: " +
      b.services.map(function (s) { return s.label + " (" + s.price + ")"; }).join(" · ");
    $("callBizName").textContent = b.name + " — " + b.city;
  }
  function selectBiz(id) {
    if (state.stage !== "idle" && state.stage !== "done") return; // don't switch mid-call
    state.bizId = id;
    renderBiz(); renderClips();
  }

  /* ---------- Transcript / owner view ---------- */
  function addMsg(who, text) {
    state.transcript.push({ who: who, text: text });
    var row = document.createElement("div");
    row.className = "msg " + (who === "Agent" ? "agent" : "caller");
    row.innerHTML = "<strong>" + (who === "Agent" ? "🤖 Agent" : "📞 Caller") + ":</strong> " + text.replace(/</g, "&lt;");
    transcriptEl.appendChild(row);
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
    $("ownerTranscript").textContent = state.transcript.map(function (m) { return m.who + ": " + m.text; }).join("\n");
  }
  function agentSay(text) {
    addMsg("Agent", text);
    speak(text);
    updateOwner();
  }
  function updateOwner() {
    $("leadName").textContent = state.lead.name || "—";
    $("leadPhone").textContent = state.lead.phone || "—";
    $("leadService").textContent = state.lead.service || "—";
    $("leadTime").textContent = state.lead.time || "—";
    $("leadBooking").textContent = state.stage === "done" ? "✅ Confirmed (demo)" : "Not booked yet";
    $("ownerStatus").textContent =
      state.stage === "idle" ? "Waiting for a call…" :
      state.stage === "done" ? "✅ New lead captured — booking confirmed. The owner sees this instantly." :
      "📞 Call in progress — capturing lead details live…";
    $("copyBtn").disabled = state.stage !== "done";
  }

  /* ---------- Intent parsing ---------- */
  function lower(s) { return (s || "").toLowerCase(); }
  function detectService(b, text) {
    var t = lower(text);
    for (var i = 0; i < b.services.length; i++) {
      var kws = b.services[i].keywords;
      for (var j = 0; j < kws.length; j++) { if (t.indexOf(kws[j]) !== -1) return b.services[i]; }
    }
    return null;
  }
  function isFAQ(text) {
    var t = lower(text);
    if (/hour|open|close|when.*(open|close)/.test(t)) return "hours";
    if (/where|located|address|direction|area|cover/.test(t)) return "location";
    if (/how much|price|cost|charge|fee/.test(t)) return "price";
    return null;
  }
  function faqAnswer(b, kind, svc) {
    if (kind === "hours") return "Our hours: " + b.hours;
    if (kind === "location") return b.location;
    if (kind === "price") {
      if (svc) return svc.label + " is " + svc.price + ".";
      return "Here's our pricing: " + b.services.map(function (s) { return s.label + " — " + s.price; }).join("; ") + ".";
    }
    return "";
  }
  function extractName(text) {
    var m = text.match(/(?:my name is|i am|i'm|this is)\s+([A-Za-z][A-Za-z'-]+(?:\s+[A-Za-z][A-Za-z'-]+)?)/i);
    if (m) return m[1].replace(/\b(and|my|phone|number)\b.*$/i, "").trim();
    // bare stage answer: "Sarah Johnson"
    if (/^[A-Za-z][A-Za-z' -]{1,40}$/.test(text.trim()) && state.stage === "name") return text.trim();
    return null;
  }
  function extractPhone(text) {
    var digits = text.replace(/[^\d]/g, "");
    var m = text.match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    if (m) return m[0];
    if (digits.length >= 10) return digits.slice(-10).replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    return null;
  }
  function extractTime(text) {
    var t = lower(text);
    var m = text.match(/(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week)[^,.]*/i);
    var timeM = text.match(/\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i);
    if (m && timeM && !/(am|pm)/i.test(m[0])) return (m[0] + " " + timeM[0]).trim();
    if (m) return m[0].trim();
    if (timeM) return timeM[0].trim();
    if (state.stage === "time" && text.trim().length > 1) return text.trim();
    return null;
  }

  /* ---------- Dialogue state machine ---------- */
  function askFor(stage) {
    state.stage = stage;
    if (stage === "name") agentSay("Great, I can book that for you. May I have your full name, please?");
    if (stage === "phone") agentSay("Thanks, " + (state.lead.name.split(" ")[0] || "there") + ". What's the best phone number for your confirmation text?");
    if (stage === "time") agentSay("And what day and time works best for you? For example, tomorrow at 10 AM.");
  }
  function finish() {
    var b = BIZ[state.bizId];
    state.stage = "done";
    agentSay(b.confirm + " Summary: " + state.lead.service + " for " + state.lead.name + ", " + state.lead.time + ". A confirmation will be texted to " + state.lead.phone + ". Is there anything else I can help with?");
    $("callStatus").textContent = "Call complete — lead captured in the Owner View →";
    setChips(["Start a new call"]);
    updateOwner();
  }
  function handleUser(text) {
    if (!text.trim()) return;
    addMsg("Caller", text);
    var b = BIZ[state.bizId];
    var faq = isFAQ(text);
    var svc = detectService(b, text);

    // FAQ can be answered at any point, then resume the flow.
    if (faq) {
      agentSay(faqAnswer(b, faq, svc));
      if (state.stage === "reason") { if (state.lead.service) askFor("name"); else agentSay("Would you like to book an appointment? Just tell me what you need."); }
      else if (state.stage === "name") askFor("name");
      else if (state.stage === "phone") askFor("phone");
      else if (state.stage === "time") askFor("time");
      return;
    }

    if (state.stage === "reason") {
      if (svc) state.lead.service = svc.label;
      if (!state.lead.service) {
        if (/book|appointment|schedule|visit/.test(lower(text))) {
          agentSay("Of course. Which service would you like? We offer: " + b.services.map(function (s) { return s.label; }).join(", ") + ".");
          return;
        }
        agentSay("I can help with that. Could you tell me a little more — are you looking to book one of these: " + b.services.map(function (s) { return s.label; }).join(", ") + "?");
        return;
      }
      var p = svc ? " " + svc.label + " is " + svc.price + "." : "";
      agentSay("Perfect —" + p + " Let me get you booked in.");
      askFor("name");
      return;
    }
    if (state.stage === "name") {
      var n = extractName(text);
      var ph = extractPhone(text);
      if (ph && !n) { agentSay("Thanks for the number — I'll add it in a moment. First, may I have your name?"); state.lead.phone = ph; return; }
      if (!n) { agentSay("Sorry, I didn't catch your name. Could you say it once more, like: my name is Sarah Johnson?"); return; }
      state.lead.name = n;
      if (state.lead.phone) { askFor("time"); } else { askFor("phone"); }
      return;
    }
    if (state.stage === "phone") {
      var ph2 = extractPhone(text);
      var tm = extractTime(text);
      if (!ph2) {
        if (tm) { agentSay("Got the time — I still need a phone number for the confirmation text. What's the best number?"); state.lead.time = tm; return; }
        agentSay("I need a 10-digit US phone number for the confirmation text — could you share it, digits are fine?");
        return;
      }
      state.lead.phone = ph2;
      if (state.lead.time) finish_ready(); else askFor("time");
      return;
    }
    if (state.stage === "time") {
      var tm2 = extractTime(text);
      if (!tm2) { agentSay("What day and time suits you? For example, Friday at 2 PM."); return; }
      state.lead.time = tm2;
      finish();
      return;
    }
    if (state.stage === "done") {
      if (/new call|restart|again/.test(lower(text))) { startCall(); return; }
      agentSay("You're welcome! Thanks for calling " + b.name + ". Goodbye, and we'll see you soon.");
      return;
    }
  }
  function finish_ready() { finish(); }

  /* ---------- Chips ---------- */
  function setChips(list) {
    chipsEl.innerHTML = list.map(function (c) { return '<button class="chip">' + c + "</button>"; }).join("");
    Array.prototype.forEach.call(chipsEl.querySelectorAll(".chip"), function (ch) {
      ch.addEventListener("click", function () {
        if (ch.textContent === "Start a new call") { startCall(); return; }
        handleUser(ch.textContent);
      });
    });
  }

  /* ---------- Call lifecycle ---------- */
  function startCall() {
    state.lead = { name: "", phone: "", service: "", time: "" };
    state.transcript = [];
    transcriptEl.innerHTML = "";
    $("ownerTranscript").textContent = "";
    var b = BIZ[state.bizId];
    state.stage = "reason";
    inputEl.disabled = false; $("sendBtn").disabled = false;
    $("startBtn").classList.add("hidden"); $("resetBtn").classList.remove("hidden");
    $("callStatus").textContent = "📞 Live call (simulated) — you're the customer";
    agentSay(b.greeting);
    setChips(b.chips);
    updateOwner();
  }
  $("startBtn").addEventListener("click", startCall);
  $("resetBtn").addEventListener("click", startCall);
  $("sendBtn").addEventListener("click", function () { var v = inputEl.value; inputEl.value = ""; handleUser(v); });
  inputEl.addEventListener("keydown", function (e) { if (e.key === "Enter") $("sendBtn").click(); });
  $("copyBtn").addEventListener("click", function () {
    var txt = "NEW LEAD — " + BIZ[state.bizId].name + "\nName: " + state.lead.name + "\nPhone: " + state.lead.phone +
      "\nService: " + state.lead.service + "\nPreferred time: " + state.lead.time + "\nBooking: Confirmed (demo)\n\nTranscript:\n" + $("ownerTranscript").textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(txt);
    $("copyBtn").textContent = "Copied ✓";
    setTimeout(function () { $("copyBtn").textContent = "Copy lead summary"; }, 2000);
  });

  /* ---------- Mic (Web Speech API) ---------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var rec = null;
  $("micBtn").addEventListener("click", function () {
    if (!SR) { alert("Speech recognition isn't available in this browser — please type instead. Chrome works best for the mic."); return; }
    try {
      rec = new SR(); rec.lang = "en-US"; rec.interimResults = false;
      $("micBtn").textContent = "🔴";
      rec.onresult = function (ev) { var t = ev.results[0][0].transcript; inputEl.value = ""; handleUser(t); };
      rec.onend = function () { $("micBtn").textContent = "🎤"; };
      rec.onerror = function () { $("micBtn").textContent = "🎤"; };
      rec.start();
    } catch (e) { $("micBtn").textContent = "🎤"; }
  });

  /* ---------- Own-voice recorder (MediaRecorder) ---------- */
  var mediaRec = null, chunks = [];
  $("recBtn").addEventListener("click", function () {
    if (!navigator.mediaDevices || !window.MediaRecorder) { $("recStatus").textContent = "Recording isn't supported in this browser."; return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      chunks = []; mediaRec = new MediaRecorder(stream);
      mediaRec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      mediaRec.onstop = function () {
        var blob = new Blob(chunks, { type: "audio/webm" });
        var url = URL.createObjectURL(blob);
        var pb = $("recPlayback"); pb.src = url; pb.classList.remove("hidden");
        $("recStatus").textContent = "✅ Sample recorded — play it back above. In the full build, this becomes your agent's voice.";
        stream.getTracks().forEach(function (t) { t.stop(); });
      };
      mediaRec.start();
      $("recBtn").disabled = true; $("recStopBtn").disabled = false;
      $("recStatus").textContent = "Recording… read the script above (about 30 seconds), then press Stop.";
    }).catch(function () { $("recStatus").textContent = "Microphone permission was denied — you can still type and listen in this demo."; });
  });
  $("recStopBtn").addEventListener("click", function () {
    if (mediaRec && mediaRec.state !== "inactive") mediaRec.stop();
    $("recBtn").disabled = false; $("recStopBtn").disabled = true;
  });

  /* ---------- Init ---------- */
  renderBiz(); renderClips(); renderVoicePicker(); updateOwner();
  if (synth) { loadVoices(); if (typeof synth.onvoiceschanged !== "undefined") synth.onvoiceschanged = loadVoices; }
  window.__bfDemo = { state: state, handleUser: handleUser, startCall: startCall }; // for automated testing
})();
