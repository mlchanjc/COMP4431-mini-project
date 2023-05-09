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

// Source: https://github.com/mobyvb/midi-converter/blob/master/lib/instruments.json
const allInstruments = [
	{ hexcode: "0x00", family: "Piano", instrument: "Acoustic Grand Piano" },
	{ hexcode: "0x01", family: "Piano", instrument: "Bright Acoustic Piano" },
	{ hexcode: "0x02", family: "Piano", instrument: "Electric Grand Piano" },
	{ hexcode: "0x03", family: "Piano", instrument: "Honky-tonk Piano" },
	{ hexcode: "0x04", family: "Piano", instrument: "Electric Piano 1" },
	{ hexcode: "0x05", family: "Piano", instrument: "Electric Piano 2" },
	{ hexcode: "0x06", family: "Piano", instrument: "Harpsichord" },
	{ hexcode: "0x07", family: "Piano", instrument: "Clavichord" },
	{ hexcode: "0x08", family: "Chromatic Percussion", instrument: "Celesta" },
	{
		hexcode: "0x09",
		family: "Chromatic Percussion",
		instrument: "Glockenspiel",
	},
	{ hexcode: "0x0A", family: "Chromatic Percussion", instrument: "Music Box" },
	{ hexcode: "0x0B", family: "Chromatic Percussion", instrument: "Vibraphone" },
	{ hexcode: "0x0C", family: "Chromatic Percussion", instrument: "Marimba" },
	{ hexcode: "0x0D", family: "Chromatic Percussion", instrument: "Xylophone" },
	{
		hexcode: "0x0E",
		family: "Chromatic Percussion",
		instrument: "Tubular bells",
	},
	{ hexcode: "0x0F", family: "Chromatic Percussion", instrument: "Dulcimer" },
	{ hexcode: "0x10", family: "Organ", instrument: "Drawbar Organ" },
	{ hexcode: "0x11", family: "Organ", instrument: "Percussive Organ" },
	{ hexcode: "0x12", family: "Organ", instrument: "Rock Organ" },
	{ hexcode: "0x13", family: "Organ", instrument: "Church Organ" },
	{ hexcode: "0x14", family: "Organ", instrument: "Reed Organ" },
	{ hexcode: "0x15", family: "Organ", instrument: "Accordion" },
	{ hexcode: "0x16", family: "Organ", instrument: "Harmonica" },
	{ hexcode: "0x17", family: "Organ", instrument: "Tango Accordion" },
	{ hexcode: "0x18", family: "Guitar", instrument: "Acoustic Guitar (nylon)" },
	{ hexcode: "0x19", family: "Guitar", instrument: "Acoustic Guitar (steel)" },
	{ hexcode: "0x1A", family: "Guitar", instrument: "Electric Guitar (jazz)" },
	{ hexcode: "0x1B", family: "Guitar", instrument: "Electric Guitar (clean)" },
	{ hexcode: "0x1C", family: "Guitar", instrument: "Electric Guitar (muted)" },
	{ hexcode: "0x1D", family: "Guitar", instrument: "Overdriven Guitar" },
	{ hexcode: "0x1E", family: "Guitar", instrument: "Distortion Guitar" },
	{ hexcode: "0x1F", family: "Guitar", instrument: "Guitar harmonics" },
	{ hexcode: "0x20", family: "Bass", instrument: "Acoustic Bass" },
	{ hexcode: "0x21", family: "Bass", instrument: "Electric Bass (finger)" },
	{ hexcode: "0x22", family: "Bass", instrument: "Electric Bass (pick)" },
	{ hexcode: "0x23", family: "Bass", instrument: "Fretless Bass" },
	{ hexcode: "0x24", family: "Bass", instrument: "Slap Bass 1" },
	{ hexcode: "0x25", family: "Bass", instrument: "Slap bass 2" },
	{ hexcode: "0x26", family: "Bass", instrument: "Synth Bass 1" },
	{ hexcode: "0x27", family: "Bass", instrument: "Synth Bass 2" },
	{ hexcode: "0x28", family: "Strings", instrument: "Violin" },
	{ hexcode: "0x29", family: "Strings", instrument: "Viola" },
	{ hexcode: "0x2A", family: "Strings", instrument: "Cello" },
	{ hexcode: "0x2B", family: "Strings", instrument: "Contrabass" },
	{ hexcode: "0x2C", family: "Strings", instrument: "Tremolo Strings" },
	{ hexcode: "0x2D", family: "Strings", instrument: "Pizzicato Strings" },
	{ hexcode: "0x2E", family: "Strings", instrument: "Orchestral Harp" },
	{ hexcode: "0x2F", family: "Strings", instrument: "Timpani" },
	{ hexcode: "0x30", family: "Ensemble", instrument: "String Ensemble 1" },
	{ hexcode: "0x31", family: "Ensemble", instrument: "String Ensemble 2" },
	{ hexcode: "0x32", family: "Ensemble", instrument: "SynthStrings 1" },
	{ hexcode: "0x33", family: "Ensemble", instrument: "SynthStrings 2" },
	{ hexcode: "0x34", family: "Ensemble", instrument: "Choir Aahs" },
	{ hexcode: "0x35", family: "Ensemble", instrument: "Voice Oohs" },
	{ hexcode: "0x36", family: "Ensemble", instrument: "Synth Voice" },
	{ hexcode: "0x37", family: "Ensemble", instrument: "Orchestra Hit" },
	{ hexcode: "0x38", family: "Brass", instrument: "Trumpet" },
	{ hexcode: "0x39", family: "Brass", instrument: "Trombone" },
	{ hexcode: "0x3A", family: "Brass", instrument: "Tuba" },
	{ hexcode: "0x3B", family: "Brass", instrument: "Muted Trombone" },
	{ hexcode: "0x3C", family: "Brass", instrument: "French Horn" },
	{ hexcode: "0x3D", family: "Brass", instrument: "Brass Section" },
	{ hexcode: "0x3E", family: "Brass", instrument: "SynthBrass 1" },
	{ hexcode: "0x3F", family: "Brass", instrument: "SynthBrass 2" },
	{ hexcode: "0x40", family: "Reed", instrument: "Soprano Sax" },
	{ hexcode: "0x41", family: "Reed", instrument: "Alto Sax" },
	{ hexcode: "0x42", family: "Reed", instrument: "Tenor Sax" },
	{ hexcode: "0x43", family: "Reed", instrument: "Baritone Sax" },
	{ hexcode: "0x44", family: "Reed", instrument: "Oboe" },
	{ hexcode: "0x45", family: "Reed", instrument: "English Horn" },
	{ hexcode: "0x46", family: "Reed", instrument: "Bassoon" },
	{ hexcode: "0x47", family: "Reed", instrument: "Clarinet" },
	{ hexcode: "0x48", family: "Pipe", instrument: "Piccolo" },
	{ hexcode: "0x49", family: "Pipe", instrument: "Flute" },
	{ hexcode: "0x4A", family: "Pipe", instrument: "Recorder" },
	{ hexcode: "0x4B", family: "Pipe", instrument: "Pan Flute" },
	{ hexcode: "0x4C", family: "Pipe", instrument: "Blown Bottle" },
	{ hexcode: "0x4D", family: "Pipe", instrument: "Shakuhachi" },
	{ hexcode: "0x4E", family: "Pipe", instrument: "Whistle" },
	{ hexcode: "0x4F", family: "Pipe", instrument: "Ocarina" },
	{ hexcode: "0x50", family: "Synth Lead", instrument: "Lead 1 (square)" },
	{ hexcode: "0x51", family: "Synth Lead", instrument: "Lead 2 (sawtooth)" },
	{ hexcode: "0x52", family: "Synth Lead", instrument: "Lead 3 (calliope)" },
	{ hexcode: "0x53", family: "Synth Lead", instrument: "Lead 4 (chiff)" },
	{ hexcode: "0x54", family: "Synth Lead", instrument: "Lead 5 (charang)" },
	{ hexcode: "0x55", family: "Synth Lead", instrument: "Lead 6 (voice)" },
	{ hexcode: "0x56", family: "Synth Lead", instrument: "Lead 7 (fifths)" },
	{ hexcode: "0x57", family: "Synth Lead", instrument: "Lead 8 (bass + lead)" },
	{ hexcode: "0x58", family: "Synth Pad", instrument: "Pad 1 (new age)" },
	{ hexcode: "0x59", family: "Synth Pad", instrument: "Pad 2 (warm)" },
	{ hexcode: "0x5A", family: "Synth Pad", instrument: "Pad 3 (polysynth)" },
	{ hexcode: "0x5B", family: "Synth Pad", instrument: "Pad 4 (choir)" },
	{ hexcode: "0x5C", family: "Synth Pad", instrument: "Pad 5 (bowed)" },
	{ hexcode: "0x5D", family: "Synth Pad", instrument: "Pad 6 (metallic)" },
	{ hexcode: "0x5E", family: "Synth Pad", instrument: "Pad 7 (halo)" },
	{ hexcode: "0x5F", family: "Synth Pad", instrument: "Pad 8 (sweep)" },
	{ hexcode: "0x60", family: "Synth Effects", instrument: "FX 1 (rain)" },
	{ hexcode: "0x61", family: "Synth Effects", instrument: "FX 2 (soundtrack)" },
	{ hexcode: "0x62", family: "Synth Effects", instrument: "FX 3 (crystal)" },
	{ hexcode: "0x63", family: "Synth Effects", instrument: "FX 4 (atmosphere)" },
	{ hexcode: "0x64", family: "Synth Effects", instrument: "FX 5 (brightness)" },
	{ hexcode: "0x65", family: "Synth Effects", instrument: "FX 6 (goblins)" },
	{ hexcode: "0x66", family: "Synth Effects", instrument: "FX 7 (echoes)" },
	{ hexcode: "0x67", family: "Synth Effects", instrument: "FX 8 (sci-fi)" },
	{ hexcode: "0x68", family: "Ethnic", instrument: "Sitar" },
	{ hexcode: "0x69", family: "Ethnic", instrument: "Banjo" },
	{ hexcode: "0x6A", family: "Ethnic", instrument: "Shamisen" },
	{ hexcode: "0x6B", family: "Ethnic", instrument: "Koto" },
	{ hexcode: "0x6C", family: "Ethnic", instrument: "Kalimba" },
	{ hexcode: "0x6D", family: "Ethnic", instrument: "Bag pipe" },
	{ hexcode: "0x6E", family: "Ethnic", instrument: "Fiddle" },
	{ hexcode: "0x6F", family: "Ethnic", instrument: "Shanai" },
	{ hexcode: "0x70", family: "Percussive", instrument: "Tinkle Bell" },
	{ hexcode: "0x71", family: "Percussive", instrument: "Agogo" },
	{ hexcode: "0x72", family: "Percussive", instrument: "Steel Drums" },
	{ hexcode: "0x73", family: "Percussive", instrument: "Woodblock" },
	{ hexcode: "0x74", family: "Percussive", instrument: "Taiko Drum" },
	{ hexcode: "0x75", family: "Percussive", instrument: "Melodic Tom" },
	{ hexcode: "0x76", family: "Percussive", instrument: "Synth Drum" },
	{ hexcode: "0x77", family: "Percussive", instrument: "Reverse Cymbal" },
	{ hexcode: "0x78", family: "Sound Effects", instrument: "Guitar Fret Noise" },
	{ hexcode: "0x79", family: "Sound Effects", instrument: "Breath Noise" },
	{ hexcode: "0x7A", family: "Sound Effects", instrument: "Seashore" },
	{ hexcode: "0x7B", family: "Sound Effects", instrument: "Bird Tweet" },
	{ hexcode: "0x7C", family: "Sound Effects", instrument: "Telephone Ring" },
	{ hexcode: "0x7D", family: "Sound Effects", instrument: "Helicopter" },
	{ hexcode: "0x7E", family: "Sound Effects", instrument: "Applause" },
	{ hexcode: "0x7F", family: "Sound Effects", instrument: "Gunshot" },
];

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
