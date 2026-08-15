const { invoke } = window.__TAURI__.core;

const editor = document.getElementById("editor");
const history = document.getElementById("history");
const dateLabel = document.getElementById("date");

let currentDate;

function today() {
  return new Date().toISOString().split("T")[0];
}

async function loadJournal(date) {
  currentDate = date;

  dateLabel.textContent = date;

  const content = await invoke("load_journal", {
    date,
  });

  editor.value = content;
}

async function saveJournal() {
  await invoke("save_journal", {
    date: currentDate,
    content: editor.value,
  });
}

async function refreshHistory() {
  const journals = await invoke("list_journals");

  history.innerHTML = "";

  journals.forEach((file) => {
    const item = document.createElement("div");

    item.className = "journal-item";
    item.textContent = file.replace(".txt", "");

    item.onclick = () => {
      loadJournal(file.replace(".txt", ""));
    };

    history.appendChild(item);
  });
}

let saveTimer;

editor.addEventListener("input", () => {
  clearTimeout(saveTimer);

  saveTimer = setTimeout(async () => {
    await saveJournal();
    await refreshHistory();
  }, 1000);
});

window.addEventListener("DOMContentLoaded", async () => {
  await loadJournal(today());
  await refreshHistory();
});