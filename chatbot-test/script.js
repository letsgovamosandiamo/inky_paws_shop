"use strict";

const CHATBOT_URL = "https://inky-paws-bot.letsgovamosandiamo.workers.dev/";
const STORAGE_KEY = "inkyPawsChatHistory";
const WELCOME_MESSAGE = "Hello! How can I help you today?";

const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messageHistory = document.getElementById("messageHistory");
const newChatButton = document.getElementById("newChatButton");
let conversation = [];

function appendInlineMarkdown(container, text) {
  const pattern = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;
  let lastIndex = 0;

  text.replace(pattern, (match, _group, offset) => {
    container.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
    const element = document.createElement(match.startsWith("**") ? "strong" : "em");
    element.textContent = match.startsWith("**") ? match.slice(2, -2) : match.slice(1, -1);
    container.appendChild(element);
    lastIndex = offset + match.length;
    return match;
  });

  container.appendChild(document.createTextNode(text.slice(lastIndex)));
}

function renderBotMarkdown(container, text) {
  const lines = text.split(/\r?\n/);
  let list = null;

  lines.forEach((line, index) => {
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet) {
      if (!list) {
        list = document.createElement("ul");
        container.appendChild(list);
      }
      const item = document.createElement("li");
      appendInlineMarkdown(item, bullet[1]);
      list.appendChild(item);
      return;
    }

    list = null;
    if (index > 0) container.appendChild(document.createElement("br"));
    appendInlineMarkdown(container, line);
  });
}

function saveConversation() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
}

function loadConversation() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    conversation = Array.isArray(saved)
      ? saved.filter(item => item && typeof item.text === "string" && (item.type === "user" || item.type === "bot"))
      : [];
  } catch (_error) {
    conversation = [];
  }
}

function addMessage(text, type, extraClass = "", save = true) {
  const message = document.createElement("div");
  message.className = `message ${type}-message ${extraClass}`.trim();
  if (type === "bot" && !extraClass) renderBotMarkdown(message, text);
  else message.textContent = text;
  messageHistory.appendChild(message);
  messageHistory.scrollTop = messageHistory.scrollHeight;
  if (save) {
    conversation.push({ text, type });
    saveConversation();
  }
  return message;
}

function restoreConversation() {
  messageHistory.innerHTML = "";
  loadConversation();
  if (conversation.length === 0) {
    addMessage(WELCOME_MESSAGE, "bot", "", false);
    return;
  }
  conversation.forEach(message => addMessage(message.text, message.type, "", false));
}

function startNewChat() {
  if (conversation.length > 0 && !window.confirm("Clear this conversation and start a new chat?")) return;
  conversation = [];
  localStorage.removeItem(STORAGE_KEY);
  messageHistory.innerHTML = "";
  addMessage(WELCOME_MESSAGE, "bot", "", false);
  messageInput.focus();
}

function setLoading(isLoading) {
  messageInput.disabled = isLoading;
  sendButton.disabled = isLoading;
  sendButton.textContent = isLoading ? "Sending…" : "Send";
}

async function sendMessage(event) {
  event.preventDefault();

  const userText = messageInput.value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  messageInput.value = "";
  setLoading(true);
  const loadingMessage = addMessage("Thinking…", "bot", "loading-message", false);

  try {
    const response = await fetch(CHATBOT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userText })
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (typeof data.reply !== "string") {
      throw new Error("The response did not include a reply");
    }

    loadingMessage.remove();
    addMessage(data.reply, "bot");
  } catch (error) {
    console.error("Chatbot request failed:", error);
    loadingMessage.remove();
    addMessage("Sorry, I couldn't get a reply right now. Please try again.", "bot");
  } finally {
    setLoading(false);
    messageInput.focus();
  }
}

chatForm.addEventListener("submit", sendMessage);
newChatButton.addEventListener("click", startNewChat);
restoreConversation();
