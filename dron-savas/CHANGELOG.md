# Değişiklik Günlüğü

## 0.16.0 — Yeni görsel kimlik ve arayüz
- **Tüm çizimler yeniden yapıldı (harici görsel yok):** `render/art.js` araç takımı (derinlikli kutu, ışık/gölge rampası, renkli dış hat, yere düşen gölge) ve `render/looks.js` ile 38 binanın tamamı (sağlam/hasarlı/harabe), 11 kara aracı, yukarıdan jet/helikopter/deniz dronu/korvet, 8 tür şehir yapısı (müstakil ev, sıra ev, apartman, ofis kulesi, market, benzinlik, okul, park) ve mevsimlik ağaçlar. Kenney paketleri kaldırıldı.
- **Şehir yerleşimi:** merkezde ofis/apartman, ortada apartman/dükkân/sıra ev, kenarda müstakil ev, okul, park, benzinlik; daha seyrek. Gece pencere ışıkları binanın kendi pencerelerinden; elektrik kesilince sönüyor.
- **Maden yatakları belirlendi:** 7 kaynağın kendi çizimi (paslı kaya, kömür yığını, petrol gölcüğü, gaz bacası, bakır, uranyum/nadir kristali). Haritada ikonlu etiket ("Demir · büyük ✓"), dokununca bilgi kartı ve "Maden/Kuyu kur" düğmesi.
- **Üst şerit:** kısaltmalar kalktı; her kaynak için piksel ikon + sayı, kaydırılabilir şerit, dokununca ad ve saatlik değişim.
- **İnşa arayüzü:** büyük kartlar, ikonlu maliyet (eksik kaynak kırmızı), elektrik/işçi ikonları, basılı tutunca açıklama, yeni "Şehir" sekmesi. Yerleştirme: hayalet ekran ortasında açılır, "✓ Kur / ↻ Tekrar / ✗ İptal" ve sebep satırı.
- **Mini harita kaldırıldı.**
- **Savaş sisi seçeneği:** yeni oyun menüsü ve oyun içi menüden açılıp kapatılır; kapalıyken yapay zekâ da her şeyi görür (eşit kural, `CMD.RULE`).
- **Halk Sığınağı:** yakındaki şehirde bombardımanın moral kaybını yarıya indirir.

## 0.15.0
### Aşama 15 — Online altyapı
- `net/transport.js`: LocalPair (süreç içi), BroadcastChannel (sekmeler arası), WebSocket taşıma.
- `net/lockstep.js`: LocalBus / LockstepBus (4 tick girdi gecikmesi, tick başına paket, 50 tick'te checksum, desync tespiti).
- 24 ülke: matrisler ve maskeler 24'e kadar, menüde deneysel seçenek. `tests/lockstep.mjs` doğrulaması.

### Aşama 14 — Cila, ses, denge, optimizasyon
- WebAudio sentezi: patlama, fırlatma, uçaksavar, alarm, tık, dron vızıltısı, rüzgâr.
- Dış piyasa (ithalat/ihracat, savaşta abluka primi). YZ malzeme darboğazını ithalatla aşıyor.
- Denge: maden/çelik/elektronik tarifleri, ikmal tüketimi, göç hızı, zorluğa bağlı barış süresi, geç oyunda saldırganlık artışı.
- Performans: grup hareketinde yol paylaşımı, yol A*'ında köşe kesme. Tam test paketi `tests/run-all.mjs`.

### Aşama 13 — Düşman YZ
- 6 kişilik (saldırgan, savunmacı, sanayici, fırsatçı, ittifakçı, teknokrat), 4 zorluk (karar aralığı, hata olasılığı, taktik düzeyi; hile yok).
- Stratejik (savaş/barış/ittifak/ihanet, araştırma, bant değişimi), operasyonel (inşa, üretim, ordu konuşlanması, saldırı hedefi, SEAD ve enerji kampanyası, doyurma) ve taktik (MLRS vur-kaç, radar EMCON, önleyici dron) katmanları. Ülkeler farklı tick'lere yayılıyor.

### Aşama 12 — Araştırma ve diplomasi
- 7 dalda 50 teknoloji. Kilit açma ve çarpan etkileri.
- Savaş, ateşkes (süreli), barış, ittifak (müttefikler savaşa katılır), ihanet, ticaret anlaşması, silah satışı. Oyuncuya gelen öneriler.
- Teslimiyet puanı, başkent düşünce ilhak, tek kazanan kuralı.

### Aşama 11 — Kara cephesi
- 7 batalyon tipi, korvet. Tut / ilerle / saldır emirleri, A* yol bulma (köprüsüz nehir geçilmez).
- Tahkimat birikimi, arazi savunma bonusu, topçu atışı, ikmale bağlı güç, dinamik toprak ve cephe çizgisi, bina/şehir ele geçirme.

### Aşama 10 — Elektronik harp
- 6 frekans bandı, jammer bant maskesi ve uyarlanma, frekans atlama direnci, GPS karıştırma ve sahte sinyal (füze ve otonom dron isabeti).
- SIGINT: yayın yapan her şey konumsal hatayla tespit edilir. Savaş sisi ve istihbarat belleği (eskiyen veri solar). EH harita katmanı.

### Aşama 9 — Hava savunma
- Erken uyarı radarı, uzun/orta/kısa SAM, uçaksavar, CIWS, lazer (elektrik ister).
- RCS, alçak irtifa ve hava durumu etkili algılama. Ağ izi / yerel radar kuralı, hedef önceliği, ucuz dronlara pahalı önleyici harcamama kuralı, atış başına maliyet istatistiği. Balistik savunma teknolojisi, gelen füze uyarı çizgileri.

### Aşama 8 — Füzeler ve roketatarlar
- MLRS (salvo, vur-kaç ifşası), güdümlü roket, seyir (hava savunmasından kaçan alçak rota), balistik (yüksek yay), gemisavar, radar avcısı (radar kapanırsa kilit kaybı).
- Stoktan tüketim, keşif verisine bağlı CEP isabet modeli.

### Aşama 7 — Dronlar ve hava birimleri
- 11 dron sınıfı, savaş uçağı ve helikopter. Görevler (hedef / çizilen rota / devriye), sürü ayrışması, rüzgâr sürüklenmesi, batarya, eve dönüş.
- Kontrol istasyonu menzili, röle kule ve dronları, bağlantı kaybı, karıştırma, fiber dron kablo menzili, ana gemi salımı, deniz dronunun su rotası.

### Aşama 6 — Lojistik
- Hammadde konvoyları (maden/kuyu → depo), ikmal konvoyları (depo → cephe, sahada ikmal noktası).
- Demiryolu hız bonusu, köprü yıkılınca yeniden rota, konvoyların vurulabilmesi.

### Aşama 5 — Altyapı ağları
- Elektrik (union-find bileşenleri, arz/talep, jeneratör), yakıt boru hattı, haberleşme (gecikmeli emir, paylaşılamayan radar), su (pompa/baraj, sel), ulaşım bileşenleri.
- Harabe, yangın, öncelikli onarım (mühendis bonusu, çelik tüketimi).

### Aşama 4 — İnşa ve ekonomi
- 38 bina, yerleştirme kuralları (yatak, nehir, kıyı, su), otomatik yol ve köprü, gömülü/dağınık kurulum.
- 13 kaynak, tarif zincirleri, iş gücü, şehir nüfusu, moral ve göç, vergi.

### Aşama 3 — Işık ve atmosfer
- Gün-gece, FBO ışık haritası (pencere, sokak lambası, pist ışığı, yangın, patlama). Elektriği kesilen şehir kararır.
- Güneşe göre eğik gölgeler. Yağmur, kar, sis, fırtına (simülasyona etkili); mevsimler ve çamur.
- Parçacık havuzu: duman kolonu, ateş, kıvılcım, şok halkası, enkaz, iz.

### Aşama 2 — Dünya
- Değer gürültüsü + sırt gürültüsü ile kıta, öncelikli taşkın drenajı ile nehir ve göller, jeolojiye bağlı 7 kaynak, ülkeler, başkent ve kasabalar, yol ve köprüler.
- 32×32 chunk pişirici: piksel düzeyinde geçişler, yamaç gölgesi, kıyı köpüğü, nehir/yol/demiryolu autotile, kraterler, sınır ve cephe çizgisi, mevsimlik ağaçlar.

### Aşama 1 — Çekirdek
- esbuild tek dosya, APK hattı (WebView kabuğu, imzalama), SoA ECS, deterministik RNG, komut kuyruğu, sabit adım + interpolasyon, tam sayı zoom kamerası, dokunmatik jestler, IndexedDB + gzip kayıt, sürüm ve migration.
