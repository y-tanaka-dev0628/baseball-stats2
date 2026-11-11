
console.log("app.js読み込み成功");

let games =
  JSON.parse(
    localStorage.getItem("games")
  ) || [];

  let atBats =
  JSON.parse(
    localStorage.getItem("atBats")
  ) || [];

let editingGameId = null;

document.getElementById("addGameBtn")
  .addEventListener("click", () => {

    const opponent =
      document.getElementById("opponent").value;

    const date =
      document.getElementById("date").value;

    const location =
      document.getElementById("location").value;

    if (editingGameId !== null) {
      const game = games.find(
        item => String(item.id) === String(editingGameId)
      );

      if (!game) {
        cancelGameEdit();
        return;
      }

      game.opponent = opponent;
      game.date = date;
      game.location = location;
      cancelGameEdit();
    } else {
      const game = {
        id: games.reduce(
          (maxId, existingGame) =>
            Math.max(maxId, Number(existingGame.id) || 0),
          0
        ) + 1,
        opponent,
        date,
        location
      };

      games.push(game);
    }

    localStorage.setItem("games", JSON.stringify(games));
    updateGameSelect();
    updateGameList();
  });

document.getElementById("cancelGameEditBtn")
  .addEventListener("click", cancelGameEdit);

function cancelGameEdit() {
  editingGameId = null;
  document.getElementById("opponent").value = "";
  document.getElementById("date").value = "";
  document.getElementById("location").value = "";
  document.getElementById("addGameBtn").textContent = "試合を追加";
  document.getElementById("cancelGameEditBtn").hidden = true;
}

function startGameEdit(gameId) {
  const game = games.find(
    item => String(item.id) === String(gameId)
  );

  if (!game) {
    return;
  }

  editingGameId = game.id;
  document.getElementById("opponent").value = game.opponent || "";
  document.getElementById("date").value = game.date || "";
  document.getElementById("location").value = game.location || "";
  document.getElementById("addGameBtn").textContent = "試合を更新";
  document.getElementById("cancelGameEditBtn").hidden = false;
  document.getElementById("gameSelect").value = game.id;
  document.getElementById("opponent").focus();
}

function deleteGame(gameId) {
  const game =
    games.find(item => String(item.id) === String(gameId));

  if (!game) {
    return;
  }

  const relatedAtBats =
    atBats.filter(item => String(item.gameId) === String(gameId));
  const gameName =
    `${game.opponent} (${game.date})`;
  const message =
    `「${gameName}」を削除しますか？関連する打席${relatedAtBats.length}件も削除されます。`;

  if (!window.confirm(message)) {
    return;
  }

  games = games.filter(item => String(item.id) !== String(gameId));
  atBats = atBats.filter(item => String(item.gameId) !== String(gameId));

  if (String(editingGameId) === String(gameId)) {
    cancelGameEdit();
  }

  localStorage.setItem("games", JSON.stringify(games));
  localStorage.setItem("atBats", JSON.stringify(atBats));

  updateGameSelect();
  updateGameList();
  loadAtBats();
}

function updateGameSelect() {

  const select =
    document.getElementById("gameSelect");

  const selectedGameId = select.value;
  select.innerHTML = "";

  games.forEach(game => {

    const option =
      document.createElement("option");

    option.value = game.id;

    option.textContent =
      `${game.opponent} (${game.date})`;

    select.appendChild(option);

  });

  if (games.some(game => String(game.id) === selectedGameId)) {
    select.value = selectedGameId;
  }

}

function formatRate(value) {
  const formatted = value.toFixed(3);
  return formatted.startsWith("0.")
    ? formatted.slice(1)
    : formatted;
}

function calculateStats(records) {
  let atBatsCount = 0;
  let hits = 0;
  let totalBases = 0;
  let walks = 0;
  let hitByPitch = 0;

  records.forEach(atBat => {
    const result = atBat.result;

    if (result === "単打") {
      hits++;
      totalBases++;
      atBatsCount++;
    } else if (result === "二塁打") {
      hits++;
      totalBases += 2;
      atBatsCount++;
    } else if (result === "三塁打") {
      hits++;
      totalBases += 3;
      atBatsCount++;
    } else if (result === "本塁打") {
      hits++;
      totalBases += 4;
      atBatsCount++;
    } else if ([
      "ゴロ",
      "フライ",
      "三振"
    ].includes(result)) {
      atBatsCount++;
    } else if (result === "四球") {
      walks++;
    } else if (result === "死球") {
      hitByPitch++;
    }
  });

  const avg =
    atBatsCount === 0
      ? 0
      : hits / atBatsCount;
  const slg =
    atBatsCount === 0
      ? 0
      : totalBases / atBatsCount;
  const obpDenominator =
    atBatsCount + walks + hitByPitch;
  const obp =
    obpDenominator === 0
      ? 0
      : (hits + walks + hitByPitch) / obpDenominator;
  const ops =
    Number(formatRate(obp)) + Number(formatRate(slg));

  return {
    atBatsCount,
    hits,
    avg: formatRate(avg),
    slg: formatRate(slg),
    obp: formatRate(obp),
    ops: formatRate(ops)
  };
}

function updateGameList() {
  const tbody =
    document.querySelector("#gameTable tbody");

  tbody.innerHTML = "";

  if (games.length === 0) {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 10;
    cell.textContent = "試合データがありません";
    return;
  }

  games.forEach(game => {
    const gameAtBats = atBats.filter(
      atBat => String(atBat.gameId) === String(game.id)
    );
    const stats = calculateStats(gameAtBats);
    const row = tbody.insertRow();

    [
      game.date || "未設定",
      game.opponent || "未設定",
      game.location || "未設定",
      stats.atBatsCount,
      stats.hits,
      stats.avg,
      stats.obp,
      stats.slg,
      stats.ops
    ].forEach(value => {
      row.insertCell().textContent = value;
    });

    const actionCell = row.insertCell();
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "編集";
    editButton.addEventListener("click", () => {
      startGameEdit(game.id);
    });
    actionCell.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-game-button";
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", () => {
      deleteGame(game.id);
    });
    actionCell.appendChild(deleteButton);
  });
}

document
  .getElementById("addAtBatBtn")
  .addEventListener("click", () => {

    const gameId =
      document.getElementById("gameSelect").value;

    if (!gameId) {
      alert("先に試合を追加してください。");
      return;
    }

    const result =
      document.getElementById("result").value;

    let direction =
      document.getElementById("direction").value;

    let battedBallType =
      document.getElementById("battedBallType").value;

    const rbi =
      document.getElementById("rbi").value;

    const noDirectionResults = [
      "三振",
      "四球",
      "死球"
    ];

    if (
      noDirectionResults.includes(result)
    ) {

      direction = "-";
      battedBallType = "-";

    }

    const tbody =
      document.querySelector(
        "#atBatTable tbody"
      );

    const tr =
      document.createElement("tr");

    tr.innerHTML = `
      <td>${gameId}</td>
      <td>${result}</td>
      <td>${direction}</td>
      <td>${battedBallType}</td>
      <td>${rbi}</td>
      <td>
        <button class="deleteBtn">
          削除
        </button>
      </td>
    `;

    tr.querySelector(".deleteBtn")
  .addEventListener("click", () => {

    tr.remove();

    atBats = atBats.filter(
  item => item.id !== atBat.id
);

    localStorage.setItem(
      "atBats",
      JSON.stringify(atBats)
    );

    updateStats();

  });


      const atBat = {
  id: Date.now(),
  gameId,
  result,
  direction,
  battedBallType,
  rbi
};


atBats.push(atBat);

localStorage.setItem(
  "atBats",
  JSON.stringify(atBats)
);

tbody.appendChild(tr);

updateStats();

  });

function updateStats() {

  const stats = calculateStats(atBats);

  document.getElementById("ab").textContent =
    stats.atBatsCount;

  document.getElementById("hits").textContent =
    stats.hits;

  document.getElementById("avg").textContent =
    stats.avg;

  document.getElementById("slg").textContent =
    stats.slg;

  document.getElementById("obp").textContent =
    stats.obp;

  document.getElementById("ops").textContent =
    stats.ops;

  updateGameList();

}

function loadAtBats() {

  const tbody =
    document.querySelector(
      "#atBatTable tbody"
    );

  tbody.innerHTML = "";

  atBats.forEach(atBat => {

    const tr =
      document.createElement("tr");

    tr.innerHTML = `
      <td>${atBat.gameId}</td>
      <td>${atBat.result}</td>
      <td>${atBat.direction}</td>
      <td>${atBat.battedBallType}</td>
      <td>${atBat.rbi}</td>
      <td>
        <button class="deleteBtn">
          削除
        </button>
      </td>
    `;

    tr.querySelector(".deleteBtn")
  .addEventListener("click", () => {

    tr.remove();

    atBats = atBats.filter(
      item => item.id !== atBat.id
    );

    localStorage.setItem(
      "atBats",
      JSON.stringify(atBats)
    );

    updateStats();

  });

    tbody.appendChild(tr);

  });

  updateStats();

}

updateGameSelect();
loadAtBats();