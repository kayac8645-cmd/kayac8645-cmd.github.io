# Compute Empire — Sosyal Motor 2

- `original/compute-empire-v12.html` — kaynak oyun (dokunulmaz)
- `src/tr.js` — Türkçe ek motoru (ünlü uyumu, kaynaştırma, sayı/kısaltma okunuşu)
- `src/sm2-engine.js` — Sosyal Motor 2: olay kanalı, kesim × konu kamuoyu haritası, gündem, gerçeklik/tekrar denetimi, bağlamlı yanıtlar, tartışma zincirleri, rakip PR
- `src/sm2-ui.js`, `src/sm2-ui.css` — Gündem sayfası panelleri ve yorum rozetleri
- `src/hb-engine.js`, `src/hb-ui.js`, `src/hb-ui.css` — Holding 2: tedarik zinciri şirketlerinde toplu alım/satış, politika şablonları, toplu ambargo ve yatırım, teklif kuralları, otomatik yönetici
- `src/lab-engine.js`, `src/lab-ui.js` — laboratuvar satın alma (bağımsız / entegre / parçala), Rekabet Kurumu incelemesi, rakip birleşmeleri
- `src/world-engine.js`, `src/world-ui.js` — yetenek pazarı, devlet ihaleleri ve ihracat kısıtları, veri pazarı, 5 bölümlük kampanya
- `src/perf.js` — performans yamaları · `tools/minify.js` — güvenli küçültme
- `dist/compute-empire-v13.html` — oynanabilir tek dosya (küçültülmüş) · `dist/compute-empire-v13-okunur.html` — aynısının okunur hali

```
node tools/build.js                                   # dist/compute-empire-v13.html üretir
node tools/sim.js dist/compute-empire-v13.html 365 7  # otomatik oyuncu + kalite ölçümü
node tools/sim.js original/compute-empire-v12.html 365 7 --dump yorumlar.txt
node tools/sim.js dist/compute-empire-v13.html 730 7 --strat hold --cash 500000000   # holding denge testi (none | hold | greedy)
```
