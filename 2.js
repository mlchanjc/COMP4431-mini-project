$(".load-demo-midi-file-btn").click((event) => {
	// <button class="load-demo-midi-file-btn" data-filename="XXX.mid"></button>
	const filename = $(event.target).data("filename");
	fetch(`sampleData/${filename}`)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not OK");
			}
			return response.blob();
		})
		.then((blob) => {
			// Cross ref filedrop onChange callback
			document.querySelector("#FileDrop #Text").textContent = filename;
			parseFile(blob);
		})
		.catch(() => {
			window.alert(`Failed to load demo MIDI file ${filename}.`);
		});
});

$("#download-midi-file-btn").click((event) => {
	if (!midiFile) return;

	// @tonejs/midi Encoding Midi https://github.com/Tonejs/Midi#encoding-midi
	// Note: This may not give the exact MIDI file as the input MIDI file. e.g. Channels are split into multiple tracks.
	// Ref @tonejs/midi Midi/src/Midi.ts#splitTracks
	// https://stackoverflow.com/a/76126858
	const downloadUrl = URL.createObjectURL(midiBlob);
	const link = document.createElement("a");
	link.href = downloadUrl;
	link.download = "output.mid";
	link.click();
	URL.revokeObjectURL(downloadUrl);
});
