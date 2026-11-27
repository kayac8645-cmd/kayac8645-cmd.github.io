# Dron Savaşı — Mimari

## Hedef ve çıktı
- **Çıktı: Android APK** (`release/DronSavasi.apk`). Oyun kodu Vanilla JS (ES2022) ile yazılır; esbuild tek bir `dist/index.html` üretir (JS, CSS, sprite sayfaları ve font gömülü). APK bu dosyayı yerel bir WebView kabuğunda (`android/`) `https://appassets.androidplatform.net/` kökeninden sunar. Bu sayede IndexedDB, CompressionStream ve WebGL2 güvenli kökende çalışır, oyun tamamen offline'dır.
- APK, Gradle kullanılmadan `aapt2 → javac → d8 → zipalign → apksigner` hattıyla derlenir (`tools/build-apk.sh`). minSdk 26, targetSdk 35.

## Kararlar (belirsiz noktalarda verilenler)
| Konu | Karar | Gerekçe |
|---|---|---|
| Motor | Kendi ECS + WebGL2 batch, harici çalışma zamanı kütüphanesi yok | Simülasyon/render ayrımı, determinizm, küçük paket boyutu |
| Paketleme | HTML yerine APK (kullanıcı isteği) | WebView kabuğu en hızlı ve güvenilir yol; kod tabanı aynı kalır |
| Sanat | Tamamen prosedürel (0.16'dan itibaren harici görsel yok) | `render/art.js`: ışık/gölge rampaları (gölgede maviye, ışıkta sarıya kayma), renkli dış hat, pişmiş yarı saydam gölge. Palet 64 temel renk + rampa türevleri. Kullanıcı onaylı görsel kimlik |
| Font | Pixelify Sans (OFL), npm `@fontsource`, woff2 gömülü | Türkçe karakter desteği, piksel stil |
| Zaman ölçeği | 1 tick = 1 oyun dakikası, 10 tick/sn (1x). 1 gün = 144 sn, mevsim = 10 gün | Gün–gece döngüsü gözle görülür |
| Ölçek | Menziller karo cinsinden (1 karo ≈ 250 m kurgusal) | Okunur oynanış |
| Ekonomi | Ulusal stok + konvoyla taşınan hammadde. Boru hattıyla bağlı kuyular doğrudan stoğa aktarır. Fabrikalar ancak yol ağıyla depoya bağlıysa tam hızda çalışır | Orta detay, okunur zincir |
| Dış piyasa | Parayla ithalat (savaşta %50 abluka primi) | Kaynağı eksik ülkede kilitlenmeyi önler |
| İkmal | Depo menzili + sahaya giden ikmal konvoyu (geçici ikmal noktası) | Konvoy avcılığı anlamlı hâle gelir |
| Sınırlar | Başlangıçta tüm kara Voronoi benzeri Dijkstra ile ülkelere bölünür; çekirdek küçüktür. Sınır kara birlikleriyle kayar | Sabit olmayan sınırlar, dinamik cephe |
| Zafer | Başkent düşerse ülke ilhak edilir; teslimiyet puanı (toprak kaybı, moral, enerji, ordu) 0,7'yi aşarsa teslim olur. Sonda yalnız müttefikler kaldığında ittifaklar dağılır | "Tek kazanan" kuralı |
| Hava savunma ağı | SAM'in kendi radarı kısa menzillidir. Tam menzil için ağa bağlı (haberleşme) bir radar izi gerekir | "Radar ağı olmadan SAM'ler kör" ilkesi |
| EH | 6 bant; jammer en fazla 2 bandı (uyarlanır karıştırma tekniğiyle 3) karıştırır ve gözlemlediği banda yaklaşık 160 tick'te uyum sağlar. Fiber dron bağışıktır | Frekans uyum yarışı |
| Başlangıç (0.17) | `phase='setup'`: oyuncu `FOUND_CAPITAL` ile yer seçer; tüm insanlar yerleşince YZ aday yerlerden en uzak + kaynakça zengin olanlara yerleşir. Kurulumda tick ilerler ama saat işlemez (`setupTicks`) | Lockstep uyumu |
| Sınır (0.17) | Sahipsiz dünya; şehir yarıçapı nüfusla büyür (üst sınır), çevresi +5 karo sahiplenilir (`sim/territory.js`) | Kullanıcı isteği |
| Rezerv (0.17) | Yatak kümesi başına çarpık dağılımlı rezerv; birim dönüşümü `RES_UNIT` | Ticaret ihtiyacı |
| Grafik (0.17) | Karo 32 px; 16 px tasarım `Art(S=2)` ile geometri ölçeklenir, detay yerel çözünürlükte; chunk 16 karo (512 px); zoom<1 genel bakış dokusu | Daha yüksek kalite |
| Sis seçeneği | `opts.fog=false` iken tüm ülkelerin görüşü tam (YZ dahil); hava hedeflerinin radar algılaması değişmez | Kullanıcı isteği, eşit kural |
| Savaş sisi | Ülke başına 4×4 karolık hücre ızgarası (son görülme). Kendi toprağı her zaman görünür. İstihbarat belleği `known` haritasında tutulur | YZ hile yapmaz, aynı sise tabidir |
| Trig | Simülasyonda sin/cos/atan2 yok; yalnız + − × ÷ ve √ | IEEE-754'te motorlar arası deterministik (lockstep) |

## Katmanlar
```
src/
  core/    rng (mulberry32, hash), ecs (SoA TypedArray varlık deposu), commands (Command kuyruğu), math, storage (IndexedDB+gzip)
  data/    palette (64 renk), defs (kaynak/birim/mermi/kalem/AD sistemleri), buildings, tech, ai (kişilik/zorluk)
  world/   noise, mapgen (öncelikli taşkın drenajı, nehir, göl, kaynak, ülke, yol/köprü), map (A*, yol bileşenleri), names (isim/bayrak)
  sim/     sim (tick sırası), build, networks (elektrik/yakıt/haberleşme/su/ulaşım grafikleri), economy, logistics,
           air (dron davranışları), missiles, airdefense, ew (karıştırma, GPS, SIGINT, sis), ground, diplomacy, weather, damage, route, serialize
  ai/      ai (stratejik/operasyonel/taktik), aieco (inşa/üretim/araştırma planlayıcı)
  render/  gl (WebGL2 batch + Canvas2D yedek, ışık FBO), pixel (piksel tampon ilkelleri), sprites (prosedürel üreteç + atlas), terrain (chunk pişirici), particles, view (sahne)
  ui/      game (döngü, kamera, seçim, modlar), input (dokunmatik), hud, panels, menu, dom
  audio/   synth (WebAudio sentezi)
  net/     transport (LocalPair, BroadcastChannel, WebSocket), lockstep (LocalBus/LockstepBus)
  i18n/    i18n + tr tablosu
```
Bağımlılık yönü: `render/ui → sim → core/data/world`. `sim` DOM'a dokunmaz; Node'da headless çalışır (`tests/`).

## ECS
- `EntityStore` SoA sütunları (Float32/Int32/Uint8/Uint16/Uint32). Kapasite 32k (1024 haritada 64k).
- `mask` = bileşen bitleri (`C.*`), `flags` = durum (`F.*`). Sistemler `0..hi` taraması yapar; ölüm ertelenir (`kill` → `flush`). Serbest liste deterministik yeniden kullanım sağlar.
- Yan tablolar: `routes` (Float32/Int32 rota), `cityInfo`, ülke `known/emitters` (Map, ekleme sırası deterministik).
- Uzamsal ızgara (8 karo hücre, bağlı liste) her tick yeniden kurulur.

## Simülasyon tick sırası (deterministik)
1. Komutlar (tick, ülke, sıra no ile sıralı) ve gecikmeli emirler
2. YZ (yalnız komut üretir; ülkeler farklı tick'lere yayılır)
3. Hava, zaman, mevsim
4. Ağlar: ulaşım bileşenleri, elektrik, yakıt, haberleşme, su (kirli bayrak + periyodik)
5. İnşaat, ekonomi (üretim, araştırma, şehirler, vergi, onarım), lojistik (konvoylar, ikmal)
6. Uzamsal ızgara → sensörler (radar, görsel) → EH (karıştırma/GPS) → sis (5 tick) → SIGINT (10 tick)
7. Hava birimleri → mermiler → hava savunma → kara birimleri → sel
8. Diplomasi, teslimiyet, zafer → `flush`

## Altyapı ağları
- **Elektrik:** düğümler = santral + trafo (aynı sahip, 14 karo × akıllı şebeke). Tüketiciler 9 karo (şehir 12) içindeki en yakın düğüme bağlanır. Union-find bileşenleri, bileşen başına arz/talep → doygunluk. Bu doygunluk fabrika hızını, şehir ışıklarını ve radarları belirler. Radar jeneratöre geçer (yakıt harcar).
- **Yakıt:** kuyu, rafineri ve depolar 16 karo içinde boru hattıyla bağlanır.
- **Haberleşme:** karargâh, komuta merkezi, röle ve uydu. Karargâha bağlı bileşen dışında kalan birlikler emirleri 30 tick gecikmeyle alır, radar verileri ağa aktarılamaz.
- **Su:** pompa (elektrikli) ya da baraj 16 karo içinde. Nehir/göl kıyısındaki şehirlerin suyu kısmen karşılanır. Baraj yıkılırsa `down` akış zinciri boyunca sel olur.
- **Ulaşım:** yol/demiryolu karoları, BFS bileşenleri. Köprü yıkılınca bileşenler bölünür, konvoylar yeniden rota bulur ya da mahsur kalır.

## Render
- Arazi 32×32 karoluk chunk'lar hâlinde piksel düzeyinde pişirilir (512² doku, LRU 96, karede 2–3 pişirme). Önbellek mevsim değişince ve harita değişince (krater, yol, sınır, sel) geçersiz olur.
- Sahne: chunk'lar → gölgeler (güneş açısına göre eğik dörtgen) → y-sıralı binalar, evler ve kara birimleri → mermiler → hava birimleri (irtifa ofseti ve yer gölgesi) → parçacıklar → ışık haritası (gece; FBO, çarpımsal) → savaş sisi (doğrusal süzülmüş doku) → katmanlar → seçim → hava (ekran uzayı).
- Tam sayı zoom (1–6), kamera piksele yuvarlanır.
- Takım rengi: sprite'ta macenta maske → ayrı kare → tint ile çarpım. Kenney gri birimleri doğrudan tint'lenir.

## Komut katmanı ve online
- Oyuncu ve YZ dünyayı yalnız `Command` nesneleriyle değiştirir (`core/commands.js`, `registerCommand`).
- UI komutları `bus.submit()` ile gönderir. Tek oyunculuda `LocalBus`, ağda `LockstepBus` kullanılır: girdi gecikmesi 4 tick, her eş her tick için (boş da olsa) paket yollar, tüm eşlerin paketi gelince tick oynanır, her 50 tick'te checksum karşılaştırılır.
- `tests/lockstep.mjs` iki eşi gecikmeli kanal üzerinden çalıştırır ve checksum eşitliğini doğrular.
- 24 ülke: diplomasi matrisleri 24×24, `seenBy` 32 bit maske, palet 24 takım rengi tanımlar. Menüde "24 ülke (deneysel)" seçeneği var.

## Kayıt
- `sim/serialize.js`: dünya seed'den yeniden üretilir. Yalnız değişen katmanlar (sahiplik, yol, sel, doluluk, krater) ile ECS sütunları (base64) ve ülke/diplomasi/YZ durumu saklanır. `SAVE_VERSION` ve `MIGRATIONS` zinciri vardır.
- `core/storage.js`: IndexedDB, gzip (CompressionStream). Yuvalar: `auto` (2 oyun gününde bir ve uygulama arka plana geçtiğinde) ve `slot1..3`.
- `tests/save-roundtrip.mjs`: kayıt → yükleme sonrası 1500 tick boyunca checksum birebir aynı.

## Performans
- Headless, 8 ülke, 256² harita: ortalama ≈0,9 ms/tick, en kötü ≈26 ms (tek seferlik; yol A* yığılması).
- Parçacık havuzu sabit kapasiteli (düşük 1500 / orta 3000 / yüksek 5000). Hava efektleri ekran uzayında ayrı havuzdadır.
- Kalite ayarı: parçacık sayısı, ışık haritası çözünürlüğü (1/4 veya 1/2), gölgeler.

## Bilinen sınırlar / sonraki adımlar
- 100.000+ satır hedefi için genişleme noktaları: yeni birim/bina/teknoloji yalnız veri tablolarına eklenir. Yeni dil için `i18n/xx.js` dosyası eklenip kaydedilir. Sunucu aracılı online için `SocketTransport` ve küçük bir röle sunucusu yeter.
- Seyir füzesi arazi takibi, kaba ızgara A* ile hava savunmasından kaçınma olarak modellenir (yükseklik profili yok).
