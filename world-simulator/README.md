# World Simulator — Living Planet

Tarayıcıda çalışan, prosedürel 3D gezegen ve yaşam simülasyonu. İklim, su döngüsü, ekosistem,
insan yerleşimleri ve doğal felaketler birbirine bağlı sistemler olarak bir Web Worker içinde
simüle edilir; Three.js ile 3D olarak görüntülenir. Harici API gerekmez, tamamen yerel çalışır.

## Hızlı başlangıç

```bash
cd world-simulator
npm install          # bağımlılıklar
npm run dev          # geliştirme sunucusu → http://localhost:5173
```

Sunucu `0.0.0.0:5173` adresini dinler (`vite.config.ts`, `strictPort`).
Durdurmak için sunucunun çalıştığı terminalde **Ctrl + C**.
Arka planda başlattıysanız: `pkill -f vite` (Linux/macOS) veya Görev Yöneticisi'nden `node` sürecini kapatın.

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu, port **5173**, tüm ağ arabirimlerinde |
| `npm run build` | TypeScript kontrolü + üretim derlemesi (`dist/`) |
| `npm run preview` | Derlenmiş sürümü sunar, port **4173**, `0.0.0.0` |
| `npm run typecheck` | Yalnızca TypeScript kontrolü |
| `npm test` | Simülasyon çekirdeği ve IndexedDB birim testleri (Vitest) |
| `npm run e2e` | Gerçek tarayıcıda uçtan uca duman testi (Playwright, sunucu açık olmalı) |
| `npm run build:pages` | GitHub Pages için depo kökündeki `world-sim/` klasörüne derler |

### Telefondan / yerel ağdan erişim

1. Bilgisayar ile telefon aynı Wi-Fi ağında olmalı.
2. `npm run dev` çıktısındaki **Network** satırı adresi verir, ör. `http://192.168.1.42:5173/`.
3. Adresi elle bulmak için:
   - Linux: `hostname -I` · macOS: `ipconfig getifaddr en0` · Windows: `ipconfig` (IPv4 Address)
4. Telefonda `http://<IP-adresi>:5173/` açın. Açılmazsa güvenlik duvarında 5173 portuna izin verin.

URL parametreleri: `?quality=low|medium|high` (grafik kalitesi), `?seed=<değer>` (başlangıç gezegeni).

## Özellikler (durum)

Aşağıdakiler **çalışır ve test edilmiştir** (`npm test`, `npm run e2e`):

- **Gezegen üretimi:** seed tabanlı, deterministik (aynı seed + ayarlar = aynı gezegen). Kara oranı, dağ
  yoğunluğu, okyanus derinliği, orman yoğunluğu, buzul miktarı, başlangıç sıcaklığı, atmosfer yoğunluğu.
  Kıtalar, okyanuslar, dağ sıraları, kıta sahanlığı, nehirler, göller, çöller, ormanlar, buzullar; adlandırılmış kıta/okyanus bölgeleri.
- **3D kamera:** uzay modu (döndürme, yakınlaştırma, atmosfer ve bulutlar) ve yüzey modu (yerel LOD yaması,
  mikro-rölyef, instanced ağaçlar, serbest kaydırma/bakış). Animasyonlu geçişler, dokunmatik jestler, klavye (WASD/QE).
  Yeterince yakınlaşınca yüzey moduna otomatik geçer; bölge kartındaki **Yüzeye in** ile seçili yere ışınlanır.
- **İklim motoru:** sıcaklık, basınç, nem, rüzgâr, yağış, bulut, mevsimler, deniz sıcaklığı/deniz buzu, kar ve buzul;
  buzul hacmine bağlı deniz seviyesi; CO₂ ve aerosol zorlaması.
- **Felaketler (16):** volkan, deprem, tsunami, kasırga, hortum, orman yangını, sel, kuraklık, aşırı soğuma,
  aşırı sıcaklık, asteroit, meteor yağmuru, buzul çağı, büyük fırtına, küresel iklim değişimi, salgın.
  Her biri konum, şiddet, süre ve etki alanına sahiptir; başlat / durdur / tümünü sıfırla. Etkileri gerçek simülasyon
  alanlarına uygulanır (bitki örtüsü, hayvanlar, toprak suyu, sıcaklık/yağış zorlaması, aerosol, arazi, yerleşimler).
  Doğal (kendiliğinden) olaylar açılıp kapatılabilir.
- **Ekosistem:** otlar, çalılar, ağaçlar, otçullar (2), etçiller (2), kuşlar, balıklar, böcekler, toprak mikroorganizmaları,
  plankton. Popülasyon tabanlı; türler yok olabilir, uygun koşullarda yayılarak geri gelebilir. Yeni tür oluşturulabilir.
- **Uygarlık:** yerleşimler, nüfus (doğum/ölüm/göç/salgın), tarım, su, gıda, enerji, teknoloji dönemleri, ekonomi
  göstergesi, ormansızlaşma, avcılık/balıkçılık ve CO₂ emisyonu (iklime geri besleme).
- **Tanrı Modu:** bölge seçme, ısıtma/soğutma, yağış ±, bitki örtüsü, orman, göl, arazi yükseltme/alçaltma, hayvan ekleme,
  yeni tür, yerleşim, felaket başlatma; basılı tutarak sürekli uygulama.
- **Zaman:** duraklat/devam, 1x–1000x (1x = 1 simülasyon günü/sn), +10 / +100 / +1000 / +100 bin / +1 milyon yıl sıçramaları
  (iptal edilebilir). Gün/ay/yıl/mevsim takvimi.
- **Veri katmanları:** normal, sıcaklık, yağış, yükseklik, bitki örtüsü, nüfus, hayvan yoğunluğu, felaket, su kaynakları.
  Bölge detay paneli canlı simülasyon verisi gösterir.
- **Kayıt:** IndexedDB — manuel kayıt, 90 sn'de bir otomatik kayıt, her 25 simülasyon yılında kayıt noktası (son 8 tutulur),
  zaman çizelgesinden kayıt noktasına dönüş, seed kaydetme, olay geçmişi.
- **Performans:** tüm simülasyon Web Worker'da; dokular aktarılabilir buffer ile gönderilir; 3 kalite seviyesi
  (mesh çözünürlüğü, yama/ağaç sayısı, piksel oranı, mipmap); yalnızca yakın bölgede yüksek detay (LOD yaması);
  instanced ağaçlar; frustum culling; dinamik near/far.

## Modelin doğruluğu — ne gerçek, ne yaklaşık

Uygulama içinde **Model** düğmesi ayrıntıları gösterir. Özet:

- **Fiziksel temelli (basitleştirilmiş):** günlük ortalama güneş ışınımı (eğiklik ve mevsim), Budyko–Sellers enerji dengesi,
  albedo geri beslemesi, kara/okyanus ısı kapasitesi, rakımla sıcaklık düşüşü, barometrik basınç, Clausius–Clapeyron nem kapasitesi,
  yarı-Lagrange nem taşınımı, orografik yağış, derece-gün erimesi, CO₂ zorlaması (5,35·ln C/C₀), buzul hacmi → deniz seviyesi,
  priority-flood drenajı.
- **Yaklaşık / sezgisel:** rüzgâr kuşakları, bulut ve yağış eşikleri, ekosistem katsayıları (Holling II, Beddington–DeAngelis,
  allometrik ölçekleme), uygarlık modeli, felaket büyüklükleri.
- **Uzun sıçramalar:** her adımda bir temsili yıl tam modelle hesaplanır, yavaş değişkenler (buzul, CO₂, erozyon, teknoloji)
  aradaki yıllara tahminle yayılır. Kısa süreli dinamikler bu modda çözülmez.

Sonuçlar bilimsel tahmin değildir.

## Mimari

```
src/
  core/        Saf TypeScript simülasyon çekirdeği (DOM yok; Node'da test edilir)
    grid.ts        Izgaralar (sim 160×80, arazi 640×320), koordinatlar
    noise.ts rng.ts  Seed'li simplex gürültü ve PRNG
    terrain.ts     Prosedürel arazi, bölgeler, arazi fırçaları
    climate.ts     Enerji dengesi, rüzgâr, nem/yağış, kar/buz/toprak suyu
    hydrology.ts   Nehirler ve göller (priority-flood + akış birikimi)
    ecosystem.ts   Bitki örtüsü, yangın, hayvan ve mikroorganizma popülasyonları
    civilization.ts Yerleşimler, nüfus, tarım, teknoloji, emisyon
    disasters.ts   16 felaket türü + doğal olaylar
    simulation.ts  Orkestrasyon, araçlar, sorgular, istatistikler, zaman sıçramaları
    paint.ts       Harita katmanlarını ve bulutları dokuya boyar
    state.ts       Durum modeli + serileştirme
  worker/      Simülasyon Web Worker'ı ve mesaj protokolü
  engine/      Three.js: gezegen, atmosfer, bulutlar, LOD yaması, efektler, kamera
  state/       Zustand store + worker istemcisi (otomatik kayıt, kayıt noktaları)
  persistence/ IndexedDB
  ui/          React arayüzü
tests/         Vitest birim testleri
scripts/       Uçtan uca duman testi ve kalibrasyon betikleri
```

## Yol haritası

Aşama 1 (MVP) ve Aşama 2–3'ün temel parçaları uygulanmıştır. Sonraki adımlar:
şehir/ülke düzeyinde uygarlıklar ve ticaret, tektonik plakalar, okyanus akıntıları, genetik/evrimsel tür değişimi,
senaryo editörü, quadtree tabanlı tam gezegen LOD'u.
