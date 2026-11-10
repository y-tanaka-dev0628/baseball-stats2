let games = [];

document.getElementById("addGameBtn").onclick = () => {

  const opponent = document.getElementById("opponent").value;
  const date = document.getElementById("date").value;
  const location = document.getElementById("location").value;

  const game = {
    id: games.length + 1,
    opponent,
    date,
    location
  };

  games.push(game);

  updateGameSelect();
};

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

  if (noDirectionResults.includes(result)) {
    direction = "-";
    battedBallType = "-";
  }

  const tbody =
    document.querySelector("#atBatTable tbody");

  const tr =
    document.createElement("tr");

  tr.innerHTML = `
    <td>${gameId}</td>
    <td>${result}</td>
    <td>${direction}</td>
    <td>${battedBallType}</td>
    <td>${rbi}</td>
    <td><button class="deleteBtn">削除</button></td>
  `;

  tr.querySelector(".deleteBtn")
    .addEventListener("click", () => {
      tr.remove();
    });

  tbody.appendChild(tr);

});