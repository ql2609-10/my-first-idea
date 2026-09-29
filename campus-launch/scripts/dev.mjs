import http from 'node:http';
import worker from '../dist/server/index.js';
const server=http.createServer(async(req,res)=>{try{const response=await worker.fetch(new Request('http://localhost:5179'+req.url,{method:req.method}),{},{waitUntil:p=>p.catch(console.error)});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(e){console.error(e);res.writeHead(500);res.end('Local server error');}});
server.listen(5179,'127.0.0.1',()=>console.log('Local: http://localhost:5179'));
