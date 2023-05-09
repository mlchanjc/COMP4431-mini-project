/* Parse the midi file to json object and store in midiFile */
const parseFile = (file) => {
	const reader = new FileReader();
	reader.onload = function (e) {
		//Clear canvas
		isNewFile = false;
		canvasContext.fillStyle = "white";
		canvasContext.fillRect(0, 0, CANVAS_W, CANVAS_H);

		//Setting up variables
		midiFile = new Midi(e.target.result);
		tickPerSec = Math.round(midiFile.durationTicks / midiFile.duration);
		bpm = tickPerSec / (midiFile.header.ppq / 60);
		unmultipliedDivisionTime = 60000 / bpm / 4;
		divisionTime = unmultipliedDivisionTime * divisionMultiplier;
		endingTime = divisionTime * division;

		timeSlider.max = Math.floor(midiFile.duration * 1000);
		timeSlider.addEventListener("input", (event) => {
			startingTime = Number(event.target.value);
			endingTime = divisionTime * division + startingTime;
			renderDisplay();
		});
		maxTime.textContent = String(Math.floor(midiFile.duration * 1000));

		console.log(midiFile);
		tracks = [];
		midiFile.tracks.forEach((track) => {
			tracks.push(track);
		});

		const t0 = performance.now();
		midiBlob = new Blob([midiFile.toArray()], { type: "audio/midi" });
		console.log(`Encoding MIDI took ${performance.now() - t0} milliseconds.`);
		const reader2 = new FileReader();
		reader2.onload = function (e) {
			midiBase64 = e.target.result;
		};
		reader2.readAsDataURL(midiBlob);

		renderList();
	};
	reader.readAsArrayBuffer(file);
};

/* Render track list */
const renderList = () => {
	if (tracks.length > 0) {
		// add each item to the list
		const children = list.children;
		while (list.children.length > 0) {
			list.removeChild(children[0]);
		}

		let allInstrumentOptions = "";
		const groupBy = (x, f) =>
			x.reduce((a, b, i) => ((a[f(b, i, x)] ||= []).push(b), a), {});
		const instrumentsByGroup = groupBy(allInstruments, ({ family }) => family);
		for (const [familyName, instruments] of Object.entries(
			instrumentsByGroup
		)) {
			allInstrumentOptions += `<optgroup label="${familyName}">`;
			instruments.forEach((instrument) => {
				const id = parseInt(instrument.hexcode);
				// allInstrumentOptions += `<option value="${id}">${instrument.family} - ${instrument.instrument}</option>`;
				allInstrumentOptions += `<option value="${id}">${instrument.instrument}</option>`;
			});
			allInstrumentOptions += `</optgroup>`;
		}

		tracks.forEach((track, index) => {
			const li = document.createElement("li");
			const name = `Track ${index + 1}` + (track.name ? `: ${track.name}` : "");
			li.dataset.trackId = index + 1; // <li data-track-id="1">...</li>
			li.innerHTML = `
        		<div class="list-item">
          			<span class="track-name">${name}</span>
          			<div class="input-group mb-3">
						<select class="custom-select instrument-select">
							${allInstrumentOptions}
						</select>
        			</div>
          			<button class="btn btn-danger track-list-delete-track-btn">Delete</button>
       			</div>
      		`;
			$(li).find(".instrument-select").val(track.instrument.number);
			list.appendChild(li);
		});
		listContainer.style.display = "block";
		emptyMessage.style.display = "none";
	} else {
		emptyMessage.style.display = "block";
	}
};

// Select track click handler
$(list).on("click", "li", function (event) {
	// Delegated event handlers ref https://api.jquery.com/on/#direct-and-delegated-events
	// Ignore if the click is on a button or select
	if (["BUTTON", "SELECT"].includes($(event.target).prop("nodeName"))) {
		return;
	}

	selectedTrack = $(this).data("trackId");
	MIDI.programChange(0, midiFile.tracks[selectedTrack - 1].instrument.number);
	renderDisplay();
});

// Edit track input handler
$(list).on("input", ".instrument-select", function (event) {
	const trackId = $(this).closest("li").data("trackId");
	const instrumentId = parseInt($(this).val());

	tracks[trackId - 1].instrument.number = instrumentId;
	midiFile.tracks[trackId - 1].instrument.number = instrumentId;
	MIDI.programChange(0, instrumentId);

	//Recompute the preview audio
	midiBlob = new Blob([midiFile.toArray()], { type: "audio/midi" });
	const reader = new FileReader();
	reader.onload = function (e) {
		midiBase64 = e.target.result;
	};
	reader.readAsDataURL(midiBlob);
});

// Delete track click handler
$(list).on("click", ".track-list-delete-track-btn", function (event) {
	// Delegated event handlers ref https://api.jquery.com/on/#direct-and-delegated-events
	const trackId = $(this).closest("li").data("trackId");
	midiFile.tracks.splice(trackId - 1, 1);
	tracks = [];
	midiFile.tracks.forEach((track) => {
		tracks.push(track);
	});

	if (selectedTrack > trackId) {
		selectedTrack--;
	}

	//Recompute the preview audio
	midiBlob = new Blob([midiFile.toArray()], { type: "audio/midi" });
	const reader = new FileReader();
	reader.onload = function (e) {
		midiBase64 = e.target.result;
	};
	reader.readAsDataURL(midiBlob);
	renderList();
	renderDisplay();
});
