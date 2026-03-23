let questions = [];
let current = 0;
let score = 0;
let results = [];

let quizStartTime;
let quizEndTime;
let maxScore = 0;

let timeLeft = 10;
let timerInterval;
let playerName = "";


// загрузка вопросов
fetch("../jsonfiles/quiz.json")
  .then(res => res.json())
  .then(data => {
    questions = data.sort(() => Math.random() - 0.5);

    // считаем максимальный возможный результат
    questions.forEach(q => {
      q.points = q.points ?? 1;  // защита если забыли points
      maxScore += q.points;
    });

    showNameScreen();   // ← теперь на правильном месте
  });






function startTimer(correctAnswer) {
  clearInterval(timerInterval);
  timeLeft = 10;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timeIsUp(correctAnswer);
    }
  }, 1000);
}

function updateTimerDisplay() {
  document.getElementById("score").textContent =
    `Score: ${score} | Time: ${timeLeft}s`;
}

function showQuestion() {

  // ФИНАЛЬНЫЙ ЭКРАН
  if (current >= questions.length) {

    quizEndTime = Date.now();

    const totalSeconds = Math.floor((quizEndTime - quizStartTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeText = `${minutes}m ${seconds}s`;

    const emoji = getEmoji(score, maxScore);
    const reward = getReward(score, maxScore);
    const certificate = getCertificateText(score, maxScore, timeText);
    const review = buildResultsTable();

    document.getElementById("quiz").innerHTML = `
      <h1>${emoji}</h1>
      <h2>Final score: ${score} / ${maxScore}</h2>
      <h3>Questions answered: ${questions.length}</h3>
      <h3>Total time: ${timeText}</h3>

      <h2>You earned: ${reward.icon}</h2>
      <h3>${reward.text}</h3>

      <hr>

      <pre style="font-size:18px">${certificate}</pre>
      ${review}

      <button onclick="restartQuiz()">Restart quiz</button>
    `;
    return;
  }

  const q = questions[current];

  document.getElementById("question").textContent =
    `Question ${current + 1} / ${questions.length}: ${q.question}`;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  q.options.sort(() => Math.random() - 0.5);

  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.onclick = () => checkAnswer(btn, option, q.answer);
    answersDiv.appendChild(btn);
  });

  startTimer(q.answer);
}

function checkAnswer(button, chosen, correct) {

  results.push({
    question: questions[current].question,
    chosen: chosen,
    correct: correct,
    isRight: chosen === correct
  });

  clearInterval(timerInterval);

  const buttons = document.querySelectorAll("button");
  buttons.forEach(b => b.disabled = true);

  let message = "";

  if (chosen === correct) {
    button.style.background = "lightgreen";
    score += questions[current].points;
    message = "Great! 🎉";
  } else {
    button.style.background = "salmon";
    message = "Try again 🙂";
  }

  showCorrectAnswer(correct, message);
}

function timeIsUp(correct) {

  results.push({
    question: questions[current].question,
    chosen: "No answer",
    correct: correct,
    isRight: false
  });

  const buttons = document.querySelectorAll("button");
  buttons.forEach(b => b.disabled = true);

  showCorrectAnswer(correct, "Time is up ⏰");
}

function showCorrectAnswer(correct, message) {

  const buttons = document.querySelectorAll("button");

  buttons.forEach(b => {
    if (b.textContent === correct) {
      b.style.background = "lightgreen";
    }
  });

  const msg = document.createElement("p");
  msg.textContent = message + " Correct answer: " + correct;
  document.getElementById("answers").appendChild(msg);

  current++;
  setTimeout(showQuestion, 1500);
}

function restartQuiz() {
  location.reload();
}

function getEmoji(score, maxScore) {
  const percent = score / maxScore;

  if (percent === 1) return "🏆🤩";
  if (percent >= 0.8) return "😄👏";
  if (percent >= 0.6) return "🙂👍";
  if (percent >= 0.4) return "😐";
  return "😢";
}

function getReward(score, maxScore) {
  const percent = score / maxScore;

  if (percent === 1)
    return { text: "Golden Candy 🍬🍬🍬", icon: "🍬🍬🍬" };

  if (percent >= 0.8)
    return { text: "Magic Berries 🍓🍓", icon: "🍓🍓" };

  if (percent >= 0.6)
    return { text: "Red Apple 🍎", icon: "🍎" };

  if (percent >= 0.4)
    return { text: "Forest Nuts 🌰", icon: "🌰" };

  return { text: "Keep learning 🌱", icon: "🌱" };
}

function getCertificateText(score, maxScore, timeText) {

  const today = new Date().toLocaleDateString();

  return `
This certifies that

⭐ ${playerName} ⭐

has successfully completed the knowledge quest!

Score: ${score} / ${maxScore}
Time: ${timeText}
Date: ${today}

Keep learning and exploring!
`;
}


function buildResultsTable() {

  let html = "<h2>Quiz review</h2>";

  results.forEach(r => {
    const icon = r.isRight ? "✅" : "❌";

    html += `
      <p>
        ${icon} <b>${r.question}</b><br>
        Your answer: ${r.chosen}<br>
        Correct: ${r.correct}
      </p>
      <hr>
    `;
  });

  return html;
}

function showNameScreen() {

  document.getElementById("quiz").innerHTML = `
    <h2>What is your name?</h2>
    <input id="nameInput" placeholder="Enter your name">
    <br><br>
    <button onclick="startQuiz()">Start quiz</button>
  `;
}

function startQuiz() {

  const input = document.getElementById("nameInput").value.trim();

  if (input === "") {
    alert("Please enter your name 😊");
    return;
  }

  playerName = input;

  // 🔴 ВОССТАНАВЛИВАЕМ HTML КВИЗА
  document.getElementById("quiz").innerHTML = `
    <h2 id="question"></h2>
    <div id="answers"></div>
    <p id="score"></p>
  `;

  quizStartTime = Date.now();
  showQuestion();
}