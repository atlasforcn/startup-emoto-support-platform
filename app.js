const entries = [
  {
    id: "late-night",
    alias: "夜裡醒著的人",
    mood: "焦慮",
    score: 68,
    wait: 4,
    risk: "中",
    note: "明天要報告，腦袋停不下來，希望有人陪我整理一下。",
  },
  {
    id: "empty-room",
    alias: "空房間",
    mood: "孤單",
    score: 82,
    wait: 11,
    risk: "高",
    note: "今天很想消失，已經一整天沒有吃東西。",
  },
  {
    id: "slow-cloud",
    alias: "慢慢雲",
    mood: "低落",
    score: 45,
    wait: 7,
    risk: "低",
    note: "最近提不起勁，想找人說說話。",
  },
];

const supporters = [
  { name: "Lina", specialty: "焦慮整理、睡前陪伴", fit: 94, available: 2, level: "同儕支持者" },
  { name: "Hao", specialty: "學業壓力、呼吸練習", fit: 89, available: 5, level: "志工督導中" },
  { name: "Ming", specialty: "危機分流、資源轉介", fit: 97, available: 1, level: "專業值班" },
  { name: "Ivy", specialty: "孤單陪伴、回訪追蹤", fit: 86, available: 8, level: "同儕支持者" },
];

const followups = [
  { day: "D+1", title: "完成第一次回訪", body: "使用者表示睡眠時間增加，仍需追蹤報告前焦慮。" },
  { day: "D+3", title: "支持者督導紀錄", body: "已提醒支持者避免給出診斷語言，改用陪伴與資源整理。" },
  { day: "D+7", title: "成效摘要", body: "本週 72% 使用者完成回訪，平均情緒分數下降 18 點。" },
];

let selectedId = entries[0].id;
let mode = "fit";
let generatedCount = 0;

function selectedEntry() {
  return entries.find((entry) => entry.id === selectedId) || entries[0];
}

function rankedSupporters() {
  const entry = selectedEntry();
  return [...supporters].sort((a, b) => {
    if (mode === "fast") return a.available - b.available;
    if (mode === "risk") return (entry.risk === "高" ? (b.level.includes("專業") ? 1 : 0) - (a.level.includes("專業") ? 1 : 0) : b.fit - a.fit);
    return b.fit - a.fit;
  });
}

function renderEntries() {
  document.querySelector("#entry-list").innerHTML = entries.map((entry) => `
    <button class="entry-card ${entry.id === selectedId ? "active" : ""}" type="button" data-id="${entry.id}">
      <strong>${entry.alias}</strong>
      <span>${entry.mood} / 等待 ${entry.wait} 分鐘</span>
      <span>${entry.note}</span>
      <small>${entry.risk}關懷</small>
    </button>
  `).join("");

  document.querySelectorAll(".entry-card").forEach((button) => {
    button.addEventListener("click", () => {
      selectedId = button.dataset.id;
      render();
    });
  });
}

function renderSelected() {
  const entry = selectedEntry();
  document.querySelector("#selected-entry").innerHTML = `
    <div>
      <h2>${entry.alias} · ${entry.mood}</h2>
      <p>${entry.note}</p>
    </div>
    <div class="mood-score">${entry.score} 分</div>
  `;
}

function renderMatches() {
  document.querySelector("#match-grid").innerHTML = rankedSupporters().slice(0, 3).map((supporter) => `
    <article class="match-card">
      <div class="avatar">${supporter.name.slice(0, 1)}</div>
      <h3>${supporter.name}</h3>
      <p>${supporter.level}</p>
      <p>${supporter.specialty} · ${supporter.available} 分鐘可接</p>
      <div class="score-line"><span>媒合度</span><strong>${supporter.fit}</strong></div>
      <div class="mini-track"><div class="mini-fill" style="--value: ${supporter.fit}%"></div></div>
    </article>
  `).join("");
}

function renderSafety() {
  const entry = selectedEntry();
  const best = rankedSupporters()[0];
  const riskScore = entry.risk === "高" ? 88 : entry.risk === "中" ? 58 : 26;
  document.querySelector("#metric-risk").textContent = entries.filter((item) => item.risk !== "低").length;
  document.querySelector("#metric-queue").textContent = entries.length + 15;
  document.querySelector("#metric-helpers").textContent = supporters.length + 23;
  document.querySelector("#metric-followup").textContent = `${Math.max(72, 72 + generatedCount)}%`;

  document.querySelector("#safety-card").innerHTML = `
    <span>${entry.alias} / ${entry.risk}關懷</span>
    <strong>${riskScore}</strong>
    <p>${entry.risk === "高" ? "先進入危機分流，不直接排入一般同儕陪伴。" : "可進入支持媒合，並保留回訪提醒。"}</p>
  `;

  const actions = [
    { title: "建議分流", body: entry.risk === "高" ? "提示緊急資源、可信任聯絡人與專業值班支持者。" : "一般支持者可接案，系統保留高關懷詞彙監測。" },
    { title: "推薦支持者", body: `${best.name}：${best.specialty}，${best.available} 分鐘內可接。` },
    { title: "安全邊界", body: "支持者使用陪伴與資源整理語言，避免診斷、治療或承諾救援。" },
  ];
  document.querySelector("#action-stack").innerHTML = actions.map((action) => `
    <article class="action-item">
      <strong>${action.title}</strong>
      <p>${action.body}</p>
    </article>
  `).join("");
}

function renderScript() {
  const entry = selectedEntry();
  document.querySelector("#script-box").innerHTML = `
    <strong>給 ${entry.alias} 的支持開場</strong>
    <p>我在這裡，先不用急著把事情說完整。你剛剛提到「${entry.note}」；我們可以先一起把最難受的部分分成現在能做、晚點再處理、需要找人協助三類。若你此刻有傷害自己的念頭，我會先陪你連到更即時的安全資源。</p>
  `;
}

function renderProgress() {
  document.querySelector("#progress-list").innerHTML = followups.map((item) => `
    <article class="progress-item">
      <div class="stamp">${item.day}</div>
      <div>
        <strong>${item.title}</strong>
        <p>${item.body}</p>
      </div>
    </article>
  `).join("");
}

function render() {
  renderEntries();
  renderSelected();
  renderMatches();
  renderSafety();
  renderScript();
  renderProgress();
}

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode;
    document.querySelectorAll(".segment").forEach((segment) => segment.classList.remove("active"));
    button.classList.add("active");
    render();
  });
});

document.querySelector("#new-entry").addEventListener("click", () => {
  entries.unshift({
    id: `entry-${Date.now()}`,
    alias: "剛送出的訊息",
    mood: "緊繃",
    score: 61,
    wait: 0,
    risk: "中",
    note: "剛剛和家人吵架，想先有人聽我說完。",
  });
  selectedId = entries[0].id;
  render();
});

document.querySelector("#script-button").addEventListener("click", () => {
  generatedCount += 1;
  renderScript();
  renderSafety();
});

document.querySelector("#follow-button").addEventListener("click", () => {
  followups.unshift({
    day: "現在",
    title: `${selectedEntry().alias} 建立回訪`,
    body: "已安排 24 小時後回訪，並提醒支持者記錄情緒分數變化。",
  });
  generatedCount += 2;
  render();
});

render();
