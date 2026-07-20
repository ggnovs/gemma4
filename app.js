// YOUR NGROK BACKEND URL
const KAGGLE_API_URL = "https://uncrown-everglade-outflank.ngrok-free.dev/chat";

// DOM Elements
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatBox = document.getElementById("chatBox");

// Event Listeners
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  // 1. Append User Message
  appendMessage(prompt, "user-message", false);
  userInput.value = "";
  
  // Disable UI while fetching response
  setLoadingState(true);

  // 2. Append Temporary Bot Loading Message
  const loadingDiv = appendMessage("Thinking...", "bot-message", false);

  try {
    // 3. Request to Kaggle / Ngrok Flask Server
    const response = await fetch(KAGGLE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true" // Bypasses ngrok landing alert
      },
      body: JSON.stringify({ prompt: prompt })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.response || "No response received.";

    // 4. Render Markdown into formatted HTML
    loadingDiv.innerHTML = DOMPurify.sanitize(marked.parse(rawText));

  } catch (error) {
    console.error("Backend Request Error:", error);
    loadingDiv.textContent = "❌ Connection Error. Verify that Kaggle cell is running and active.";
  } finally {
    setLoadingState(false);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function appendMessage(text, className, isMarkdown = false) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${className}`;
  
  if (isMarkdown) {
    msgDiv.innerHTML = DOMPurify.sanitize(marked.parse(text));
  } else {
    msgDiv.textContent = text;
  }

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgDiv;
}

function setLoadingState(isLoading) {
  userInput.disabled = isLoading;
  sendBtn.disabled = isLoading;
  if (!isLoading) userInput.focus();
}
