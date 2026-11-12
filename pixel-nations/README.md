# Pixel Nations
HD piksel sanatı büyük strateji. Kurulum yok: `pixel-nations/index.html` (GitHub Pages: `/pixel-nations/`).

Mimari (`js/`): worldgen (World/Map Engine), terrain+render+sprites (Map renderer), economy (Economy+Population+Tech),
military, diplomacy, ai, events, save, state (zustand benzeri store), ui/main (UI Engine). Motorlar DOM'suzdur:
`node tests/sim.mjs <seed> <yıl>` başsız simülasyon; `tests/*.cjs` Playwright duman testleri.
