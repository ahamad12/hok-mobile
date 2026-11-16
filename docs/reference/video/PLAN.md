# README demo video

A short looping product video for the top of `README.md`. It shows what HOK Mobile does for a shop in 30 seconds. It plays silently, so every beat reads without sound.

Status: built. Source is `video/` (Remotion). Output is `docs/media/tapt-demo.mp4` and `docs/media/tapt-demo.gif`.

## Spec

| | |
|---|---|
| Length | 30 s, loops back to the title card |
| Format | 1080x1350 (4:5) MP4, plus a GIF fallback at 0.4 scale and 10 fps |
| Audio | None. Captions carry the story |
| Look | Phone mockup on near-black with a soft HOK-orange glow, Plus Jakarta Sans, one caption per beat, slow push-in on each screen |

## Beats

| Time | Screen | Caption |
|---|---|---|
| 0-2.5 s | HOK wordmark | "Run your shop's day from your pocket" |
| 2.5-7.5 s | Today | "One view of the whole day" |
| 7.5-12.5 s | Work (tasks, then tickets) | "Assign work. Track issues." |
| 12.5-16.5 s | Deliveries | "Check deliveries in" |
| 16.5-20.5 s | Scratch | "Scratch cards, sorted" |
| 20.5-24.5 s | Finance, then Expenses | "Know where the money went" |
| 24.5-27.5 s | Staff | "See who is on shift" |
| 27.5-30 s | HOK wordmark (loop) | |

## How it was made

1. Ran the app on the Android emulator against the local API with demo data from `npm run db:seed:demo` in `tapt-api` (never real shop data).
2. Captured each screen with `adb` and removed the Expo Go gear overlay (`video/public/screens/`).
3. Composed the scenes in `video/src/Demo.tsx`. Timing is the `SHOTS` and `BEATS` arrays at the top of that file.
4. Rendered with `npm run render` and `npm run render:gif` in `video/`.

## Known gaps

- Faint remnant of the dev overlay under the top-right buttons.
- Today shows a negative expected balance because the seeded expenses count against an empty till.
- No Till, Licences, Forms or Close-the-day screens (empty or not captured).
- The scene list is hand-timed; adding a screen means editing `SHOTS`, `BEATS` and `DURATION`.

## Not in scope

- Voiceover or music.
- Marketing site video.
- Store listing screenshots.
