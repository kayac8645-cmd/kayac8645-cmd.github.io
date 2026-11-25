// v12 + Sosyal Motor 2 → dist/compute-empire-v13.html
const fs = require('fs'), path = require('path');
const R = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
let html = R('original/compute-empire-v12.html');
const eng = '\n/* ===== SOSYAL MOTOR 2 ===== */\n' + R('src/tr.js') + '\n' + R('src/sm2-engine.js') + '\n' + R('src/hb-engine.js') + '\n' + R('src/lab-engine.js') + '\n' + R('src/world-engine.js') + '\n' + R('src/perf.js') + '\n';
const start = html.indexOf('OYUN MOTORU'); if (start < 0) throw new Error('motor betiği bulunamadı (kaynak v12 dosyası olmalı)');
const end = html.indexOf('</script>', start);
html = html.slice(0, end) + eng + html.slice(end);
const css = ['src/sm2-ui.css', 'src/hb-ui.css'].map(R).join('\n'), ui = ['src/sm2-ui.js', 'src/hb-ui.js', 'src/lab-ui.js', 'src/world-ui.js'].map(R).join('\n;\n');
html = html.replace('</head>', '<style>\n' + css + '\n</style>\n</head>');
{ const i = html.lastIndexOf('</body>'); html = html.slice(0, i) + '<script>\n' + ui + '\n</script>\n' + html.slice(i); }
html = html.replace(/<title>([^<]*)<\/title>/, (m, t) => '<title>' + t.replace(/v?12\b/, '13') + '</title>');
fs.mkdirSync(path.join(__dirname, '../dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../dist/compute-empire-v13-okunur.html'), html);
const min = require('./minify')(html);
fs.writeFileSync(path.join(__dirname, '../dist/compute-empire-v13.html'), min);
const kb = x => (Buffer.byteLength(x) / 1024).toFixed(0);
console.log('yazıldı:', kb(min), 'KB (okunur sürüm', kb(html), 'KB)');
