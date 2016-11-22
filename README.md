# call-it-a-day

This a is simple Gnome Shell Extension that

	- When clicked, displays how much time is left until end of
      working day (currently defined as 7.25h + 1h lunch break)
	- Once the 8.25h hours pass, displays a banner notifying

It currently uses a GLib timeout. There is preliminary support to
handle lock / unlock of the user screen, which can be used to pause
the timer.

The code is available under the MIT license as seen in the LICENSE
file.

## Next steps

	- Display remaining time as text alongside the clock button
	- Remove button press as time will always be displayed
	- Change text colour once the regular work hours are over

## Later on

	- Save hours in excess / defect and allow to carry them over
	- Display balance
