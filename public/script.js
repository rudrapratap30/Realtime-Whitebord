const socket = io();
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let currentColor = "#000";
let penType = "normal";
let textMode = false;

const colorPicker = document.getElementById("colorPicker");
const penSelect = document.getElementById("penType");
const textBtn = document.getElementById("textBtn");
const resetBtn = document.getElementById("resetBtn");

colorPicker.addEventListener("change", (e) => currentColor = e.target.value);
penSelect.addEventListener("change", (e) => penType = e.target.value);
textBtn.addEventListener("click", () => textMode = !textMode);

// Reset button click event
resetBtn.addEventListener("click", () => {
  socket.emit("reset_board");
  clearCanvas();
});

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function startDraw(e) {
  if (textMode) {
    const text = prompt("Enter your text:");
    if (text) {
      ctx.fillStyle = currentColor;
      ctx.font = "20px Arial";
      ctx.fillText(text, e.clientX, e.clientY);
      socket.emit("text_add", { x: e.clientX, y: e.clientY, text, color: currentColor });
    }
  } else {
    drawing = true;
    draw(e);
  }
}

function endDraw() {
  drawing = false;
  ctx.beginPath();
}

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = penType === "brush" ? 5 : penType === "highlighter" ? 15 : 2;
  ctx.strokeStyle = penType === "highlighter" ? `${currentColor}55` : currentColor;
  ctx.lineCap = "round";

  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY);

  socket.emit("draw", { x: e.clientX, y: e.clientY, color: currentColor, penType });
}

// Receive strokes from other users
socket.on("draw", (data) => {
  ctx.lineWidth = data.penType === "brush" ? 5 : data.penType === "highlighter" ? 15 : 2;
  ctx.strokeStyle = data.penType === "highlighter" ? `${data.color}55` : data.color;
  ctx.lineCap = "round";

  ctx.lineTo(data.x, data.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(data.x, data.y);
});

// Receive text from others
socket.on("text_add", (data) => {
  ctx.fillStyle = data.color;
  ctx.font = "20px Arial";
  ctx.fillText(data.text, data.x, data.y);
});

// Initialize with previous strokes
socket.on("init", (dataArray) => {
  dataArray.forEach(data => {
    if (data.text) {
      ctx.fillStyle = data.color;
      ctx.font = "20px Arial";
      ctx.fillText(data.text, data.x, data.y);
    } else {
      ctx.lineWidth = data.penType === "brush" ? 5 : data.penType === "highlighter" ? 15 : 2;
      ctx.strokeStyle = data.penType === "highlighter" ? `${data.color}55` : data.color;
      ctx.lineCap = "round";
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    }
  });
});

// Clear canvas when reset event received
socket.on("reset_board", () => {
  clearCanvas();
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("mousemove", draw);
