const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

http.createServer((request, response) => {
  const urlPath = decodeURIComponent((request.url || '/').split('?')[0]);
  const target = path.resolve(root, `.${urlPath === '/' ? '/index.html' : urlPath}`);
  if (!target.startsWith(root)) return response.writeHead(403).end();
  fs.readFile(target, (error, file) => {
    if (error) return response.writeHead(404).end('Arquivo não encontrado');
    response.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream' });
    response.end(file);
  });
}).listen(4173, '127.0.0.1', () => console.log('Prévia em http://127.0.0.1:4173'));
