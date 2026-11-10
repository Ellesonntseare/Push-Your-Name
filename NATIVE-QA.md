# Native Effect House build — verification and remaining work

The project is saved at `Push Your Name/effect.ehproj` in this folder. It is an editable local effect, not a published TikTok filter.

## Implemented

- Fixed names: SERAME, MATHAPELO, MAJORO, NTSEARE, RORISANG, LEPHUTING. Play order is SERAME, MAJORO, NTSEARE, RORISANG, MATHAPELO, LEPHUTING.
- Purple vinyl board, coloured raised-looking blocks, mint goals, cyan pusher, gold title and clear native HUD.
- Bottom-centred camera portrait with preserved proportions, clear of the play area and buttons.
- One-second head calibration, three-second countdown, 60/55/55/50/50/45 second nominal limits.
- Roll left/right and pitch up/down, smoothed input, 13° trigger, 6° neutral rearm, one grid step per gesture.
- Push one block at a time, wall/overlap constraints, duplicate-letter matching, Undo, Restart and fixed-name selection.
- Win and timeout results, completion time/moves, confetti pool, and an Audio Player wired to a short pop.
- Native RecordStart begins a fresh round; RecordEnd pauses an unfinished round; resumed recording retains board and remaining time.

## Evidence

- Native TypeScript compilation passed after the final edits.
- The actual native movement controller replayed verified solution routes for all six boards and logged PASS for each name.
- Native preview showed intro, calibration, countdown and gameplay transitions.
- A built-in nodding clip produced a vertical step. Undo returned the pusher to its previous tile while the clock kept running.
- Name selection changed the displayed puzzle to MAJORO.
- Recording pause and resume logged the same remaining value, 57.74 seconds, at both boundaries, then resumed countdown normally.
- A temporarily shortened four-second round reached the real timer-expiry path, displayed TIME’S UP, and Play Again returned to countdown. Normal durations were restored afterward.
- Automated route playback reached NAME COMPLETE through the actual goal check. Confetti was captured at its peak and the result remained visible afterward. The zero-second route-test results are synthetic verification, not a human completion time.
- All temporary autoplay/route-test branches and shortened timer overrides were removed. The normal ready state is restored for delivery.
- The portable engine separately passed 180 solvable-board checks plus timer, undo, gesture latch and face-loss tests.

## Assets and wiring

- `CyanPusher.png`: generated cyan teardrop-headed vinyl mascot, real alpha, imported canvas 467×782, aspect 0.597. Its cell display preserves its proportions.
- `ToyBlock.png`: generated blank pearl/violet bevel block, real alpha, imported canvas 550×544, aspect 1.011. Shared by board tiles, goals and tinted movable blocks, with native editable letter labels.
- `names.userjson`: six fixed data records, including matching goals and verified solution routes; wired to the manager's Theme & Assets data field.
- `sfx_pop.mp3`: bundled short audio resource, wired to MoveSound at volume 35, Once mode, autoplay off.
- Cartoon kit button/panel/pill materials are retinted to the approved purple/mint palette. Native display uses Bold.ttf; supporting UI uses Classic.ttf.

## Physical phone checks still required

1. Confirm comfortable horizontal roll steps and mirrored left/right direction. The available side-turning clip moved the roll indicator but did not cross the configured roll trigger, so a horizontal step was not established by that clip.
2. Tune calibration, sensitivity and time limits against actual head-controlled play, especially the nine-letter names.
3. Exercise tracking loss and reacquisition continuously on a phone. The code disarms on loss and requires neutral again; the recovered-face status message was corrected after editor testing.
4. Record a real TikTok take, pause/resume it, replay/export it and verify framing and audio. Editor simulation verified the events; it is not a phone recording.
5. Check mobile frame time, memory, final package size and TikTok performance requirements before submission. The editor remained responsive in preview with tracking and feedback, but this is not a quantified mobile performance result.
6. Create the final effect icon and complete TikTok submission only when the phone preview has been reviewed.

The editor's video capture API did not produce an MP4 on either of two attempts (a seven-second explicit output path and a three-second default temporary path). No movie is delivered. This failure is separate from the passing native recording-event tests; real TikTok recording/export is not verified. The supplied gameplay screenshot uses a built-in tracking clip. No real user camera recording was made or uploaded.
