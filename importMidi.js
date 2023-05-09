/* Parse the midi file to json object and store in midiFile */
const parseFile = (file) => {
	const reader = new FileReader();
	reader.onload = function (e) {
		//Clear canvas
		canvasContext.fillStyle = "white";
		canvasContext.fillRect(0, 0, CANVAS_W, CANVAS_H);

		//Setting up variables
		midiFile = new Midi(e.target.result);
		editedmidiFile = new Midi(e.target.result);
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
		let temp = midiFile.tracks;
		tracks = temp;

		midiBlob = new Blob([midiFile.toArray()], { type: "audio/midi" });
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
		tracks.forEach((track, index) => {
			const li = document.createElement("li");
			const name = `Track ${index + 1}`;
			li.innerHTML = `
        		<div class="list-item">
          			<span class="track-name">${name}</span>
          			<div class="input-group mb-3">
						<select class="custom-select" id="instrument">
							<option selected value="56">${track.instrument.name}</option>
							// more instruments to be added 
						</select>
        			</div>
          			<button class="delete-button">Delete</button>
       			</div>
      		`;
			list.appendChild(li);
		});
		listContainer.style.display = "block";
		emptyMessage.style.display = "none";
		//Add listeners for all track name
		const listItems = document.querySelectorAll(".track-name");
		listItems.forEach((item) => {
			item.addEventListener("click", (event) => {
				recordMode = false;
				recordedTrack = [];
				selectedTrack = item.textContent.split(" ")[1];
				renderDisplay();
			});
		});
	} else {
		emptyMessage.style.display = "block";
	}
};
