// The last played key number
let last_mouse_key_number = -1;

// Map the key with the key number
let key_mapping = {
	// White keys of the first octave
	z: 0,
	x: 2,
	c: 4,
	v: 5,
	b: 7,
	n: 9,
	m: 11,
	// Black keys of the first octave
	s: 1,
	d: 3,
	g: 6,
	h: 8,
	j: 10,
	// White keys of the second octave
	w: 12,
	e: 14,
	r: 16,
	t: 17,
	y: 19,
	u: 21,
	i: 23,
	// Black keys of the second octave
	3: 13,
	4: 15,
	6: 18,
	7: 20,
	8: 22,
};

// Signal the key is down
let key_down_status = new Array(23);

function handleNoteOn(key_number) {
	MIDI.programChange(0, Number($("#instrument option:selected").val()));
	if ($(":radio[name=play-mode]:checked").val() === "single") {
		let pitch = parseInt($("#pitch").val()) + key_number;
		let amplitude = parseInt($("#amplitude").val());
		if (pitch <= 108 && pitch >= 21) MIDI.noteOn(0, pitch, amplitude);
	} else if ($(":radio[name=play-mode]:checked").val() === "major") {
		let amplitude = parseInt($("#amplitude").val());
		let pitch1 = parseInt($("#pitch").val()) + key_number;
		let pitch2 = parseInt($("#pitch").val()) + key_number + 4;
		let pitch3 = parseInt($("#pitch").val()) + key_number + 7;
		if (pitch1 <= 108 && pitch1 >= 21) MIDI.noteOn(0, pitch1, amplitude);
		if (pitch2 <= 108 && pitch2 >= 21) MIDI.noteOn(0, pitch2, amplitude);
		if (pitch3 <= 108 && pitch3 >= 21) MIDI.noteOn(0, pitch3, amplitude);
	} else if ($(":radio[name=play-mode]:checked").val() === "minor") {
		let amplitude = parseInt($("#amplitude").val());
		let pitch1 = parseInt($("#pitch").val()) + key_number;
		let pitch2 = parseInt($("#pitch").val()) + key_number + 3;
		let pitch3 = parseInt($("#pitch").val()) + key_number + 7;
		if (pitch1 <= 108 && pitch1 >= 21) MIDI.noteOn(0, pitch1, amplitude);
		if (pitch2 <= 108 && pitch2 >= 21) MIDI.noteOn(0, pitch2, amplitude);
		if (pitch3 <= 108 && pitch3 >= 21) MIDI.noteOn(0, pitch3, amplitude);
	}
}

function handleNoteOff(key_number) {
	if ($(":radio[name=play-mode]:checked").val() === "single") {
		let pitch = parseInt($("#pitch").val()) + key_number;
		if (pitch <= 108 && pitch >= 21) MIDI.noteOff(0, pitch);
	} else if ($(":radio[name=play-mode]:checked").val() === "major") {
		let pitch1 = parseInt($("#pitch").val()) + key_number;
		let pitch2 = parseInt($("#pitch").val()) + key_number + 4;
		let pitch3 = parseInt($("#pitch").val()) + key_number + 7;
		if (pitch1 <= 108 && pitch1 >= 21) MIDI.noteOff(0, pitch1);
		if (pitch2 <= 108 && pitch2 >= 21) MIDI.noteOff(0, pitch2);
		if (pitch3 <= 108 && pitch3 >= 21) MIDI.noteOff(0, pitch3);
	} else if ($(":radio[name=play-mode]:checked").val() === "minor") {
		let pitch1 = parseInt($("#pitch").val()) + key_number;
		let pitch2 = parseInt($("#pitch").val()) + key_number + 3;
		let pitch3 = parseInt($("#pitch").val()) + key_number + 7;
		if (pitch1 <= 108 && pitch1 >= 21) MIDI.noteOff(0, pitch1);
		if (pitch2 <= 108 && pitch2 >= 21) MIDI.noteOff(0, pitch2);
		if (pitch3 <= 108 && pitch3 >= 21) MIDI.noteOff(0, pitch3);
	}
}

function handlePianoMouseDown(evt) {
	// Determine which piano key has been clicked on
	// evt.target tells us which item triggered this function
	// The piano key number is extracted from the key id (0-23)
	let key_number = $(evt.target).attr("id").substring(4);
	key_number = parseInt(key_number);

	// Start the note
	handleNoteOn(key_number);

	// Select the key
	$("#key-" + key_number).focus();

	// Show a simple message in the console
	console.log("Piano mouse down event for key " + key_number + "!");

	// Remember the key number
	last_mouse_key_number = key_number;
}

function handlePianoMouseUp(evt) {
	// last_key_number is used because evt.target does not necessarily
	// equal to the key that has been clicked on
	if (last_mouse_key_number < 0) return;

	// Stop the note
	handleNoteOff(last_mouse_key_number);

	// De-select the key
	$("#key-" + last_mouse_key_number).blur();

	// Show a simple message in the console
	console.log("Piano mouse up event for key " + last_mouse_key_number + "!");

	// Reset the key number
	last_mouse_key_number = -1;
}

function handlePageKeyDown(evt) {
	// Exit the function if the key is not a piano key
	// evt.key tells us the key that has been pressed
	if (!(evt.key in key_mapping)) return;

	// Find the key number of the key that has been pressed
	let key_number = key_mapping[evt.key];
	if (key_down_status[key_number]) return;

	// Start the note
	handleNoteOn(key_number);

	// Select the key
	$("#key-" + key_number).focus();

	// Show a simple message in the console
	console.log("Page key down event for key " + key_number + "!");

	// Remember the key is down
	key_down_status[key_number] = true;
}

function handlePageKeyUp(evt) {
	// Exit the function if the key is not a piano key
	// evt.key tells us the key that has been released
	if (!(evt.key in key_mapping)) return;

	// Find the key number of the key that has been released
	let key_number = key_mapping[evt.key];

	// Stop the note
	handleNoteOff(key_number);

	// De-select the key
	$("#key-" + key_number).blur();

	// Show a simple message in the console
	console.log("Page key up event for key " + key_number + "!");

	// Reset the key status
	key_down_status[key_number] = false;
}

/*
 * You need to write an event handling function for the instrument
 */

$(document).ready(function () {
	MIDI.loadPlugin({
		soundfontUrl: "./midi-js/soundfont/",
		instruments: [
			"trumpet",
			/* 			"acoustic_grand_piano",
			"electric_grand_piano",
			"church_organ",
			"acoustic_guitar_nylon",
			"electric_guitar_jazz",
			"electric_bass_finger",
			"violin",
			"voice_oohs",
			"clarinet", */
		],
		onprogress: function (state, progress) {
			console.log(state, progress);
		},
		onsuccess: function () {
			// Resuming the AudioContext when there is user interaction
			$("body").click(function () {
				if (MIDI.getContext().state != "running") {
					MIDI.getContext()
						.resume()
						.then(function () {
							console.log("Audio Context is resumed!");
						});
				}
			});

			// Hide the loading text and show the container
			$(".loading").hide();
			$(".container").show();

			// At this point the MIDI system is ready
			MIDI.setVolume(0, 127); // Set the volume level
			MIDI.programChange(0, 56); // Use the General MIDI 'trumpet' number

			// Set up the event handlers for all the buttons
			$("button").on("mousedown", handlePianoMouseDown);
			$(document).on("mouseup", handlePianoMouseUp);

			// Set up key events
			$(document).keydown(handlePageKeyDown);
			$(document).keyup(handlePageKeyUp);

			/*
			 * You need to set up the event for the instrument
			 */
		},
	});
});
