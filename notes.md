# COMP4431 Mini Project

## Notes

`MIDI.Player.currentTime` does not update when there are no events.

e.g. Especially when a song starts with all silent for a few seconds, MIDI.Player.currentTime constantly returns 0 until the first note.
