// v12 + Sosyal Motor 2 → dist/compute-empire-v13.html
const fs = require('fs'), path = require('path');
const R = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
let html = R('original/compute-empire-v12.html');
const eng = '\n/* ===== SOSYAL MOTOR 2 ===== */\n' + R('src/tr.js') + '\n' + R('src/sm2-engine.js') + '\n';
const start = html.indexOf('OYUN MOTORU'); if (start < 0) throw new Error('motor betiği bulunamadı');
const end = html.indexOf('</script>', start);
html = html.slice(0, end) + eng + html.slice(end);
const uiPath = path.join(__dirname, '../src/sm2-ui.js'), cssPath = path.join(__dirname, '../src/sm2-ui.css');
if (fs.existsSync(cssPath)) html = html.replace('</head>', '<style>\n' + fs.readFileSync(cssPath, 'utf8') + '\n</style>\n</head>');
if (fs.existsSync(uiPath)){ const i = html.lastIndexOf('</body>'); html = html.slice(0, i) + '<script>\n' + fs.readFileSync(uiPath, 'utf8') + '\n</script>\n' + html.slice(i); }
html = html.replace(/<title>([^<]*)<\/title>/, (m, t) => '<title>' + t.replace(/v?12\b/, '13') + '</title>');
fs.mkdirSync(path.join(__dirname, '../dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../dist/compute-empire-v13.html'), html);
console.log('yazıldı:', (html.length / 1024).toFixed(0), 'KB');
