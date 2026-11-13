# Compute Empire — Sosyal Motor 2

- `original/compute-empire-v12.html` — kaynak oyun (dokunulmaz)
- `src/tr.js` — Türkçe ek motoru (ünlü uyumu, kaynaştırma, sayı/kısaltma okunuşu)
- `src/sm2-engine.js` — Sosyal Motor 2: olay kanalı, kesim × konu kamuoyu haritası, gündem, gerçeklik/tekrar denetimi, bağlamlı yanıtlar, tartışma zincirleri, rakip PR
- `src/sm2-ui.js`, `src/sm2-ui.css` — Gündem sayfası panelleri ve yorum rozetleri
- `src/hb-engine.js`, `src/hb-ui.js`, `src/hb-ui.css` — Holding 2: tedarik zinciri şirketlerinde toplu alım/satış, politika şablonları, toplu ambargo ve yatırım, teklif kuralları, otomatik yönetici
- `dist/compute-empire-v13.html` — oynanabilir tek dosya (üretilir)

```
node tools/build.js                                   # dist/compute-empire-v13.html üretir
node tools/sim.js dist/compute-empire-v13.html 365 7  # otomatik oyuncu + kalite ölçümü
node tools/sim.js original/compute-empire-v12.html 365 7 --dump yorumlar.txt
```
