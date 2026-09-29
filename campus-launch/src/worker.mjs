// Shared normalization, BOARDS, SNAPSHOT, and ASSETS are injected by scripts/build.mjs.
let refreshPromise;
async function collectJobs() {
 const jobs=[],failedSources=[];let succeeded=0,index=0;
 await Promise.all(Array.from({length:4},async()=>{
  while(index<BOARDS.length){const board=BOARDS[index++];try{
   const response=await fetch(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board.slug)}`,{signal:AbortSignal.timeout(9000),headers:{Accept:'application/json'}});
   if(!response.ok)throw Error(`HTTP ${response.status}`);
   const data=await response.json();if(!Array.isArray(data.jobs))throw Error('Invalid job feed');
   jobs.push(...data.jobs.map(j=>normalizeJob(j,board)).filter(Boolean));succeeded++;
  }catch{failedSources.push(board.slug);
   // Preserve clearly dated snapshot rows only for sources that could not be checked.
   jobs.push(...SNAPSHOT.jobs.filter(j=>j.board===board.slug));
  }}
 }));
 return {jobs:uniqueRecent(jobs),fetchedAt:succeeded?new Date().toISOString():SNAPSHOT.fetchedAt,recentDays:30,sourceCount:BOARDS.length,failedSources,mode:succeeded===BOARDS.length?'live':succeeded?'partial':'snapshot',liveSourceCount:succeeded};
}
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
export default {
 async fetch(request,env,ctx) {
  const url=new URL(request.url);
  if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  if(url.pathname==='/jobs.json')return json(SNAPSHOT);
  if(url.pathname==='/api/jobs'){
   const key=new Request(`${url.origin}/api/jobs`);
   const cache=globalThis.caches?.default;
   const cached=cache?await cache.match(key):null;
   if(cached)return cached;
   if(!refreshPromise)refreshPromise=collectJobs().finally(()=>{refreshPromise=null;});
   try{const data=await refreshPromise;const response=json(data);
    if(cache&&data.mode==='live')ctx.waitUntil(cache.put(key,response.clone()));
    return response;
   }catch{return json({...SNAPSHOT,jobs:uniqueRecent(SNAPSHOT.jobs),mode:'snapshot'});}
  }
  const asset=ASSETS[url.pathname==='/'?'/index.html':url.pathname];
  if(!asset)return new Response('Not found',{status:404});
  return new Response(request.method==='HEAD'?null:asset.body,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
 }
};
