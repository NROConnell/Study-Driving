let currentLane = 1;
let car = document.getElementById("car");
let road = document.querySelector(".road");
let scoreDisplay = document.getElementById("score");
let barriersContainer = document.getElementById("barriers");
let leaderboardList = document.getElementById("leaderboard-list");

let score = 0;
let scoreInterval = null;
let barrierInterval = null;
let currentAnswer = 1;
let questionLoaded = false;

function changeLane(lane) {
  currentLane = lane;
  const laneWidth = road.clientWidth / 3;
  car.style.left = `${laneWidth * lane + laneWidth / 2 - car.clientWidth / 2}px`;
}

function startGame() {
  if (!road.classList.contains("animate")) {
    road.classList.add("animate");
    scoreInterval = setInterval(() => {
      score++;
      scoreDisplay.textContent = score;
    }, 1000);
    barrierInterval = setInterval(spawnBarrier, 6000);
  }
}

function restartGame() {
  saveScoreToLeaderboard();
  road.classList.remove("animate");
  clearInterval(scoreInterval);
  clearInterval(barrierInterval);
  score = 0;
  scoreDisplay.textContent = score;
  currentLane = 1;
  changeLane(currentLane);
  barriersContainer.innerHTML = "";
  renderRandomQuestionFromJSON();
}

function spawnBarrier() {
  const laneWidth = road.clientWidth / 3;
  questionLoaded = false;

  for (let lane = 0; lane < 3; lane++) {
    const barrier = document.createElement("div");
    barrier.classList.add("barrier");

    const barrierNumber = lane + 1;

    // Set image based on lane number
    barrier.style.backgroundImage = `url('images/${barrierNumber}barrior.png')`;
    barrier.style.backgroundSize = "cover";
    barrier.style.backgroundRepeat = "no-repeat";
    barrier.style.backgroundPosition = "center";

    // Mark correct answer
    if (barrierNumber === currentAnswer) {
      barrier.dataset.safe = "true";
    } else {
      barrier.dataset.safe = "false";
    }

    barrier.style.left = `${laneWidth * lane + laneWidth / 2 - 30}px`;
    barrier.style.top = `-60px`;
    barriersContainer.appendChild(barrier);

    let position = -60;
    const move = setInterval(() => {
      position += 5;
      barrier.style.top = `${position}px`;

      const carRect = car.getBoundingClientRect();
      const barrierRect = barrier.getBoundingClientRect();

      const isTouchingCar =
        barrierRect.bottom >= carRect.top &&
        barrierRect.top <= carRect.bottom &&
        barrierRect.left < carRect.right &&
        barrierRect.right > carRect.left;

      if (isTouchingCar) {
        if (barrier.dataset.safe === "false") {
          clearInterval(move);
          restartGame();
        } else if (barrier.dataset.safe === "true" && !questionLoaded) {
          questionLoaded = true;
          renderRandomQuestionFromJSON();
        }
      }

      if (position > road.clientHeight) {
        clearInterval(move);
        barrier.remove();
      }
    }, 50);
  }
}

function saveScoreToLeaderboard() {
  if (score === 0) return;
  const now = new Date();
  const entry = {
    time: now.toLocaleString(),
    score: score
  };

  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push(entry);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  renderLeaderboard();
}

function renderLeaderboard() {
  leaderboardList.innerHTML = "";
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.sort((a, b) => b.score - a.score);

  leaderboard.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = `#${index + 1} — ${entry.time} — ${entry.score} sec`;
    leaderboardList.appendChild(li);
  });
}

function resetLeaderboard() {
  localStorage.removeItem("leaderboard");
  renderLeaderboard();
}

function renderRandomQuestionFromJSON() {
  fetch("questions.json")
    .then(response => response.json())
    .then(quiz => {
      const questionBox = document.getElementById("question-text");
      const optionsBox = document.getElementById("question-options");

      const randomIndex = Math.floor(Math.random() * quiz.length);
      const q = quiz[randomIndex];

      currentAnswer = q.answer;

      questionBox.textContent = q.question;
      optionsBox.innerHTML = "";

      q.options.forEach(option => {
        const li = document.createElement("li");
        li.textContent = option;
        optionsBox.appendChild(li);
      });
    })
    .catch(error => {
      console.error("Failed to load questions.json:", error);
    });
}

// Initialize on page load
renderLeaderboard();
renderRandomQuestionFromJSON();
