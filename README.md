# Push Your Name — development build

**Native Effect House build is now saved:** open `Push Your Name/effect.ehproj` in Effect House. It contains the playable head-controlled puzzle, six fixed names, countdown/timer, undo/restart/name selection, win/timeout results, and recording lifecycle. It has not been published to TikTok. Phone sensitivity, timing, audio and performance testing remain. See `NATIVE-QA.md` and the latest section of `CONTINUE.md`.

Fixed names: SERAME, MATHAPELO, MAJORO, NTSEARE, RORISANG, LEPHUTING.

This folder also retains the browser test harness and portable puzzle engine described below. Those files are separate from the native Effect House project.

## Try the development preview

Serve this directory locally and open `preview.html` in Chrome. The current session uses http://127.0.0.1:8874/preview.html.

Choose a name and press Start round. Arrow keys move the cyan pusher. Enable head controls requests your camera; Centre head calibrates the neutral pose. Make one gesture and return to centre for the next move. Tracking sensitivity and axis direction still need real camera testing.

Record round restarts the puzzle, records the 3–2–1 countdown and composed game/camera canvas, and provides a local WebM download after Stop recording. No microphone audio is captured. This harness does not post or upload recordings.

Head tracking loads pinned MediaPipe Tasks Vision 0.10.35 and Google's Face Landmarker model over the internet; inference occurs locally. Webcam permission and a working camera are required. The TikTok version will use Effect House tracking instead.

## Implemented rules

- Three second countdown, 60/55/55/50/50/45 second provisional limits.
- Push one letter at a time; walls and other blocks stop pushes.
- Match letters to their marked goal squares; duplicate letters are interchangeable.
- Undo restores the last successful move without restoring time.
- Correct blocks remain movable so a valid route is not accidentally blocked by permanent locking.
- Reverse scrambling creates solvable boards. Stored inverse paths validate them.
- Neutral threshold, smoothing, and gesture latch prevent repeated head-trigger moves; face loss requires neutral again.

## Verification

Run `node verify.mjs`. Tested 180 generated boards by replaying their inverse paths through the game engine, plus countdown, expiry, undo, neutral latch, and face-loss checks. Browser layout and recording control state were inspected. Physical head tracking, downloaded video playback, and Effect House integration remain unverified.

## Effect House assembly

Create an actual native project in the editor; do not rename this folder to an Effect House package. Port the portable engine into a TypeScript component, connect calibrated head pose to HeadInput, render tiles/letters/pusher in the camera canvas, and wire Video Record On Start to reset/start the countdown. On Stop must freeze the round, while resume must not grant a fresh timer. All six names must be fixed options, not arbitrary input.

Use the accepted colourful purple/coral/mint concept. Keep the face visible beneath the board and TikTok's right-side control area unobstructed. Add restart/undo interactions, winning and timeout displays, sound cues, and a final result hold for recording. Tune difficulty on a phone before submission.

Official references:
- https://effecthouse.tiktok.com/learn/guides/api-reference/scripting-capability-usage-guide
- https://effecthouse.tiktok.com/learn/guides/editor-panels/visual-scripting/nodes/event/video-record
- https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js
