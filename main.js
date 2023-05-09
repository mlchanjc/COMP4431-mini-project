let midiFile = null; //The midi object
let recordedTrack = [];
let tickPerSec = null;
let bpm = null;
let tracks = [];
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
const VERTICAL_SCROLL_SCALING_FACTOR = 111.11111; // This is tested by experiment the step of 1 scroll in Chrome
let startingScale = 0; //The index (MIDI note number) of the first shown scale
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
let recordMode = false;
let isRecording = false;
let initTime = null;
let initRedlineTime = null;
let tobeAddedIndex = 0;

let midiBlob = null;
let midiBase64 = null;

/* Initialize literally everything here */
canvas.style.border = "1px solid #000000";
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

$("#myTable > tbody > tr:nth-child(1) > td:nth-child(2)").height(HEADER_H);
$("#myTable > tbody > tr:nth-child(3) > td:nth-child(1)").width(KEY_W);

$("#verticalScroll").height(CANVAS_H - HEADER_H);
// 21 -> 89
// 0 -> 68 (store this in startingScale)
$("#verticalScroll div").height(
	(108 - KEYS_SHOWN + 1 - 21) * VERTICAL_SCROLL_SCALING_FACTOR +
		CANVAS_H -
		HEADER_H
);
$("#verticalScroll").on("scroll", function () {
	const newStartingScale = Math.floor(
		$(this).scrollTop() / VERTICAL_SCROLL_SCALING_FACTOR
	);
	// console.log("scroll", $(this).scrollTop(), newStartingScale);
	startingScale = Number(newStartingScale);
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
	if (isMouseDown && midiFile !== null) {
		setRedlineTime(event);
	}
});

canvas.addEventListener("click", (event) => {
	if (midiFile !== null) setRedlineTime(event);
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

//Toggle recording mode by pressing spacebar
$(document).keydown((e) => {
	if (e.key == " " && midiFile !== null) {
		e.preventDefault();
		if (recordMode) {
			isRecording = false;
			recordMode = false;
			stopPlaying();
			tobeAddedIndex = recordedTrack.length;
			$("#save").css("display", recordedTrack.length > 0 ? "block" : "none");
			$("#cancel").css("display", recordedTrack.length > 0 ? "block" : "none");
		} else {
			recordMode = true;
			initTime = null;
			initRedlineTime = null;
			$("#play").css("display", "none");
		}
		renderDisplay();
	}
});

$("#save").click((event) => {
	if (window.confirm("Save changes?")) {
		recordedTrack.forEach((note) => {
			midiFile.tracks[selectedTrack - 1].addNote({
				durationTicks: Math.round(tickPerSec * (note.duration / 1000)),
				midi: note.pitch,
				noteOffVelocity: 0,
				ticks: Math.round((note.startTime / 1000) * tickPerSec),
				velocity: note.velocity,
				duration: note.duration / 1000,
				time: note.startTime / 1000,
			});
		});
		midiBlob = new Blob([midiFile.toArray()], { type: "audio/midi" });
		const reader = new FileReader();
		reader.onload = function (e) {
			midiBase64 = e.target.result;
		};
		reader.readAsDataURL(midiBlob);
		recordedTrack = [];
		tobeAddedIndex = 0;
		$("#play").css("display", "block");
		$("#save").css("display", "none");
		$("#cancel").css("display", "none");
		renderDisplay();
	}
});

$("#cancel").click((event) => {
	console.log(recordedTrack);
	recordedTrack = [];
	tobeAddedIndex = 0;
	$("#play").css("display", "block");
	$("#save").css("display", "none");
	$("#cancel").css("display", "none");
	renderDisplay();
});

// let a = performance.now();
// let authoritativeClockLast = 0;
// let MIDIlast = 0;
// let timelineLast = 0;

// setInterval(() => {
// 	const authoritativeClockCurrent = performance.now();
// 	const MIDICurrent = MIDI.Player.currentTime;
// 	const timelineCurrent = redlineTime;
// 	console.log(
// 		`Authoritative Clock: ${(authoritativeClockCurrent - a).toFixed(
// 			12
// 		)} (From last: ${(
// 			authoritativeClockCurrent - authoritativeClockLast
// 		).toFixed(12)}) \tMIDIjs playing: ${MIDICurrent.toFixed(
// 			12
// 		)} (From last: ${(MIDICurrent - MIDIlast).toFixed(
// 			12
// 		)}) \tTimeline: ${timelineCurrent} (From last: ${(
// 			timelineCurrent - timelineLast
// 		).toFixed(12)}) \tDiff (MIDIjs-timeline): ${(
// 			MIDICurrent - timelineCurrent
// 		).toFixed(12)}`
// 	);
// 	authoritativeClockLast = authoritativeClockCurrent;
// 	MIDIlast = MIDI.Player.currentTime;
// 	timelineLast = redlineTime;
// }, 2000);
