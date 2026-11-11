
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
let editingAtBatId = null;

function activateView(activeViewId) {
  document.querySelectorAll(".view-tab").forEach(tab => {
    const isActive = tab.dataset.view === activeViewId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  document.querySelectorAll(".app-view").forEach(view => {
    view.hidden = view.id !== activeViewId;
  });
}

document.querySelectorAll(".view-tab").forEach(tab => {
  tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
  tab.addEventListener("click", () => {
    activateView(tab.dataset.view);
  });
  tab.addEventListener("keydown", event => {
    const tabs = [...document.querySelectorAll(".view-tab")];
    const currentIndex = tabs.indexOf(tab);
    let nextIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  });
});

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

  activateView("inputView");
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
  if (
    editingAtBatId !== null &&
    !atBats.some(item => String(item.id) === String(editingAtBatId))
  ) {
    cancelAtBatEdit();
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

document.getElementById("addAtBatBtn")
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

    if (["三振", "四球", "死球"].includes(result)) {
      direction = "-";
      battedBallType = "-";
    }

    const atBatData = {
      gameId,
      result,
      direction,
      battedBallType,
      rbi: document.getElementById("rbi").value
    };

    if (editingAtBatId !== null) {
      const atBat = atBats.find(
        item => String(item.id) === String(editingAtBatId)
      );

      if (!atBat) {
        cancelAtBatEdit();
        return;
      }

      Object.assign(atBat, atBatData);
      cancelAtBatEdit();
    } else {
      const id = atBats.reduce(
        (maxId, atBat) => Math.max(maxId, Number(atBat.id) || 0),
        Date.now() - 1
      ) + 1;

      atBats.push({
        id,
        ...atBatData
      });
    }

    localStorage.setItem("atBats", JSON.stringify(atBats));
    loadAtBats();
  });

document.getElementById("cancelAtBatEditBtn")
  .addEventListener("click", cancelAtBatEdit);

function cancelAtBatEdit() {
  editingAtBatId = null;
  document.getElementById("result").value = "単打";
  document.getElementById("direction").value = "投手方向";
  document.getElementById("battedBallType").value = "ゴロ";
  document.getElementById("addAtBatBtn").textContent = "打席を追加";
  document.getElementById("cancelAtBatEditBtn").hidden = true;
  document.getElementById("rbi").value = "0";
}

function startAtBatEdit(atBatId) {
  const atBat = atBats.find(
    item => String(item.id) === String(atBatId)
  );

  if (!atBat) {
    return;
  }

  editingAtBatId = atBat.id;
  document.getElementById("gameSelect").value = atBat.gameId;
  document.getElementById("result").value = atBat.result;
  document.getElementById("direction").value =
    atBat.direction === "-" ? "投手方向" : atBat.direction;
  document.getElementById("battedBallType").value =
    atBat.battedBallType === "-" ? "ゴロ" : atBat.battedBallType;
  document.getElementById("rbi").value = atBat.rbi;
  document.getElementById("addAtBatBtn").textContent = "打席を更新";
  document.getElementById("cancelAtBatEditBtn").hidden = false;
  document.getElementById("result").focus();
}

function deleteAtBat(atBatId) {
  const atBat = atBats.find(
    item => String(item.id) === String(atBatId)
  );

  if (!atBat) {
    return;
  }

  const game = games.find(
    item => String(item.id) === String(atBat.gameId)
  );
  const gameName = game
    ? `${game.opponent} (${game.date})`
    : `試合ID ${atBat.gameId}`;
  const message =
    `「${gameName}」の「${atBat.result}」を削除しますか？この打席だけが削除されます。`;

  if (!window.confirm(message)) {
    return;
  }

  atBats = atBats.filter(
    item => String(item.id) !== String(atBatId)
  );

  if (String(editingAtBatId) === String(atBatId)) {
    cancelAtBatEdit();
  }

  localStorage.setItem("atBats", JSON.stringify(atBats));
  loadAtBats();
}

function renderAtBatRow(atBat) {
  const row = document.createElement("tr");
  const gameCell = row.insertCell();
  const game = games.find(
    item => String(item.id) === String(atBat.gameId)
  );
  gameCell.textContent = game
    ? `${game.opponent} (${game.date})`
    : atBat.gameId;

  [
    atBat.result,
    atBat.direction,
    atBat.battedBallType,
    atBat.rbi
  ].forEach(value => {
    row.insertCell().textContent = value;
  });

  const actionCell = row.insertCell();
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "edit-at-bat-button";
  editButton.textContent = "編集";
  editButton.addEventListener("click", () => {
    startAtBatEdit(atBat.id);
  });
  actionCell.appendChild(editButton);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-at-bat-button";
  deleteButton.textContent = "削除";
  deleteButton.addEventListener("click", () => {
    deleteAtBat(atBat.id);
  });
  actionCell.appendChild(deleteButton);

  return row;
}

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
    tbody.appendChild(renderAtBatRow(atBat));
  });

  updateStats();

}

updateGameSelect();
loadAtBats();