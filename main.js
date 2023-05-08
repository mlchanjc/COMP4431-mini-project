let midiFile = null; //The midi object
let tickPerSec = null;
let bpm = null;
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
let selectedTrack = 0; // 1-based
let startingTime = 0; //The starting time of the first timestamp
let unmultipliedDivisionTime = 0;
let divisionTime = 0; //The duration between each timestamp
let endingTime = divisionTime * division; //The ending time of the last timestamp
let divisionMultiplier = 16;
let reverseScale = false;
let redlineTime = 0; //The time of the redline representing
let intervalId; //For storing the id of the repeating function for displaying the redline
let isMouseDown = false;

let startRefTime = 0; // For storing the reference time for the start of the song
// Unit: performance.now() [high resolution timestamp in milliseconds]
// Used to calculate red line position

let midiBlob = null;
let midiBase64 = null;

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

const stopPlaying = () => {
	playButton.textContent = "Play";
	MIDI.Player.stop();
	MIDI.Player.clearAnimation(); // Otherwise it may continue to call the callback function
	startRefTime = 0;
	clearInterval(intervalId);
	intervalId = null;
};

playButton.addEventListener("click", () => {
	if (intervalId) {
		stopPlaying();
	} else {
		// FIXME: Playback should continue at red line instead of at start
		MIDI.Player.BPM = null;

		MIDI.Player.loadFile(midiBase64, () => {
			console.log("success");

			MIDI.Player.setAnimation(({ now, end, events }) => {
				// console.log(
				// 	`now: ${now * 1000}, diff: ${
				// 		now * 1000 - redlineTime
				// 	} end: ${end}, events: ${JSON.stringify(events)}`
				// );
				if (now === 0) {
					// console.log("SKIPPED updating startRefTime");
					return;
				}
				redlineTime = now * 1000;
				startRefTime = performance.now() - now * 1000;
			});

			MIDI.Player.currentTime = redlineTime;
			MIDI.Player.start();
			startRefTime = performance.now() - redlineTime;
			playButton.textContent = "Stop";
			intervalId = setInterval(() => {
				if (redlineTime <= Math.floor(midiFile.duration * 1000)) {
					redlineTime = performance.now() - startRefTime;
					if (redlineTime > endingTime) {
						startingTime = endingTime + 1;
						endingTime = divisionTime * division + startingTime;
					}
					renderDisplay();
				} else stopPlaying();
			}, Math.round(1000 / FPS));
		});
	}
});

filedrop.addEventListener("change", (e) => {
	const files = e.target.files;
	if (files.length > 0) {
		const file = files[0];
		// Cross ref .load-demo-midi-file-btn onClick callback
		document.querySelector("#FileDrop #Text").textContent = file.name;
		parseFile(file);
	}
});

//Set redline position by clicking the canvas
canvas.addEventListener("mousemove", (event) => {
	if (isMouseDown) {
		setRedlineTime(event);
	}
});

canvas.addEventListener("click", (event) => {
	setRedlineTime(event);
});

const setRedlineTime = (event) => {
	stopPlaying();
	const rect = canvas.getBoundingClientRect();
	const x = event.clientX - rect.left - window.scrollX;
	if (x > KEY_W) {
		redlineTime =
			startingTime +
			((x - KEY_W) / (CANVAS_W - KEY_W)) * (endingTime - startingTime);
	} else {
		redlineTime = startingTime;
	}
	if (redlineTime > Math.ceil(midiFile.duration * 1000)) {
		redlineTime = Math.ceil(midiFile.duration * 1000);
	}
	renderDisplay();
};

canvas.addEventListener("mousedown", (event) => {
	if (event.button === 0) isMouseDown = true;
});

canvas.addEventListener("mouseup", (event) => {
	if (event.button === 0) isMouseDown = false;
});
