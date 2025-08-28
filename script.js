const API_KEY = "AIzaSyADVvCdD-Evdz138mI0vbvJgHrKjGwjUKs";

// 🎤 Send user message
async function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const typing = document.getElementById("typing-indicator");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Show user message instantly
  addMessage(userMessage, "user");
  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  // Typing dots
  typing.classList.remove("hidden");

  try {
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userMessage }] }]
        })
      }
    );

    const data = await response.json();
    console.log("Gemini raw:", data);

    // Extract AI text
    let aiText = "⚠️ I couldn’t generate a response.";
    if (data?.candidates?.length > 0) {
      const parts = data.candidates[0].content.parts;
      if (parts && parts.length > 0) {
        aiText = parts.map(p => p.text).join("\n");
      }
    }

    // Hide typing dots
    typing.classList.add("hidden");

    // Render as Markdown
    const formatted = marked.parse(aiText);
    addMessage(formatted, "ai", true);

    // Speak answer out loud
    speak(aiText);

  } catch (err) {
    console.error("Gemini Error:", err);
    typing.classList.add("hidden");
    addMessage("❌ Network issue or invalid API key.", "ai");
  }
}

// 📩 Add a chat bubble
function addMessage(text, sender, isHTML = false) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  if (isHTML) {
    msg.innerHTML = text;
  } else {
    msg.textContent = text;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 🔊 Text-to-Speech
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.pitch = 1;
  speech.rate = 1.05;
  speech.volume = 1;

  // Try to pick a clean voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes("Google US English"));
  if (preferred) speech.voice = preferred;

  window.speechSynthesis.cancel(); // stop previous before speaking
  window.speechSynthesis.speak(speech);
}

// 🧹 Clear chat
function clearChat() {
  document.getElementById("chat-box").innerHTML = "";
}

// 🎙️ Voice input (speech-to-text)
function startVoice() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("❌ Your browser doesn’t support speech recognition.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log("🎤 Listening...");
    addMessage("🎙️ Listening...", "ai");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("user-input").value = transcript;
    sendMessage();
  };

  recognition.onerror = (err) => {
    console.error("Voice Error:", err);
    addMessage("⚠️ Voice recognition failed.", "ai");
  };

  recognition.start();
}
function toggleTheme() {
  document.body.classList.toggle("light");
}

// File/image preview
function previewFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.classList.add("message", "user");

  if (file.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = "200px";
    img.style.borderRadius = "8px";
    msg.appendChild(img);
  } else {
    msg.textContent = `📎 ${file.name}`;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
