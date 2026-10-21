# Doshiba & Suhel wedding invitation

Static English wedding invitation. This GitHub repository serves the current invitation from its root. Netlify uses the existing `netlify.toml` with `publish = "."`; pushing to the connected production branch triggers deployment. No framework build is required. The invitation is also published on OpenAI Sites from a separate source checkout.

- `index.html`: wedding content and controls.
- `style.css`: base layout, palace background, opening animation, motion and print foundations.
- `classic.css`: royal stationery appearance and responsive overrides.
- `invitation.js`: opening/replay, media, navigation, optional YouTube music and countdown.
- `ornaments/`: decorative SVGs adapted from the user-provided asset pack.

The intended entrance is the original hands photograph zooming directly into the couple's names. The older intermediate courtyard/hall overlay is retained as an inactive legacy asset, not an unfinished entrance. Music remains optional and requires pressing play in the YouTube player. Video failure falls back to posters. The motion control supports explicit playback when the system requests reduced motion; Open without animation stays available.

The Print card button intentionally prints the main 5-by-7-inch invitation only. The separate PDF is a Nikah Mubarak gift keepsake, not a complete event programme. The event schedule on the website is the authoritative programme from the family cards.

Confirmed events in Solapur, India: Haldi 14 November 2026 at 7 PM; Nikah 15 November 2026 at 7 PM; Reception 16 November 2026 at 8 PM. Dinner follows each event. Countdown target is 15 November 2026 at 19:00 IST.


## Personalised gift card
The With duas section now has one Personalise & download form. It generates a name-specific, 300-dpi, 5x7-inch PDF in the browser and starts the download after submission. No name is sent to a server. A download-again link appears only for the generated card. `gift-card.js` owns the canvas layout and single-page PDF export. The old static gift-card PDF and artwork remain legacy assets and are no longer offered as generic downloads on the page.
