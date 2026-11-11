
console.log("app.js読み込み成功");

let games =
  JSON.parse(
    localStorage.getItem("games")
  ) || [];

  let atBats =
  JSON.parse(
    localStorage.getItem("atBats")
  ) || [];


document.getElementById("addGameBtn")
  .addEventListener("click", () => {

    console.log("試合追加クリック");

    const opponent =
      document.getElementById("opponent").value;


    const date =
      document.getElementById("date").value;

    const location =
      document.getElementById("location").value;

    const game = {
      id: games.length + 1,
      opponent,
      date,
      location
    };

    games.push(game);

localStorage.setItem(
  "games",
  JSON.stringify(games)
);

updateGameSelect();

  });

function updateGameSelect() {

  const select =
    document.getElementById("gameSelect");

  select.innerHTML = "";

  games.forEach(game => {

    const option =
      document.createElement("option");

    option.value = game.id;

    option.textContent =
      `${game.opponent} (${game.date})`;

    select.appendChild(option);

  });

}

document
  .getElementById("addAtBatBtn")
  .addEventListener("click", () => {

    const gameId =
      document.getElementById("gameSelect").value;

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

  let atBatsCount = 0;
  let hits = 0;
  let totalBases = 0;
  let walks = 0;
  let hitByPitch = 0;

  const rows =
    document.querySelectorAll(
      "#atBatTable tbody tr"
    );

  rows.forEach(row => {

    const result =
      row.cells[1].textContent;

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
      ? ".000"
      : (hits / atBatsCount).toFixed(3);

  const slg =
    atBatsCount === 0
      ? ".000"
      : (totalBases / atBatsCount).toFixed(3);

  const obp =
    (atBatsCount + walks + hitByPitch) === 0
      ? ".000"
      : (
          (hits + walks + hitByPitch)
          / (atBatsCount + walks + hitByPitch)
        ).toFixed(3);

  document.getElementById("ab").textContent =
    atBatsCount;

  document.getElementById("hits").textContent =
    hits;

  document.getElementById("avg").textContent =
    avg;

  document.getElementById("slg").textContent =
    slg;

  document.getElementById("obp").textContent =
    obp;

}

function loadAtBats() {

  const tbody =
    document.querySelector(
      "#atBatTable tbody"
    );

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