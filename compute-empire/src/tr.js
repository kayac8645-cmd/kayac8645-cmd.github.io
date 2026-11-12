/* ============================================================
   SOSYAL MOTOR 2 — TÜRKÇE BİÇİMBİLGİSİ (TR)
   Özel isim + ek: ünlü uyumu, kaynaştırma (n/y), ünsüz sertleşmesi (d→t),
   sayı ve kısaltma okunuşu. Örnek: TR.ek('GPU','in') → "GPU'nun", TR.ek('3','de') → "3'te"
   ============================================================ */
const TR = (() => {
  const VOW = 'aıoueiöüAIOUEİÖÜ';
  const SERT = 'fstkçşhpFSTKÇŞHP';
  const DIG = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
  const TEN = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
  const LET = { A: 'a', B: 'be', C: 'ce', Ç: 'çe', D: 'de', E: 'e', F: 'fe', G: 'ge', Ğ: 'ge', H: 'he', I: 'ı', İ: 'i', J: 'je', K: 'ka', L: 'le', M: 'me',
    N: 'ne', O: 'o', Ö: 'ö', P: 'pe', Q: 'kü', R: 're', S: 'se', Ş: 'şe', T: 'te', U: 'u', Ü: 'ü', V: 've', W: 've', X: 'iks', Y: 'ye', Z: 'ze' };
  const MAG = { K: 'bin', M: 'milyon', B: 'milyar', T: 'trilyon' };
  // Bir tam sayının okunuşunun son kelimesi
  function numTail(s){
    s = s.replace(/^0+(?=\d)/, '');
    const n = s.length;
    if (n > 12) return 'trilyon';
    const groups = []; for (let i = n; i > 0; i -= 3) groups.unshift(s.slice(Math.max(0, i - 3), i));
    const g = groups[groups.length - 1], gi = groups.length - 1;
    if (+g === 0){ if (gi === 0) return 'sıfır'; for (let k = groups.length - 2; k >= 0; k--) if (+groups[k]) return ['', 'bin', 'milyon', 'milyar'][groups.length - 1 - k]; return 'sıfır'; }
    const v = +g, o = v % 10, t = Math.floor(v / 10) % 10;
    if (o) return DIG[o];
    if (t) return TEN[t];
    return 'yüz';
  }
  // Kelimenin okunuşunun son parçası (ünlü uyumu için)
  function spoken(w){
    w = String(w).trim().replace(/[)"”’»\]]+$/, '');
    let m;
    if ((m = w.match(/(\d+)([KMBT])$/))) return MAG[m[2]];
    if ((m = w.match(/[.,](\d+)$/))) return /^0+$/.test(m[1]) ? 'sıfır' : numTail(m[1].length > 1 && m[1][0] === '0' ? m[1].slice(-1) : m[1]);
    if ((m = w.match(/(\d+)$/))) return numTail(m[1]);
    if ((m = w.match(/%(\d+)/)) && /%\d+$/.test(w)) return numTail(m[1]);
    const last = w.split(/[\s\-_/]+/).pop() || w;
    if (/^[A-ZÇĞİÖŞÜ]{2,5}$/.test(last) && !/^(ALT|ART|ASK)$/.test(last) && !/[AEIİOÖUÜ][^AEIİOÖUÜ][AEIİOÖUÜ]/.test(last)) return LET[last[last.length - 1]] || 'e';
    if (/^[A-ZÇĞİÖŞÜ]$/.test(last)) return LET[last] || 'e';
    return last;
  }
  function lastVowel(s){ for (let i = s.length - 1; i >= 0; i--) if (VOW.includes(s[i])) return s[i].toLocaleLowerCase('tr'); return 'e'; }
  function endsVowel(s){ return VOW.includes(s[s.length - 1]); }
  function endsSert(s){ return SERT.includes(s[s.length - 1]); }
  const V2 = v => 'aıou'.includes(v) ? 'a' : 'e';
  const V4 = v => ({ a: 'ı', ı: 'ı', o: 'u', u: 'u', e: 'i', i: 'i', ö: 'ü', ü: 'ü' })[v] || 'i';
  // tür: in (ilgi), i (belirtme), e (yönelme), de (bulunma), den (ayrılma), le (vasıta), ki (deki), mi (soru, ayrı yazılır), dir
  function suf(word, type){
    const sp = spoken(word), v = lastVowel(sp), ev = endsVowel(sp), es = endsSert(sp);
    const a = V2(v), i = V4(v), d = es ? 't' : 'd';
    switch (type){
      case 'in': return (ev ? 'n' : '') + i + 'n';
      case 'i': return (ev ? 'y' : '') + i;
      case 'e': return (ev ? 'y' : '') + a;
      case 'de': return d + a;
      case 'den': return d + a + 'n';
      case 'deki': return d + a + 'ki';
      case 'le': return (ev ? 'y' : '') + 'l' + a;
      case 'dir': return d + i + 'r';
      case 'ler': return 'l' + a + 'r';
      case 'mi': return 'm' + i;
      default: return '';
    }
  }
  function ek(word, type){
    if (word == null || word === '') return '';
    if (type === 'mi') return word + ' ' + suf(word, 'mi');
    return word + "'" + suf(word, type);
  }
  // Var olan bir ekin türünü tahmin et (düzeltici için)
  function typeOf(x){
    if (/^n?[ıiuü]n$/.test(x)) return 'in';
    if (/^[dt][ae]ki$/.test(x)) return 'deki';
    if (/^[dt][ae]n$/.test(x)) return 'den';
    if (/^[dt][ae]$/.test(x)) return 'de';
    if (/^y?l[ae]$/.test(x)) return 'le';
    if (/^y?[ıiuü]$/.test(x)) return 'i';
    if (/^y?[ae]$/.test(x)) return 'e';
    if (/^[dt][ıiuü]r$/.test(x)) return 'dir';
    if (/^l[ae]r$/.test(x)) return 'ler';
    return null;
  }
  // Metindeki "İsim'ek" yapılarını doğru eke çevirir. names verilirse yalnız onlar, verilmezse büyük harfle başlayan/rakamla biten sözcükler.
  const RE = /([A-Za-zÇĞİÖŞÜçğıöşü0-9][A-Za-zÇĞİÖŞÜçğıöşü0-9.\-%]*)'([a-zçğıöşü]+)/g;
  function fix(text){
    if (!text || text.indexOf("'") < 0) return text;
    return text.replace(RE, (all, w, x) => {
      if (!/^[A-ZÇĞİÖŞÜ0-9%]/.test(w) && !/\d$/.test(w)) return all;
      const t = typeOf(x); if (!t) return all;
      const ok = suf(w, t);
      return ok === x ? all : w + "'" + ok;
    });
  }
  // Denetim: metindeki hatalı ek sayısı
  function errors(text){
    let n = 0; if (!text || text.indexOf("'") < 0) return 0;
    text.replace(RE, (all, w, x) => { if (/^[A-ZÇĞİÖŞÜ0-9%]/.test(w) || /\d$/.test(w)){ const t = typeOf(x); if (t && suf(w, t) !== x) n++; } return all; });
    return n;
  }
  // Şablon doldurucu: {ad} veya {ad:ek}; değer yoksa null döner
  function fill(tpl, v){
    let miss = false;
    const out = tpl.replace(/\{(\w+)(?::(\w+))?\}/g, (_, k, t) => {
      const x = v[k]; if (x == null || x === '') { miss = true; return ''; }
      return t ? ek(String(x), t) : String(x);
    });
    return miss ? null : out;
  }
  const up1 = s => s ? s.charAt(0).toLocaleUpperCase('tr') + s.slice(1) : s;
  const low1 = s => s && !/^[A-ZÇĞİÖŞÜ]{2,}/.test(s) && !/^[A-ZÇĞİÖŞÜ][a-zçğıöşü]+ (Labs|AI)/.test(s) ? s.charAt(0).toLocaleLowerCase('tr') + s.slice(1) : s;
  return { ek, suf, fix, errors, fill, spoken, up1, low1 };
})();
if (typeof module !== 'undefined' && module.exports && !module.exports.TR) module.exports.TR = TR;
