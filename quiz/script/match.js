let pairs = [];
let shuffledLeft = [];
let shuffledRight = [];

let selectedLeft = null;
let selectedRight = null;
let selectedLeftBtn = null;
let selectedRightBtn = null;
let solvedLeft = [];
let solvedRight = [];

let matches = 0;
let results = [];

let startTime;
let endTime;
let playerName = "";




// загрузка данных
fetch("../jsonfiles/match.json")
  .then(res => res.json())
  .then(data => {
    pairs = data;
    showNameScreen();
  });

function showNameScreen() {
  document.getElementById("quiz").innerHTML = `
    <h2>What is your name?</h2>
    <input id="nameInput" placeholder="Enter your name">
    <br><br>
    <button onclick="startGame()">Start matching</button>
  `;
}

function startGame() {
  const input = document.getElementById("nameInput").value.trim();
  if (input === "") return alert("Enter name 😊");

  playerName = input;
  startTime = Date.now();

  shuffledLeft = [...pairs].sort(() => Math.random() - 0.5);
  shuffledRight = [...pairs].sort(() => Math.random() - 0.5);

  drawBoard();
}

function drawBoard() {

  let leftHTML = "";
  let rightHTML = "";

  shuffledLeft.forEach(p => {
    const solved = solvedLeft.includes(p.left);
    const color = solved ? "lightgreen" : "";
    const disabled = solved ? "disabled" : "";

    leftHTML += `
      <button style="background:${color}" ${disabled}
      onclick="selectLeft('${p.left}')">${p.left}</button><br>`;
  });

  shuffledRight.forEach(p => {
    const solved = solvedRight.includes(p.right);
    const color = solved ? "lightgreen" : "";
    const disabled = solved ? "disabled" : "";

    rightHTML += `
      <button style="background:${color}" ${disabled}
      onclick="selectRight('${p.right}')">${p.right}</button><br>`;
  });

  document.getElementById("quiz").innerHTML = `
    <h2>Match the pairs</h2>
    <p id="timer"></p>
    <div style="display:flex; gap:40px">
      <div>${leftHTML}</div>
      <div>${rightHTML}</div>
    </div>
  `;
}





function updateTimer() {
  const sec = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("timer").textContent = "Time: " + sec + "s";
}





function selectLeft(word) {

  selectedLeft = word;

  if (selectedLeftBtn) selectedLeftBtn.style.background = "";

  const buttons = document.querySelectorAll("button");
  buttons.forEach(btn => {
    if (btn.textContent === word && !btn.disabled) {
      selectedLeftBtn = btn;
      btn.style.background = "khaki";
    }
  });

  checkMatch();
}




function selectRight(word) {

  selectedRight = word;

  if (selectedRightBtn) selectedRightBtn.style.background = "";

  const buttons = document.querySelectorAll("button");
  buttons.forEach(btn => {
    if (btn.textContent === word && !btn.disabled) {
      selectedRightBtn = btn;
      btn.style.background = "khaki";
    }
  });

  checkMatch();
}





function checkMatch() {
  if (!selectedLeft || !selectedRight) return;

  const pair = pairs.find(p => p.left === selectedLeft);

  if (pair.right === selectedRight) {

    // правильная пара
    matches++;

    solvedLeft.push(selectedLeft);
    solvedRight.push(selectedRight);

    selectedLeftBtn.style.background = "lightgreen";
    selectedRightBtn.style.background = "lightgreen";

    selectedLeftBtn.disabled = true;
    selectedRightBtn.disabled = true;

    results.push(`✅ ${selectedLeft} = ${selectedRight}`);

    resetSelection();

  } else {

    // неправильная пара
    selectedLeftBtn.style.background = "salmon";
    selectedRightBtn.style.background = "salmon";

    results.push(`❌ ${selectedLeft} ≠ ${selectedRight} (correct: ${pair.right})`);

    setTimeout(() => {
      selectedLeftBtn.style.background = "";
      selectedRightBtn.style.background = "";
      resetSelection();
    }, 700);
  }

  if (matches === pairs.length) finishGame();
}







function finishGame() {
  endTime = Date.now();
  const time = Math.floor((endTime - startTime)/1000);

  let review = "<h3>Results</h3>";
  results.forEach(r => review += `<p>${r}</p>`);

  document.getElementById("quiz").innerHTML = `
    <h1>Great job ${playerName}!</h1>
    <h2>Total time: ${time}s</h2>
    ${review}
    <button onclick="location.reload()">Restart</button>
  `;
}

function flashWrong() {
  const body = document.body;
  body.style.background = "#ffdddd";

  setTimeout(() => {
    body.style.background = "";
  }, 300);
}


function resetSelection() {
  selectedLeft = null;
  selectedRight = null;
  selectedLeftBtn = null;
  selectedRightBtn = null;
}