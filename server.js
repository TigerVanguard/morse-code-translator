const morse = require('@ozdemirburak/morse-code-translator');
const http = require('http');
const url = require('url');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 设置CORS头，允许前端页面访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 解析URL参数
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  // 处理编码请求
  if (path === '/encode' && query.text) {
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
  else if (path === '/decode' && query.morse) {
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
  else if (path === '/characters') {
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
  console.log(`- 编码: http://localhost:${PORT}/encode?text=SOS`);
  console.log(`- 解码: http://localhost:${PORT}/decode?morse=...+---+...`);
  console.log(`- 字符集: http://localhost:${PORT}/characters`);
});