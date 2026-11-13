// v12 + Sosyal Motor 2 → dist/compute-empire-v13.html
const fs = require('fs'), path = require('path');
const R = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
let html = R('original/compute-empire-v12.html');
const eng = '\n/* ===== SOSYAL MOTOR 2 ===== */\n' + R('src/tr.js') + '\n' + R('src/sm2-engine.js') + '\n' + R('src/hb-engine.js') + '\n';
const start = html.indexOf('OYUN MOTORU'); if (start < 0) throw new Error('motor betiği bulunamadı');
const end = html.indexOf('</script>', start);
html = html.slice(0, end) + eng + html.slice(end);
const css = ['src/sm2-ui.css', 'src/hb-ui.css'].map(R).join('\n'), ui = ['src/sm2-ui.js', 'src/hb-ui.js'].map(R).join('\n;\n');
html = html.replace('</head>', '<style>\n' + css + '\n</style>\n</head>');
{ const i = html.lastIndexOf('</body>'); html = html.slice(0, i) + '<script>\n' + ui + '\n</script>\n' + html.slice(i); }
html = html.replace(/<title>([^<]*)<\/title>/, (m, t) => '<title>' + t.replace(/v?12\b/, '13') + '</title>');
fs.mkdirSync(path.join(__dirname, '../dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../dist/compute-empire-v13.html'), html);
console.log('yazıldı:', (html.length / 1024).toFixed(0), 'KB');
