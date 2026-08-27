const { invoke } = window.__TAURI__.core; // imports the invoke function from the Tauri desktop/mobile application framework.
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

  const content = await invoke("load_journal", { date });

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
  const journalDates = journals.map(file => file.replace(".txt", ""));
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

  const now = new Date();
  renderCalendar(now.getFullYear(), now.getMonth(), journalDates);
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

function renderCalendar(year, month, journalDates) {
  const calendar = document.getElementById("calendar");

  calendar.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const btn = document.createElement("button");

    btn.textContent = day;

    if (journalDates.includes(dateStr)) {
      btn.classList.add("has-journal");
    }

    btn.onclick = () => loadJournal(dateStr);

    calendar.appendChild(btn);
  }
}