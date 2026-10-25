// BrandForge Voice Agent Demo v2 — rule-based dialogue engine.
// Agent speech is ONLY pre-generated clips in two auditioned natural voices
// (see README). No browser speechSynthesis is used for the agent's voice.
(function () {
  "use strict";
  var BIZ = window.BUSINESSES;
  var state = {
    bizId: "dental",
    stage: "idle", // idle | reason | name | phone | time | done | ended
    lead: { name: "", phone: "", service: "", time: "" },
    transcript: [],
    voiceChoice: "female" // female | male | own
  };

  var $ = function (id) { return document.getElementById(id); };
  var transcriptEl = $("transcript"), inputEl = $("userInput");

  var BIZ_TABS = [
    { id: "dental", label: "Dental" },
    { id: "hvac", label: "HVAC" },
    { id: "realestate", label: "Real Estate" },
    { id: "salon", label: "Salon" }
  ];
  var VOICE_TABS = [
    { id: "female", label: "Female" },
    { id: "male", label: "Male" },
    { id: "own", label: "Your own voice" }
  ];

  // Generic flow clips, shared by all businesses. Files: audio/flow-<key>-<f|m>.mp3
  var GENERIC_CLIPS = ["ask-name", "ask-phone", "ask-time", "lets-book", "fallback", "confirm", "goodbye"];

  /* ---------- Clip playback (queue, sequential) ---------- */
  var audioQueue = [], currentAudio = null;
  function voiceSuffix() { return state.voiceChoice === "male" ? "m" : "f"; } // "own" demo plays the female voice
  function clipSrc(key) {
    if (GENERIC_CLIPS.indexOf(key) !== -1) return "audio/flow-" + key + "-" + voiceSuffix() + ".mp3";
    var clips = BIZ[state.bizId].clips; // keys: greeting | faq | menu with F/M suffix in data
    return clips[key + (voiceSuffix() === "f" ? "F" : "M")];
  }
  function setWaveActive(active) {
    var w = $("waveVisualizer");
    if (w) w.classList.toggle("hidden", !active);
  }
  function playNext() {
    if (!audioQueue.length) {
      currentAudio = null;
      setWaveActive(false);
      return;
    }
    var src = audioQueue.shift();
    try {
      currentAudio = new Audio(src);
      setWaveActive(true);
      currentAudio.onended = function () { playNext(); };
      currentAudio.onerror = function () { playNext(); };
      var p = currentAudio.play();
      if (p && typeof p.catch === "function") p.catch(function () { playNext(); });
    } catch (e) { playNext(); }
  }
  function playClips(keys) {
    if (!keys || !keys.length) return;
    keys.forEach(function (k) { audioQueue.push(clipSrc(k)); });
    if (!currentAudio) playNext();
  }
  function stopAudio() {
    audioQueue = [];
    if (currentAudio) {
      try { currentAudio.onended = null; currentAudio.onerror = null; currentAudio.pause(); } catch (e) {}
      currentAudio = null;
    }
    setWaveActive(false);
  }

  /* ---------- Business tabs ---------- */
  function renderBizTabs() {
    $("bizTabs").innerHTML = BIZ_TABS.map(function (t) {
      return '<button class="tab' + (t.id === state.bizId ? " active" : "") + '" data-biz="' + t.id + '">' + t.label + "</button>";
    }).join("");
    Array.prototype.forEach.call(document.querySelectorAll("#bizTabs .tab"), function (b) {
      b.addEventListener("click", function () { selectBiz(b.getAttribute("data-biz")); });
    });
    var b = BIZ[state.bizId];
    $("callBizName").textContent = b.name + " — " + b.city;
  }
  function selectBiz(id) {
    state.bizId = id;
    resetCall();
    renderBizTabs();
  }

  /* ---------- Voice selector ---------- */
  function renderVoiceTabs() {
    $("voicePicker").innerHTML = VOICE_TABS.map(function (t) {
      return '<button class="tab' + (t.id === state.voiceChoice ? " active" : "") + '" data-voice="' + t.id + '">' + t.label + "</button>";
    }).join("");
    Array.prototype.forEach.call(document.querySelectorAll("#voicePicker .tab"), function (b) {
      b.addEventListener("click", function () {
        state.voiceChoice = b.getAttribute("data-voice");
        stopAudio();
        renderVoiceTabs();
      });
    });
    $("ownVoice").classList.toggle("hidden", state.voiceChoice !== "own");
  }

  /* ---------- Transcript / appointment panel ---------- */
  function addMsg(who, text) {
    state.transcript.push({ who: who, text: text });
    var row = document.createElement("div");
    row.className = "msg " + (who === "Agent" ? "agent" : "caller");
    row.innerHTML = '<span class="who">' + who + ":</span> " + text.replace(/</g, "&lt;");
    transcriptEl.appendChild(row);
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }
  function agentSay(text, clips) {
    addMsg("Agent", text);
    playClips(clips);
    updateAppt();
  }
  function updateAppt() {
    $("leadName").textContent = state.lead.name || "—";
    $("leadPhone").textContent = state.lead.phone || "—";
    $("leadService").textContent = state.lead.service || "—";
    $("leadTime").textContent = state.lead.time || "—";
    $("leadBooking").textContent =
      state.stage === "done" ? "Confirmed" :
      state.stage === "ended" ? "Ended — not booked" :
      state.stage === "idle" ? "Waiting" : "In progress";
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
    if (stage === "name") agentSay("Great, I can book that for you. May I have your full name, please?", ["ask-name"]);
    if (stage === "phone") agentSay("Thanks, " + (state.lead.name.split(" ")[0] || "there") + ". What's the best phone number for your confirmation text?", ["ask-phone"]);
    if (stage === "time") agentSay("And what day and time works best for you? For example, tomorrow at 10 AM.", ["ask-time"]);
  }
  function finish() {
    var b = BIZ[state.bizId];
    state.stage = "done";
    agentSay(b.confirm + " Summary: " + state.lead.service + " for " + state.lead.name + ", " + state.lead.time + ". A confirmation will be texted to " + state.lead.phone + ". Is there anything else I can help with?", ["confirm"]);
    $("callStatus").textContent = "Call complete — appointment confirmed";
    updateStatusDot("done");
    updateAppt();

    // Trigger Owner SMS alert & CRM payload
    var alertEl = $("ownerAlert");
    if (alertEl) {
      $("ownerAlertText").textContent = "New Booking: " + (state.lead.name || "Customer") + " • " + (state.lead.service || "Appointment") + " • " + (state.lead.time || "Scheduled") + " • Confirmation sent to " + (state.lead.phone || "provided phone") + ".";
      alertEl.classList.remove("hidden");
    }
    var crmJsonEl = $("crmJson");
    if (crmJsonEl) {
      var payload = {
        event: "appointment.booked",
        business: b.name,
        vertical: b.label,
        location: b.city,
        lead: {
          name: state.lead.name,
          phone: state.lead.phone,
          service: state.lead.service,
          appointment_time: state.lead.time
        },
        source: "BrandForge Voice Agent",
        timestamp: new Date().toISOString()
      };
      crmJsonEl.textContent = JSON.stringify(payload, null, 2);
    }
  }

  function handleUser(text) {
    if (!text.trim()) return;
    if (state.stage === "idle" || state.stage === "ended") return;
    addMsg("Caller", text);
    var b = BIZ[state.bizId];
    var faq = isFAQ(text);
    var svc = detectService(b, text);

    // FAQ can be answered at any point, then resume the flow.
    if (faq) {
      agentSay(faqAnswer(b, faq, svc), ["faq"]);
      if (state.stage === "reason") { if (state.lead.service) askFor("name"); else agentSay("Would you like to book an appointment? Just tell me what you need.", ["menu"]); }
      else if (state.stage === "name") askFor("name");
      else if (state.stage === "phone") askFor("phone");
      else if (state.stage === "time") askFor("time");
      return;
    }

    if (state.stage === "reason") {
      if (svc) state.lead.service = svc.label;
      if (!state.lead.service) {
        if (/book|appointment|schedule|visit/.test(lower(text))) {
          agentSay("Of course. Which service would you like? We offer: " + b.services.map(function (s) { return s.label; }).join(", ") + ".", ["menu"]);
          return;
        }
        agentSay("I can help with that. Could you tell me a little more — are you looking to book one of these: " + b.services.map(function (s) { return s.label; }).join(", ") + "?", ["menu"]);
        return;
      }
      var p = svc ? " " + svc.label + " is " + svc.price + "." : "";
      agentSay("Perfect —" + p + " Let me get you booked in.", ["lets-book"]);
      askFor("name");
      return;
    }
    if (state.stage === "name") {
      var n = extractName(text);
      var ph = extractPhone(text);
      if (ph && !n) { agentSay("Thanks for the number — I'll add it in a moment. First, may I have your name?", ["ask-name"]); state.lead.phone = ph; return; }
      if (!n) { agentSay("Sorry, I didn't catch your name. Could you say it once more, like: my name is Sarah Johnson?", ["fallback"]); return; }
      state.lead.name = n;
      if (state.lead.phone) { askFor("time"); } else { askFor("phone"); }
      return;
    }
    if (state.stage === "phone") {
      var ph2 = extractPhone(text);
      var tm = extractTime(text);
      if (!ph2) {
        if (tm) { agentSay("Got the time — I still need a phone number for the confirmation text. What's the best number?", ["ask-phone"]); state.lead.time = tm; return; }
        agentSay("I need a 10-digit US phone number for the confirmation text — could you share it, digits are fine?", ["fallback", "ask-phone"]);
        return;
      }
      state.lead.phone = ph2;
      if (state.lead.time) finish(); else askFor("time");
      return;
    }
    if (state.stage === "time") {
      var tm2 = extractTime(text);
      if (!tm2) { agentSay("What day and time suits you? For example, Friday at 2 PM.", ["fallback", "ask-time"]); return; }
      state.lead.time = tm2;
      finish();
      return;
    }
    if (state.stage === "done") {
      if (/new call|restart|again/.test(lower(text))) { startCall(); return; }
      agentSay("You're welcome! Thanks for calling " + b.name + ". Goodbye, and we'll see you soon.", ["goodbye"]);
      return;
    }
  }

  function updateStatusDot(mode) {
    var dot = $("statusDot");
    if (!dot) return;
    dot.className = "status-dot" + (mode ? " " + mode : "");
  }

  function renderChips() {
    var b = BIZ[state.bizId];
    var container = $("chipsContainer");
    var chipsWrap = $("quickChips");
    if (!container || !chipsWrap || !b.chips || !b.chips.length) return;
    container.innerHTML = b.chips.map(function (c) {
      return '<button class="chip" type="button">' + c.replace(/</g, "&lt;") + '</button>';
    }).join("");
    Array.prototype.forEach.call(container.querySelectorAll(".chip"), function (btn) {
      btn.addEventListener("click", function () {
        handleUser(btn.textContent);
      });
    });
    chipsWrap.classList.remove("hidden");
  }

  /* ---------- Call lifecycle ---------- */
  function setCallUI(active) {
    inputEl.disabled = !active;
    $("sendBtn").disabled = !active;
    $("micBtn").disabled = !active;
    $("startBtn").classList.toggle("hidden", active);
    $("endBtn").classList.toggle("hidden", !active);
    updateStatusDot(active ? "live" : (state.stage === "done" ? "done" : ""));
  }
  function resetCall() {
    stopAudio();
    state.lead = { name: "", phone: "", service: "", time: "" };
    state.transcript = [];
    state.stage = "idle";
    transcriptEl.innerHTML = "";
    setCallUI(false);
    updateStatusDot("");
    $("callStatus").textContent = "Not started";
    var alertEl = $("ownerAlert"); if (alertEl) alertEl.classList.add("hidden");
    var crmModal = $("crmModal"); if (crmModal) crmModal.classList.add("hidden");
    var chipsEl = $("quickChips"); if (chipsEl) chipsEl.classList.add("hidden");
    updateAppt();
  }
  function startCall() {
    resetCall();
    var b = BIZ[state.bizId];
    state.stage = "reason";
    setCallUI(true);
    $("callStatus").textContent = "Live call (simulated) — you are the customer";
    agentSay(b.greeting, ["greeting"]);
    renderChips();
    updateAppt();
  }
  function endCall() {
    stopAudio();
    if (state.stage !== "done") state.stage = "ended";
    setCallUI(false);
    updateStatusDot("");
    $("callStatus").textContent = "Call ended";
    var chipsEl = $("quickChips"); if (chipsEl) chipsEl.classList.add("hidden");
    updateAppt();
  }
  $("startBtn").addEventListener("click", startCall);
  $("endBtn").addEventListener("click", endCall);
  $("sendBtn").addEventListener("click", function () { var v = inputEl.value; inputEl.value = ""; handleUser(v); });
  inputEl.addEventListener("keydown", function (e) { if (e.key === "Enter") $("sendBtn").click(); });

  /* ---------- Voice preview audition ---------- */
  $("previewVoiceBtn").addEventListener("click", function () {
    stopAudio();
    var b = BIZ[state.bizId];
    var clip = b.clips["greeting" + (voiceSuffix() === "f" ? "F" : "M")];
    audioQueue.push(clip);
    playNext();
  });

  /* ---------- CRM payload interactions ---------- */
  $("viewPayloadBtn").addEventListener("click", function () {
    var modal = $("crmModal");
    if (modal) modal.classList.toggle("hidden");
  });
  $("copyPayloadBtn").addEventListener("click", function () {
    var json = $("crmJson").textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(function () {
        var btn = $("copyPayloadBtn");
        btn.textContent = "Copied!";
        setTimeout(function () { btn.textContent = "Copy JSON"; }, 2000);
      });
    }
  });

  /* ---------- Mic input (Web Speech API recognition) ---------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  $("micBtn").addEventListener("click", function () {
    if (!SR) { alert("Speech recognition isn't available in this browser — please type instead. Chrome works best for the mic."); return; }
    try {
      var rec = new SR(); rec.lang = "en-US"; rec.interimResults = false;
      $("micBtn").textContent = "Listening…";
      rec.onresult = function (ev) { var t = ev.results[0][0].transcript; inputEl.value = ""; handleUser(t); };
      rec.onend = function () { $("micBtn").textContent = "Mic"; };
      rec.onerror = function () { $("micBtn").textContent = "Mic"; };
      rec.start();
    } catch (e) { $("micBtn").textContent = "Mic"; }
  });

  /* ---------- Own-voice enrolment recorder (MediaRecorder) ---------- */
  var mediaRec = null, chunks = [];
  $("recBtn").addEventListener("click", function () {
    if (!navigator.mediaDevices || !window.MediaRecorder) { $("recStatus").textContent = "Recording isn't supported in this browser."; return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      chunks = []; mediaRec = new MediaRecorder(stream);
      mediaRec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      mediaRec.onstop = function () {
        var blob = new Blob(chunks, { type: mediaRec.mimeType || "audio/webm" });
        var url = URL.createObjectURL(blob);
        var pb = $("recPlayback"); pb.src = url; pb.classList.remove("hidden");
        $("recStatus").textContent = "Sample recorded — play it back below.";
        stream.getTracks().forEach(function (t) { t.stop(); });
      };
      mediaRec.start();
      $("recBtn").disabled = true; $("recStopBtn").disabled = false;
      $("recStatus").textContent = "Recording… speak for about 30 seconds, then press Stop.";
    }).catch(function () { $("recStatus").textContent = "Microphone permission was denied."; });
  });
  $("recStopBtn").addEventListener("click", function () {
    if (mediaRec && mediaRec.state !== "inactive") mediaRec.stop();
    $("recBtn").disabled = false; $("recStopBtn").disabled = true;
  });

  /* ---------- Init ---------- */
  renderBizTabs(); renderVoiceTabs(); updateAppt();
  window.__bfDemo = { state: state, handleUser: handleUser, startCall: startCall, endCall: endCall, selectBiz: selectBiz,
    setVoice: function (v) { state.voiceChoice = v; renderVoiceTabs(); }, clipSrc: clipSrc }; // for automated testing
})();
