# İlerleme

Durum: **15 aşamanın tamamı uygulandı**. `release/DronSavasi.apk` üretiliyor, `node tests/run-all.mjs` tüm testleri geçiyor.

| # | Aşama | Durum | Ana dosyalar |
|---|---|---|---|
| 1 | Çekirdek: build, ECS, sabit adımlı döngü, kamera, dokunmatik, kayıt | ✓ | core/*, ui/game.js, ui/input.js, build.mjs, tools/build-apk.sh |
| 2 | Dünya: prosedürel harita, autotile, chunk render, palet, mevsim | ✓ | world/*, render/terrain.js, data/palette.js |
| 3 | Işık ve atmosfer: gün-gece, ışık haritası, hava, parçacık, gölge | ✓ | sim/weather.js, render/view.js, render/particles.js, render/gl.js |
| 4 | İnşa ve ekonomi: binalar, kaynaklar, zincirler, iş gücü, şehirler | ✓ | sim/build.js, sim/economy.js, data/buildings.js |
| 5 | Altyapı ağları: elektrik, yakıt, ulaşım, haberleşme, su; hasar ve onarım | ✓ | sim/networks.js, sim/damage.js, sim/economy.js (onarım) |
| 6 | Lojistik: konvoylar, ikmal, depolar | ✓ | sim/logistics.js |
| 7 | Dronlar ve hava birimleri: uçuş, rota, sürü, kontrol menzili | ✓ | sim/air.js, sim/route.js |
| 8 | Füzeler ve roketatarlar | ✓ | sim/missiles.js |
| 9 | Hava savunma: radar ağı, SAM katmanları, önleme | ✓ | sim/airdefense.js |
| 10 | Elektronik harp: jammer, frekans, GPS, SIGINT, savaş sisi | ✓ | sim/ew.js |
| 11 | Kara cephesi: batalyonlar, cephe, tahkimat, emirler | ✓ | sim/ground.js |
| 12 | Araştırma ve diplomasi | ✓ | data/tech.js, sim/economy.js, sim/diplomacy.js |
| 13 | Düşman YZ: kişilik, 3 katman, zorluk | ✓ | ai/ai.js, ai/aieco.js, data/ai.js |
| 14 | Arayüz cilası, ses, denge, optimizasyon, tam test | ✓ | ui/*, audio/synth.js, tests/run-all.mjs, tests/balance.mjs |
| 15 | Online altyapı: komut kuyruğu → ağ, 24 ülke | ✓ | net/*, tests/lockstep.mjs |

## Ölçümler (headless, Node 22)
- 8 ülke, 256²: ortalama 0,68 ms/tick, en kötü ≈24 ms (bütçe 15 ms ortalama).
- 1024² harita kurulumu + 300 tick: 1,9 sn.
- Kayıt (2500 tick'lik oyun): ≈800 KB JSON, gzip sonrası çok daha küçük.
- Tarayıcı (Chromium, SwiftShader yazılım GPU'su): 60 FPS, WebGL2 ve Canvas2D yedeği.
- Denge (6 ülke, normal): maçlar 20–31+ oyun gününde sonuçlanıyor (1x hızda ≈50–75 dk).

## Komutlar
```
npm install
node build.mjs            # dist/index.html
bash tools/build-apk.sh   # release/DronSavasi.apk (Android SDK: /opt/android)
node tests/run-all.mjs    # tam test paketi
node tests/headless.mjs 6000 256 8   # hızlı headless simülasyon raporu
node tests/balance.mjs 11,22,33 45000 6 1
```
