
console.log("app.js読み込み成功");let games = [];

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

        updateStats();

      });

    tbody.appendChild(tr);

    updateStats();

  });

function updateStats() {

  let atBatsCount = 0;
  let hits = 0;

  const rows =
    document.querySelectorAll(
      "#atBatTable tbody tr"
    );

  rows.forEach(row => {

    const result =
      row.cells[1].textContent;

    if (
      result === "単打" ||
      result === "二塁打" ||
      result === "三塁打" ||
      result === "本塁打"
    ) {

      hits++;
      atBatsCount++;

    }

    else if (
      result === "ゴロ" ||
      result === "フライ" ||
      result === "三振"
    ) {

      atBatsCount++;

    }

  });

  const avg =
    atBatsCount === 0
      ? ".000"
      : (hits / atBatsCount).toFixed(3);

  document.getElementById("ab").textContent =
    atBatsCount;

  document.getElementById("hits").textContent =
    hits;

  document.getElementById("avg").textContent =
    avg;

}