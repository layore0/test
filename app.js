const STORAGE_KEY = "music-items";

const youtubeUrlInput = document.querySelector("#youtubeUrl");
const tagInput = document.querySelector("#tagInput");
const addTagButton = document.querySelector("#addTagButton");
const tagPreview = document.querySelector("#tagPreview");
const saveButton = document.querySelector("#saveButton");
const message = document.querySelector("#message");
const musicList = document.querySelector("#musicList");
const musicItemTemplate = document.querySelector("#musicItemTemplate");

let pendingTags = [];

function extractVideoId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").trim();
    }

    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

function buildEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

function createTag(tagText) {
  const span = document.createElement("span");
  span.className = "tag";
  span.textContent = tagText;
  return span;
}

function renderPendingTags() {
  tagPreview.replaceChildren(...pendingTags.map(createTag));
}

function addTag() {
  const value = tagInput.value.trim();
  if (!value) {
    return;
  }

  pendingTags.push(value);
  tagInput.value = "";
  renderPendingTags();
}

function getStoredItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function setStoredItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderSavedMusic(items) {
  const nodes = items.map((item) => {
    const fragment = musicItemTemplate.content.cloneNode(true);
    const iframe = fragment.querySelector("iframe");
    const sourceLink = fragment.querySelector(".source-link");
    const tagsContainer = fragment.querySelector(".tags");

    iframe.src = buildEmbedUrl(item.videoId);
    iframe.title = `YouTube music player for ${item.videoId}`;
    sourceLink.href = item.originalUrl;
    sourceLink.textContent = item.originalUrl;

    tagsContainer.replaceChildren(...item.tags.map(createTag));

    return fragment;
  });

  musicList.replaceChildren(...nodes);
}

function saveMusic() {
  const originalUrl = youtubeUrlInput.value.trim();
  const videoId = extractVideoId(originalUrl);

  if (!videoId) {
    message.textContent = "Please provide a valid YouTube link.";
    return;
  }

  const items = getStoredItems();
  items.unshift({
    originalUrl,
    videoId,
    tags: pendingTags,
  });

  setStoredItems(items);
  renderSavedMusic(items);

  youtubeUrlInput.value = "";
  pendingTags = [];
  renderPendingTags();
  message.textContent = "Saved! Video will autoplay when loaded.";
}

addTagButton.addEventListener("click", addTag);
tagInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addTag();
  }
});
saveButton.addEventListener("click", saveMusic);

renderSavedMusic(getStoredItems());
