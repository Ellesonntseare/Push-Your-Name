# Continue testing Push Your Name — native build saved

## Latest native build checkpoint

The native game has now been built in Effect House and saved in `Push Your Name/effect.ehproj`. The earlier blank-project checkpoint below is historical.

Project ID: `2280476c-2349-e8f5-e1a9-1211e5c4b00f`.

The scene has 178 objects, with a bottom-centred aspect-preserving portrait, a purple 8x8 board (6x6 playable interior), generated ToyBlock and CyanPusher textures, native text, buttons, timer/moves/placed HUD, intro, countdown, results, and a 24-piece celebration pool. `GameManager` hosts the compiled `PushNameController` component. `names` is the wired JsonAsset containing all six fixed layouts. A native Audio Player is wired to bundled `sfx_pop`.

Native checks passed: all six boards solved using the actual controller; intro → calibration → countdown → gameplay; nod input made a real vertical move; Undo restored that move without restoring time; name selection changed to MAJORO; recording stop/resume preserved remaining time and board; shortened test timer reached the real timeout condition and Play Again restarted; win/results and confetti rendered. All temporary route-playback and short-timer test modifications were removed. Default timeScale=1, firstName=0, gestureAngle=13°, neutralAngle=6°.

Horizontal roll drives the aim indicator, but available turning clips did not exceed the 13° roll threshold after calibration. Verify comfortable left/right steps and mirror direction on a physical phone. Also check phone recording/export, game timing, audio audibility, tracking loss/reacquisition and performance before publication. No phone test, publication, package/performance certification or real user recording has been completed.

`native-gameplay.jpg` is a native editor preview deliverable using a built-in sample tracking video. The editor's video capture API failed to produce an MP4 on two attempts (explicit output path and default temporary path), so no movie is delivered. Native record event simulation passed, but actual TikTok recording/export remains a phone check. See `NATIVE-QA.md` for limits.

Use the `effect-house` skill and native `eh` tools for further project changes. Establish `eh.project.status()` first; if the same project is open, inspect only the relevant scene/script state. Read `PushNameController` via `eh.scripts.get(...).read()` before editing. The native controller has more changes than the original portable/browser source, so do not overwrite it with the older work draft.

---

## Earlier setup handoff (historical)

The user approved a TikTok head-movement letter-block puzzle, the colourful purple/mint/coral visual concept, challenging timed rounds, and recording. Fixed names MUST remain exactly SERAME, MATHAPELO, MAJORO, NTSEARE, RORISANG, LEPHUTING. Do not replace these with arbitrary name entry.

## Current state

- Effect House 5.16.0 is installed and the user signed in.
- A native project was created and saved through the editor at `Push Your Name/effect.ehproj` beside this note. This is currently a blank native project; the game has NOT yet been built into it.
- The editor was left open with that project.
- Effect House's official local setup bundle was obtained through its Other Agents panel (`http://127.0.0.1:9100/install/bundle`). The supplied `eh` connection and `effect-house` skill were installed globally for Codex, preserving other settings. The native stdio initialize verification passed; setup report returned HTTP 200.
- The new `eh` tools were not loaded in the already-running chat. Fully restarting the assistant app is needed to load the connection. After restart, discover `mcp__eh__run` and follow the effect-house skill. Do not start a private server and make requests to bypass missing tools.

## Existing implementation to reuse

- `game-core.mjs`: tested portable puzzle engine with timer, countdown, movement/pushing, goals, win/loss, undo, and smoothed neutral-latched head input.
- `levels.mjs`: six fixed, solvable layouts with verified inverse routes; each repeated letter is interchangeable with its matching target.
- `preview.html` and `preview.mjs`: browser development harness; camera tracking through MediaPipe and local canvas recording are NOT native TikTok APIs. Camera tracking still needs physical testing.
- `verify.mjs`: 180 generated-board route checks plus timer, undo, and head-latch checks passed. Six fixed-layout routes were also replayed successfully.
- `EffectHouseBuildBrief.txt`: native assembly requirements.
- `README.md`: preview usage and limits.

## Next actions

Use native `eh` tools to establish project identity, inspect the scene, and port the engine to a TypeScript/APJS component. Build board/letter/pusher visuals in the native scene, connect head tracking with neutral calibration, wire native recording lifecycle to countdown/timer, and add UI results/undo/restart/name selector. Read the installed effect-house skill and the native workspace references it names first. Verify compilation, native preview screenshots, all six puzzles, and recording lifecycle. Phone testing and publication remain outstanding. Do not describe the filter as complete or published yet.
