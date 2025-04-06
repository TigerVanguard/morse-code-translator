const morse = require('@ozdemirburak/morse-code-translator');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 设置CORS头，允许前端页面访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 解析URL参数
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  console.log(`收到请求: ${pathname}`);
  
  // 处理根路径请求，提供index.html
  if (pathname === '/' || pathname === '/index.html') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('服务器错误: ' + err.message);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }
  
  // 处理静态文件请求
  if (pathname.startsWith('/src/')) {
    const filePath = path.join(__dirname, pathname);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('文件未找到');
        return;
      }
      
      // 根据文件扩展名设置正确的Content-Type
      const ext = path.extname(filePath);
      let contentType = 'text/plain';
      
      if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.json') contentType = 'application/json';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }
  
  // 处理编码请求
  if (pathname === '/encode' && query.text) {
    const options = {
      priority: parseInt(query.priority || '1'),
      dash: query.dash || '-',
      dot: query.dot || '.',
      space: query.space || '/',
      separator: query.separator || ' '
    };
    
    const encoded = morse.encode(query.text, options);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ result: encoded }));
  }
  // 处理解码请求
  else if (pathname === '/decode' && query.morse) {
    const options = {
      priority: parseInt(query.priority || '1'),
      dash: query.dash || '-',
      dot: query.dot || '.',
      space: query.space || '/',
      separator: query.separator || ' '
    };
    
    const decoded = morse.decode(query.morse, options);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ result: decoded }));
  }
  // 处理字符集请求
  else if (pathname === '/characters') {
    const options = {
      dash: query.dash || '-',
      dot: query.dot || '.'
    };
    
    const chars = morse.characters(options, query.usePriority === 'true');
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ result: chars }));
  }
  // 处理无效请求
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '无效的请求' }));
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`摩尔斯电码翻译服务器运行在 http://localhost:${PORT}`);
  console.log('可用端点:');
  console.log(`- 主页: http://localhost:${PORT}/`);
  console.log(`- 编码: http://localhost:${PORT}/encode?text=SOS`);
  console.log(`- 解码: http://localhost:${PORT}/decode?morse=...+---+...`);
  console.log(`- 字符集: http://localhost:${PORT}/characters`);
});