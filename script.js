let player = document.getElementById("player");
let doll = document.getElementById("doll");
let webcam = document.getElementById("webcam");
let result = document.getElementById("result");
let lightIndicator = document.getElementById("light-indicator");

let startBtn = document.getElementById("startBtn");
let restartBtn = document.getElementById("restartBtn");

let bgMusic = document.getElementById("bgMusic");
let winSound = document.getElementById("winSound");
let eliminatedSound = document.getElementById("eliminatedSound");
let greenSound = document.getElementById("greenSound");
let redSound = document.getElementById("redSound");

let currentLeft = 20;
let isGreenLight = true;
let playing = false;
let blinked = false;
let gameInterval;
let gameOver = false;

startBtn.onclick = () => {
  startBtn.style.display = "none";
  bgMusic.play();
  startGame();
};

restartBtn.onclick = () => location.reload();

function startGame() {
  playing = true;
  result.innerText = "";

  gameInterval = setInterval(() => {
    isGreenLight = Math.random() > 0.5;
    doll.src = isGreenLight ? "assets/doll_backk.png" : "assets/doll_frront.png";
    lightIndicator.innerText = isGreenLight ? "🟢 Green Light" : "🔴 Red Light";
    isGreenLight ? greenSound.play() : redSound.play();
  }, 2500);
}

function movePlayer() {
  if (gameOver || !playing || !blinked) return;
  if (isGreenLight) {
    currentLeft += 20;
    player.style.left = `${currentLeft}px`;

    if (currentLeft >= 800) {
      result.innerText = "🎉 You Win!";
      winSound.play();
      bgMusic.pause();
      gameOver = true;
      clearInterval(gameInterval);
      restartBtn.style.display = "inline-block";
    }
  } else {
    result.innerText = "💀 Eliminated!";
    eliminatedSound.play();
    bgMusic.pause();
    gameOver = true;
    clearInterval(gameInterval);
    restartBtn.style.display = "inline-block";
  }
  blinked = false;
}

// MediaPipe face detection
const faceMesh = new FaceMesh({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5 });
faceMesh.onResults(onResults);

const camera = new Camera(webcam, {
  onFrame: async () => await faceMesh.send({ image: webcam }),
  width: 640,
  height: 480,
});
camera.start();

function onResults(results) {
  if (!results.multiFaceLandmarks.length) return;

  const landmarks = results.multiFaceLandmarks[0];
  const left = [landmarks[159], landmarks[145]];
  const right = [landmarks[386], landmarks[374]];
  const left_dist = Math.abs(left[0].y - left[1].y);
  const right_dist = Math.abs(right[0].y - right[1].y);

  if (left_dist < 0.01 && right_dist < 0.01) {
    blinked = true;
    movePlayer();
  }
}
