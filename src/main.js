const { invoke } = window.__TAURI__.core; // imports the invoke function from the Tauri desktop/mobile application framework.
const editor = document.getElementById("editor");
const history = document.getElementById("history");
const dateLabel = document.getElementById("date");
const header = document.getElementById("header");
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let allJournalDates = [];

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
  const journalDates = journals.map(file =>
    file.replace(".txt", "")
  );

  allJournalDates = journalDates;

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
  renderCalendar(
    currentYear,
    currentMonth,
    allJournalDates
  );
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
  const header = document.getElementById("header");

  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  if (!title) {
    title = document.createElement("h3");
    title.id = "calendar-title";
    header.appendChild(title);
  }

  // Update title
  title.textContent = `${monthNames[month]} ${year}`;


  // Remove old grid if it exists
  const oldGrid = document.querySelector(".calendar-grid");
  if (oldGrid) {
    oldGrid.remove();
  }

  // Create buttons only once
  if (!document.getElementById("prev-month")) {
    const prevBtn = document.createElement("button");
    prevBtn.id = "prev-month";
    prevBtn.textContent = "◀";

    prevBtn.onclick = () => {
      currentMonth--;

      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }

      renderCalendar(currentYear, currentMonth, allJournalDates);
    };

    header.prepend(prevBtn);
  }

  if (!document.getElementById("next-month")) {
    const nextBtn = document.createElement("button");
    nextBtn.id = "next-month";
    nextBtn.textContent = "▶";

    nextBtn.onclick = () => {
      currentMonth++;

      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }

      renderCalendar(currentYear, currentMonth, allJournalDates);
    };

    header.appendChild(nextBtn);
  }

  // Create day grid
  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Empty cells before first day
  for (let i = 0; i < firstDay.getDay(); i++) {
    const empty = document.createElement("div");
    grid.appendChild(empty);
  }

  // Day buttons
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const btn = document.createElement("button");

    btn.textContent = day;

    if (journalDates.includes(dateStr)) {
      btn.classList.add("has-journal");
    }

    btn.onclick = () => loadJournal(dateStr);

    grid.appendChild(btn);
  }

  calendar.appendChild(grid);
}