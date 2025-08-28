const API_KEY = "AIzaSyADVvCdD-Evdz138mI0vbvJgHrKjGwjUKs"; // Gemini key
let controller = null;
let voiceEnabled = true;
let speaking = false;

// Send Message
async function sendMessage() {
  const input = document.getElementById("user-input");
  const typing = document.getElementById("typing-indicator");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, "user");
  input.value = "";
  typing.classList.remove("hidden");
  input.disabled = true;

  controller = new AbortController();

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userMessage }] }]
        }),
        signal: controller.signal
      }
    );

    const data = await response.json();
    let aiText = "⚠️ No response.";
    if (data?.candidates?.length > 0) {
      const parts = data.candidates[0].content.parts;
      if (parts && parts.length > 0) {
        aiText = parts.map(p => p.text).join("\n");
      }
    }

    addMessage(aiText, "ai");
    if (voiceEnabled) speak(aiText);

  } catch (err) {
    addMessage("❌ Error: " + err.message, "ai");
  } finally {
    typing.classList.add("hidden");
    input.disabled = false;
  }
}

// Add Message
function addMessage(text, sender) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  if (sender === "ai") {
    msg.innerHTML = `
      <div class="ai-logo"><img src="NEROX.png" alt="AI"></div>
      <div>${marked.parse(text)}</div>
    `;
    enhanceCodeBlocks(msg);
  } else {
    msg.innerHTML = marked.parse(text);
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Enhance code blocks
function enhanceCodeBlocks(msg) {
  msg.querySelectorAll("pre code").forEach(block => {
    const wrapper = document.createElement("div");
    wrapper.className = "code-block";
    wrapper.textContent = block.textContent;

    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "📋 Copy";
    btn.onclick = () => {
      navigator.clipboard.writeText(block.textContent);
      btn.textContent = "✅ Copied!";
      setTimeout(() => (btn.textContent = "📋 Copy"), 1500);
    };

    wrapper.appendChild(btn);
    block.parentNode.replaceWith(wrapper);
  });
}

// Stop AI
function stopAI() {
  if (controller) controller.abort();
  window.speechSynthesis.cancel();
  speaking = false;
}

// Voice
function speak(text) {
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.onend = () => (speaking = false);
  window.speechSynthesis.speak(utter);
}

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  document.querySelector(".voice-toggle").textContent = voiceEnabled ? "🔊 Voice: ON" : "🔇 Voice: OFF";
}

function clearChat() {
  document.getElementById("chat-box").innerHTML = "";
}

function toggleTheme() {
  document.body.classList.toggle("light");
}
