document.addEventListener("DOMContentLoaded", function() {
  const startScreen = document.getElementById("start-screen");
  const gameScreen = document.getElementById("game-screen");
  const resultScreen = document.getElementById("result-screen");
  const gameOverScreen = document.getElementById("game-over-screen");

  const playerNameInput = document.getElementById("player-name");
  const startButton = document.getElementById("start-button");

  const displayName = document.getElementById("display-name");
  const timer = document.getElementById("timer");
  const battery = document.getElementById("battery");

  const gameCanvas = document.getElementById("game-canvas");
  const ctx = gameCanvas.getContext("2d");

  let playerName = "";
  let timeElapsed = 0;
  let batteryLevel = 50;
  let gameInterval;
  
  // Initial quadcopter position
  let quadcopterY = gameCanvas.height / 2;
  const quadcopterHeight = 30; // Height of quadcopter
  const quadcopterWidth = 30;  // Width of quadcopter

  const walls = [];
  const batteries = [];

  playerNameInput.addEventListener("input", function() {
    startButton.disabled = !playerNameInput.value.trim();
  });

  startButton.addEventListener("click", function() {
    playerName = playerNameInput.value.trim();
    displayName.textContent = playerName;
    startGame();
  });

  document.addEventListener("keydown", function(event) {
    console.log("Key down event:", event.key); // For debugging
    if (event.key === "w" || event.key === "ArrowUp") {
      quadcopterY = Math.max(0, quadcopterY - 10);
      console.log("Move up, new Y:", quadcopterY); // For debugging
    } else if (event.key === "s" || event.key === "ArrowDown") {
      quadcopterY = Math.min(gameCanvas.height - quadcopterHeight, quadcopterY + 10);
      console.log("Move down, new Y:", quadcopterY); // For debugging
    } else if (event.key === "Escape") {
      if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
      } else {
        gameInterval = setInterval(gameLoop, 1000 / 60);
      }
    }
  });

  function startGame() {
    startScreen.style.display = "none";
    gameScreen.style.display = "flex";
    timeElapsed = 0;
    batteryLevel = 50;
    timer.textContent = "00:00";
    battery.textContent = "50%";

    gameInterval = setInterval(gameLoop, 1000 / 60);
  }

  function gameLoop() {
    timeElapsed++;
    batteryLevel -= 1 / 60;

    if (batteryLevel <= 0) {
      endGame();
    }

    updateDisplay();
    drawGame();
  }

  function updateDisplay() {
    let minutes = Math.floor(timeElapsed / 60);
    let seconds = timeElapsed % 60;
    timer.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    battery.textContent = `${Math.max(0, Math.floor(batteryLevel))}%`;
  }

  function drawGame() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    drawQuadcopter();
    drawWalls();
    drawBatteries();
    checkBatteryCollection();
  }
  

  function drawQuadcopter() {
    ctx.fillStyle = "blue";
    ctx.fillRect(0, quadcopterY, quadcopterWidth, quadcopterHeight);
  }

  function createWall() {
    const height = Math.floor(Math.random() * 400) + 100;
    const wall = {
      x: gameCanvas.width,
      y: Math.random() < 0.5 ? 0 : gameCanvas.height - height,
      width: 50,
      height: height
    };
    walls.push(wall);
  }

  function createBattery() {
    const battery = {
      x: gameCanvas.width,
      y: Math.floor(Math.random() * (gameCanvas.height - 50)),
      width: 30,
      height: 30
    };
    batteries.push(battery);
  }

  function drawWalls() {
    ctx.fillStyle = "brown";
    walls.forEach(wall => {
      ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
      wall.x -= 2;
    });
  }

  function drawBatteries() {
    ctx.fillStyle = "yellow";
    batteries.forEach(battery => {
      ctx.fillRect(battery.x, battery.y, battery.width, battery.height);
      battery.x -= 2;
    });
  }

  function checkBatteryCollection() {
    batteries.forEach((battery, index) => {
      if (0 < battery.x && battery.x < quadcopterWidth && 
          quadcopterY < battery.y + battery.height && quadcopterY + quadcopterHeight > battery.y) {
        batteries.splice(index, 1); // Удаляем батарейку из массива
        batteryLevel = Math.min(100, batteryLevel + 5); // Увеличиваем заряд батареи до 100%
        // Анимация подзарядки
        console.log("Battery collected!"); // Для отладки
      }
    });
  }
  

  function endGame() {
    clearInterval(gameInterval);
    gameScreen.style.display = "none";
    resultScreen.style.display = "flex";
    document.getElementById("result-name").textContent = playerName;
    document.getElementById("result-time").textContent = timer.textContent;
  }

  document.getElementById("restart-button").addEventListener("click", function() {
    resultScreen.style.display = "none";
    startGame();
  });

  document.getElementById("game-over-restart").addEventListener("click", function() {
    gameOverScreen.style.display = "none";
    startGame();
  });

  setInterval(() => {
    createWall();
    if (Math.random() < 0.5) {
      createBattery();
    }
  }, 2000); // Create new obstacles and batteries every 2 seconds
});
