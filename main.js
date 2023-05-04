let midiFile = null; //The midi object
let tickPerSec = null;
let bpm = null;
let currentMidi = null; //For tone js
let tracks = [];
const scaleSlider = document.getElementById("scale-slider");
const maxScale = document.getElementById("max-scale");
const timeSlider = document.getElementById("time-slider");
const maxTime = document.getElementById("max-time");
const multiplierSlider = document.getElementById("multiplier-slider");
const reverseScaleButton = document.getElementById("reverse-scale");
const playButton = document.getElementById("play");
const filedrop = document.querySelector("#FileDrop input");
const listContainer = document.querySelector(".list-container");
const list = document.querySelector(".list");
const emptyMessage = document.querySelector(".empty-message");
const CANVAS_H = 500;
const CANVAS_W = 1400;
const HEADER_H = 60; //Height of the header
const KEY_W = CANVAS_W / 15;
const KEYS_SHOWN = 20; //Max number of keys shown in the canvas at once
const TRACK_H = (CANVAS_H - HEADER_H) / KEYS_SHOWN; //Height of each key
const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
const FPS = 60; //FPS for the canvas display(mainly the red line)
let startingScale = 0; //The index of the first shown scale
let division = 6; //Number of timestamps
let selectedTrack = 0;
let startingTime = 0; //The starting time of the first timestamp
let unmultipliedDivisionTime = 0;
let divisionTime = 0; //The duration between each timestamp
let endingTime = divisionTime * division; //The ending time of the last timestamp
let divisionMultiplier = 16;
let reverseScale = false;
let redlineTime = 0; //The time of the redline representing
let intervalId; //For storing the id of the repeating function for displaying the redline
let isMouseDown = false;

/* Initialize literally everything here */
canvas.style.border = "1px solid #000000";
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

scaleSlider.max = 108 - KEYS_SHOWN + 1;
maxScale.textContent = String(108 - KEYS_SHOWN + 1);
scaleSlider.addEventListener("input", (event) => {
	startingScale = Number(event.target.value - 21);
	renderDisplay();
});

multiplierSlider.addEventListener("input", (event) => {
	divisionMultiplier = Number(event.target.value);
	divisionTime = unmultipliedDivisionTime * divisionMultiplier;
	endingTime = divisionTime * division + startingTime;
	renderDisplay();
});

reverseScaleButton.addEventListener("click", () => {
	reverseScale = !reverseScale;
	renderDisplay();
});

playButton.addEventListener("click", () => {
	if (intervalId) {
		playButton.textContent = "Play";
		clearInterval(intervalId);
		intervalId = null;
	} else {
		playButton.textContent = "Stop";
		if (redlineTime < startingTime) redlineTime = startingTime;
		intervalId = setInterval(() => {
			redlineTime += Math.round(1000 / FPS);
			if (redlineTime > endingTime) {
				startingTime = endingTime + 1;
				endingTime = divisionTime * division + startingTime;
			}
			renderDisplay();
		}, Math.round(1000 / FPS));
	}
});

filedrop.addEventListener("change", (e) => {
	const files = e.target.files;
	if (files.length > 0) {
		const file = files[0];
		document.querySelector("#FileDrop #Text").textContent = file.name;
		parseFile(file);
	}
});

//Set redline position by clicking the canvas
canvas.addEventListener("mousemove", (event) => {
	if (isMouseDown) {
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left - window.scrollX;
		const y = event.clientY - rect.top - window.scrollY;
		if (x > KEY_W) {
			redlineTime = startingTime + ((x - KEY_W) / (CANVAS_W - KEY_W)) * (endingTime - startingTime);
			renderDisplay();
		} else {
			redlineTime = startingTime;
			renderDisplay();
		}
	}
});

canvas.addEventListener("mousedown", (event) => {
	if (event.button === 0) isMouseDown = true;
});

canvas.addEventListener("mouseup", (event) => {
	if (event.button === 0) isMouseDown = false;
});