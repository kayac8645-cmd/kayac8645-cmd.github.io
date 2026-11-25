// Güvenli küçültme: yalnız <script>/<style> blokları içinde satır başı yorum blokları, tam satır yorumlar, girinti ve boş satırlar.
// JS ayrıştırılmaz; satır ortasındaki hiçbir şeye dokunulmaz.
module.exports = function minify(html){
  const js = src => src
    .replace(/^[ \t]*\/\*[\s\S]*?\*\/[ \t]*\r?\n/gm, '')
    .replace(/^[ \t]*\/\/[^\n]*\r?\n/gm, '')
    .replace(/^[ \t]+/gm, '')
    .replace(/\n{2,}/g, '\n');
  const css = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]+/gm, '').replace(/\n{2,}/g, '\n');
  return html
    .replace(/(<script>)([\s\S]*?)(<\/script>)/g, (m, a, b, c) => a + js(b) + c)
    .replace(/(<style>)([\s\S]*?)(<\/style>)/g, (m, a, b, c) => a + css(b) + c);
};
