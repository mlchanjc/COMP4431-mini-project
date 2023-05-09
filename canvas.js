let heptatonicScaleNames = [
	{ name: "A0", isBlackKey: false },
	{ name: "A#0/Bb0", isBlackKey: true },
	{ name: "B0", isBlackKey: false },
	{ name: "C1", isBlackKey: false },
	{ name: "C#1/Db1", isBlackKey: true },
	{ name: "D1", isBlackKey: false },
	{ name: "D#1/Eb1", isBlackKey: true },
	{ name: "E1", isBlackKey: false },
	{ name: "F1", isBlackKey: false },
	{ name: "F#1/Gb1", isBlackKey: true },
	{ name: "G1", isBlackKey: false },
	{ name: "G#1/Ab1", isBlackKey: true },
	{ name: "A1", isBlackKey: false },
	{ name: "A#1/Bb1", isBlackKey: true },
	{ name: "B1", isBlackKey: false },
	{ name: "C2", isBlackKey: false },
	{ name: "C#2/Db2", isBlackKey: true },
	{ name: "D2", isBlackKey: false },
	{ name: "D#2/Eb2", isBlackKey: true },
	{ name: "E2", isBlackKey: false },
	{ name: "F2", isBlackKey: false },
	{ name: "F#2/Gb2", isBlackKey: true },
	{ name: "G2", isBlackKey: false },
	{ name: "G#2/Ab2", isBlackKey: true },
	{ name: "A2", isBlackKey: false },
	{ name: "A#2/Bb2", isBlackKey: true },
	{ name: "B2", isBlackKey: false },
	{ name: "C3", isBlackKey: false },
	{ name: "C#3/Db3", isBlackKey: true },
	{ name: "D3", isBlackKey: false },
	{ name: "D#3/Eb3", isBlackKey: true },
	{ name: "E3", isBlackKey: false },
	{ name: "F3", isBlackKey: false },
	{ name: "F#3/Gb3", isBlackKey: true },
	{ name: "G3", isBlackKey: false },
	{ name: "G#3/Ab3", isBlackKey: true },
	{ name: "A3", isBlackKey: false },
	{ name: "A#3/Bb3", isBlackKey: true },
	{ name: "B3", isBlackKey: false },
	{ name: "C4", isBlackKey: false },
	{ name: "C#4/Db4", isBlackKey: true },
	{ name: "D4", isBlackKey: false },
	{ name: "D#4/Eb4", isBlackKey: true },
	{ name: "E4", isBlackKey: false },
	{ name: "F4", isBlackKey: false },
	{ name: "F#4/Gb4", isBlackKey: true },
	{ name: "G4", isBlackKey: false },
	{ name: "G#4/Ab4", isBlackKey: true },
	{ name: "A4", isBlackKey: false },
	{ name: "A#4/Bb4", isBlackKey: true },
	{ name: "B4", isBlackKey: false },
	{ name: "C5", isBlackKey: false },
	{ name: "C#5/Db5", isBlackKey: true },
	{ name: "D5", isBlackKey: false },
	{ name: "D#5/Eb5", isBlackKey: true },
	{ name: "E5", isBlackKey: false },
	{ name: "F5", isBlackKey: false },
	{ name: "F#5/Gb5", isBlackKey: true },
	{ name: "G5", isBlackKey: false },
	{ name: "G#5/Ab5", isBlackKey: true },
	{ name: "A5", isBlackKey: false },
	{ name: "A#5/Bb5", isBlackKey: true },
	{ name: "B5", isBlackKey: false },
	{ name: "C6", isBlackKey: false },
	{ name: "C#6/Db6", isBlackKey: true },
	{ name: "D6", isBlackKey: false },
	{ name: "D#6/Eb6", isBlackKey: true },
	{ name: "E6", isBlackKey: false },
	{ name: "F6", isBlackKey: false },
	{ name: "F#6/Gb6", isBlackKey: true },
	{ name: "G6", isBlackKey: false },
	{ name: "G#6/Ab6", isBlackKey: true },
	{ name: "A6", isBlackKey: false },
	{ name: "A#6/Bb6", isBlackKey: true },
	{ name: "B6", isBlackKey: false },
	{ name: "C7", isBlackKey: false },
	{ name: "C#7/Db7", isBlackKey: true },
	{ name: "D7", isBlackKey: false },
	{ name: "D#7/Eb7", isBlackKey: true },
	{ name: "E7", isBlackKey: false },
	{ name: "F7", isBlackKey: false },
	{ name: "F#7/Gb7", isBlackKey: true },
	{ name: "G7", isBlackKey: false },
	{ name: "G#7/Ab7", isBlackKey: true },
	{ name: "A7", isBlackKey: false },
	{ name: "A#7/Bb7", isBlackKey: true },
	{ name: "B7", isBlackKey: false },
	{ name: "C8", isBlackKey: false },
];

const parseTime = (milliseconds) => {
	const minutes = Math.floor(milliseconds / 60000);
	const seconds = Math.floor((milliseconds % 60000) / 1000);
	const ms = Math.floor(milliseconds % 1000);
	return `${minutes.toString().padStart(2, "0")}:${seconds
		.toString()
		.padStart(2, "0")}:${ms.toString().padStart(3, "0")}`;
};

const renderDisplay = () => {
	//Clear canvas
	canvasContext.fillStyle = "white";
	canvasContext.fillRect(0, 0, CANVAS_W, CANVAS_H);

	//Render track name
	canvasContext.lineWidth = 0.5;
	canvasContext.fillStyle = "lightblue";
	canvasContext.fillRect(0, 0, KEY_W, HEADER_H);
	canvasContext.fillStyle = "black";
	canvasContext.strokeRect(0, 0, KEY_W, HEADER_H);
	canvasContext.fillStyle = "black";
	canvasContext.font = "20px Arial";
	canvasContext.fillText(`Track ${selectedTrack}`, 5, HEADER_H / 2, KEY_W);

	//Render timestamps
	for (let i = 0; i < division; i++) {
		if (
			startingTime + divisionTime * i <=
			Math.floor(midiFile.duration * 1000)
		) {
			canvasContext.fillText(
				`${parseTime(startingTime + divisionTime * i)}`,
				5 + KEY_W + ((CANVAS_W - KEY_W) / division) * i,
				HEADER_H / 2,
				KEY_W
			);
		}
	}

	renderTrack();

	for (let i = 0; i < KEYS_SHOWN; i++) {
		//Render piano keys
		const isBlackKey =
			heptatonicScaleNames[
				reverseScale
					? heptatonicScaleNames.length - 1 - startingScale - i
					: i + startingScale
			].isBlackKey;
		const name =
			heptatonicScaleNames[
				reverseScale
					? heptatonicScaleNames.length - 1 - startingScale - i
					: i + startingScale
			].name;
		canvasContext.fillStyle = isBlackKey ? "black" : "white";
		canvasContext.fillRect(0, HEADER_H + TRACK_H * i, KEY_W, TRACK_H);
		canvasContext.fillStyle = "black";
		canvasContext.strokeRect(0, HEADER_H + TRACK_H * i, KEY_W, TRACK_H);
		canvasContext.fillRect(
			CANVAS_W / 15,
			HEADER_H + TRACK_H * i - 0.5,
			CANVAS_W - KEY_W,
			0.5
		);
		canvasContext.fillStyle = isBlackKey ? "white" : "black";
		canvasContext.fillText(
			name,
			5,
			HEADER_H + TRACK_H * i + TRACK_H / 2 + KEYS_SHOWN / 2.5,
			KEY_W
		);

		//Render the square things
		for (let j = 0; j < division; j++) {
			canvasContext.fillStyle = "black";
			canvasContext.fillRect(
				KEY_W + ((CANVAS_W - KEY_W) / (division * 4)) * (j * 4 + (i % 4)),
				HEADER_H,
				0.5,
				CANVAS_H - HEADER_H
			);
		}
	}

	//Render the red line
	canvasContext.fillStyle = recordMode ? "green" : "red";
	const msPerPixel = (endingTime - startingTime) / (CANVAS_W - KEY_W);
	if (redlineTime >= startingTime && redlineTime <= endingTime)
		canvasContext.fillRect(
			(redlineTime - startingTime) / msPerPixel + KEY_W,
			HEADER_H,
			1.5,
			CANVAS_H - HEADER_H
		);
};

const renderTrack = () => {
	const notes = tracks[selectedTrack - 1].notes;
	const msPerPixel = (endingTime - startingTime) / (CANVAS_W - KEY_W);
	canvasContext.fillStyle = "lightblue";
	for (let i = 0; i < notes.length; i++) {
		let noteTime = Math.floor(notes[i].time * 1000);
		let noteDuration = Math.floor(notes[i].duration * 1000);
		if (noteTime + noteDuration < startingTime) continue;
		else if (noteTime >= endingTime) break;
		else {
			if (reverseScale) {
				if (
					notes[i].midi >=
						heptatonicScaleNames.length + 21 - KEYS_SHOWN - startingScale &&
					notes[i].midi < heptatonicScaleNames.length + 21 - startingScale
				) {
					let x =
						noteTime <= startingTime
							? KEY_W + 1
							: KEY_W + (noteTime - startingTime) / msPerPixel;
					let width;
					if (noteTime <= startingTime)
						width =
							Math.round(
								(noteDuration - (startingTime - noteTime)) / msPerPixel
							) >
							CANVAS_W - x
								? CANVAS_W - x
								: Math.round(
										(noteDuration - (startingTime - noteTime)) / msPerPixel
								  );
					else
						width =
							Math.round(noteDuration / msPerPixel) > CANVAS_W - x
								? CANVAS_W - x
								: Math.round(noteDuration / msPerPixel);
					canvasContext.fillRect(
						x,
						HEADER_H +
							TRACK_H *
								(heptatonicScaleNames.length +
									20 -
									notes[i].midi -
									startingScale),
						width,
						TRACK_H
					);
				} else continue;
			} else {
				if (
					notes[i].midi >= startingScale + 21 &&
					notes[i].midi < startingScale + 21 + KEYS_SHOWN
				) {
					let x =
						noteTime <= startingTime
							? KEY_W + 1
							: KEY_W + (noteTime - startingTime) / msPerPixel;
					let width;
					if (noteTime <= startingTime)
						width =
							Math.round(
								(noteDuration - (startingTime - noteTime)) / msPerPixel
							) >
							CANVAS_W - x
								? CANVAS_W - x
								: Math.round(
										(noteDuration - (startingTime - noteTime)) / msPerPixel
								  );
					else
						width =
							Math.round(noteDuration / msPerPixel) > CANVAS_W - x
								? CANVAS_W - x
								: Math.round(noteDuration / msPerPixel);
					canvasContext.fillRect(
						x,
						HEADER_H + TRACK_H * (notes[i].midi - 21 - startingScale),
						width,
						TRACK_H
					);
				} else continue;
			}
		}
	}
	/* 	if (isRecording) {
		canvasContext.fillStyle = "white";
		canvasContext.fillRect(
			Math.round((initRedlineTime - startingTime) / msPerPixel) + KEY_W,
			HEADER_H + 1,
			Math.round((redlineTime - initRedlineTime) / msPerPixel),
			CANVAS_H - HEADER_H
		);
	} */

	canvasContext.fillStyle = "yellow";
	for (let i = 0; i < recordedTrack.length; i++) {
		let noteTime = recordedTrack[i].startTime;
		let noteDuration = recordedTrack[i].duration;
		if (noteTime + noteDuration < startingTime) continue;
		else if (noteTime >= endingTime) break;
		else {
			if (reverseScale) {
				if (
					recordedTrack[i].pitch >=
						heptatonicScaleNames.length + 21 - KEYS_SHOWN - startingScale &&
					recordedTrack[i].pitch <
						heptatonicScaleNames.length + 21 - startingScale
				) {
					let x =
						noteTime <= startingTime
							? KEY_W + 1
							: KEY_W + (noteTime - startingTime) / msPerPixel;
					let width;
					if (!recordedTrack[i].ended) {
						width = Math.round((redlineTime - noteTime) / msPerPixel);
					} else {
						if (noteTime <= startingTime)
							width =
								Math.round(
									(noteDuration - (startingTime - noteTime)) / msPerPixel
								) >
								CANVAS_W - x
									? CANVAS_W - x
									: Math.round(
											(noteDuration - (startingTime - noteTime)) / msPerPixel
									  );
						else
							width =
								Math.round(noteDuration / msPerPixel) > CANVAS_W - x
									? CANVAS_W - x
									: Math.round(noteDuration / msPerPixel);
					}
					canvasContext.fillRect(
						x,
						HEADER_H +
							TRACK_H *
								(heptatonicScaleNames.length +
									20 -
									recordedTrack[i].pitch -
									startingScale),
						width,
						TRACK_H
					);
				} else continue;
			} else {
				if (
					recordedTrack[i].pitch >= startingScale + 21 &&
					recordedTrack[i].pitch < startingScale + 21 + KEYS_SHOWN
				) {
					let x =
						noteTime <= startingTime
							? KEY_W + 1
							: KEY_W + (noteTime - startingTime) / msPerPixel;
					let width;
					if (!recordedTrack[i].ended) {
						width = Math.round((redlineTime - noteTime) / msPerPixel);
					} else {
						if (noteTime <= startingTime)
							width =
								Math.round(
									(noteDuration - (startingTime - noteTime)) / msPerPixel
								) >
								CANVAS_W - x
									? CANVAS_W - x
									: Math.round(
											(noteDuration - (startingTime - noteTime)) / msPerPixel
									  );
						else
							width =
								Math.round(noteDuration / msPerPixel) > CANVAS_W - x
									? CANVAS_W - x
									: Math.round(noteDuration / msPerPixel);
					}
					canvasContext.fillRect(
						x,
						HEADER_H + TRACK_H * (recordedTrack[i].pitch - 21 - startingScale),
						width,
						TRACK_H
					);
				} else continue;
			}
		}
	}
};
