import fs from 'node:fs/promises';
const base=new URL('../',import.meta.url);
const read=p=>fs.readFile(new URL(p,base),'utf8');
const snapshot=await read('dist/jobs.json'),boards=await read('dist/boards.json');
const assets={};
for(const [name,type] of [['index.html','text/html'],['style.css','text/css'],['app.js','text/javascript'],['core.js','text/javascript']])assets['/'+name]={type:type+'; charset=utf-8',body:await read('dist/'+name)};
const source=(await read('dist/core.js')).replace(/^export /gm,'')+'\nconst BOARDS='+boards+';\nconst SNAPSHOT='+snapshot+';\nconst ASSETS='+JSON.stringify(assets)+';\n'+await read('src/worker.mjs');
await fs.mkdir(new URL('dist/server/',base),{recursive:true});await fs.writeFile(new URL('dist/server/index.js',base),source);
console.log('Built Worker with '+JSON.parse(snapshot).jobs.length+' recent fallback listings.');
