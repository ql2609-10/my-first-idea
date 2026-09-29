import {levels,interests,rankJobs,uniqueRecent,safeUrl} from './core.js';
const $=id=>document.getElementById(id);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=s=>new Date(s).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
let catalog=null,latest=[],page=1,lastRefresh=0,inflight=null;
const PAGE_SIZE=20;
function profile(){return {skills:$('skills').value,interest:$('interest').value,location:$('location').value,level:$('level').value};}
function setBusy(busy){$('find').disabled=busy;$('find').textContent=busy?'Updating matches…':'Find my matches';$('jobs').setAttribute('aria-busy',String(busy));}
function updateCatalogStatus(){
 const total=uniqueRecent(catalog.jobs).length;
 const fallback=catalog.mode==='snapshot';
 $('catalog-status').textContent=`${total.toLocaleString()} unique jobs · Last published within 30 days · ${catalog.sourceCount} employer boards`;
 $('data-status').textContent=`${fallback?'Saved collection':catalog.mode==='partial'?'Partially refreshed collection':'Live collection'} · Checked ${date(catalog.fetchedAt)} ${new Date(catalog.fetchedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}${catalog.failedSources?.length?` · ${catalog.failedSources.length} sources unavailable`:''}. ${fallback?'Live refresh unavailable; original pages have the latest status.':'Publication dates can include employer re-postings.'}${total<1000?' Fewer than 1,000 recent listings are currently available; older jobs are excluded.':''}`;
}
function render(){
 if(!catalog)return;
 latest=rankJobs(catalog.jobs,profile());
 const totalPages=Math.max(1,Math.ceil(latest.length/PAGE_SIZE));page=Math.min(page,totalPages);
 $('summary').textContent=`${latest.length.toLocaleString()} results · Best fit first`;
 const start=(page-1)*PAGE_SIZE;
 $('jobs').innerHTML=latest.length?latest.slice(start,start+PAGE_SIZE).map(j=>`<article class="job" data-job="${escape(j.id)}"><div class="job-top"><div class="logo" style="--bg:#eeeaff;--fg:#7763cc">${escape(j.company[0])}</div><div><h3><button class="title-button" data-id="${escape(j.id)}">${escape(j.title)}</button></h3><div class="company">${escape(j.company)} · ${escape(j.department||j.interest)}</div></div><span class="match">${j.score===null?'Recent':`${j.score}% fit`}</span></div><div class="meta"><span>⌖ ${escape(j.location)}</span><span>${j.remote?'Remote · ':''}${levels[j.level]}</span>${j.salary?`<span>${escape(j.salary)}</span>`:''}</div><p class="description">${escape(j.description.replace(/\s+/g,' ').slice(0,210))}…</p><div class="tags">${j.matched.map(s=>`<span class="tag matched">${escape(s)}</span>`).join('')}<span class="tag">Last published ${date(j.publishedAt)}</span></div><div class="job-bottom"><span class="reason">${j.matched.length?`${j.matched.length} of your skills mentioned`:j.interestScore?'Fits your interests':j.experience?'Experience appears to fit':'Review requirements on the original page'}</span><button class="view" data-id="${escape(j.id)}">View opportunity</button></div></article>`).join(''):'<div class="empty"><h3>No recent roles available for this experience filter.</h3><p>Try “Any experience” to browse the full collection. Senior roles are excluded from student and early-career searches.</p></div>';
 $('page-label').textContent=latest.length?`${start+1}–${Math.min(start+PAGE_SIZE,latest.length)} of ${latest.length.toLocaleString()}`:'No results';
 $('previous').disabled=page<=1;$('next').disabled=page>=totalPages;
 updateCatalogStatus();
}
async function refresh(force=false){
 if(inflight)return inflight;
 if(!force&&catalog&&Date.now()-lastRefresh<300000)return;
 inflight=(async()=>{try{
 const res=await fetch('/api/jobs',{signal:AbortSignal.timeout(45000)});
 if(!res.ok)throw Error('Feed unavailable');const data=await res.json();
 if(!Array.isArray(data.jobs)||!data.fetchedAt)throw Error('Invalid feed');
 catalog=data;lastRefresh=Date.now();
 }catch(error){if(!catalog)throw error;catalog={...catalog,mode:'snapshot'};}finally{inflight=null;}})();
 return inflight;
}
async function find(){setBusy(true);try{await refresh();page=1;render();}catch{$('summary').textContent='Could not load jobs. Please try Find my matches again.';}finally{setBusy(false);}}
$('profile').addEventListener('submit',e=>{e.preventDefault();find();});
$('previous').onclick=()=>{page--;render();$('summary').scrollIntoView({block:'start'});};
$('next').onclick=()=>{page++;render();$('summary').scrollIntoView({block:'start'});};
function openJob(id){const j=latest.find(x=>x.id===id);if(!j)return;
 $('detail-content').innerHTML=`<div class="eyebrow">EMPLOYER JOB POSTING</div><h3 id="detail-title">${escape(j.title)}</h3><p>${escape(j.company)} · ${escape(j.location)}<br>${levels[j.level]}${j.salary?` · ${escape(j.salary)}`:''}</p><a class="primary original-link" href="${escape(safeUrl(j.url))}" target="_blank" rel="noopener noreferrer">View original job page / 查看原始招聘页面</a><p class="source-note">Opens the employer’s Ashby posting in a new tab. Last published ${date(j.publishedAt)}; checked ${date(j.checkedAt)}. Availability and requirements are confirmed on the original page.</p><h4>Why this appears</h4><p>${j.matched.length?`Skills mentioned: ${escape(j.matched.join(', '))}. `:''}${j.interestScore?'The category fits your interest. ':''}${j.place?'The location matches your preference. ':''}${j.experience?'The experience appears to fit. ':''}${j.level==='unknown'?'Experience could not be confirmed; read the requirements.':'Experience labels are inferred from the title and description.'}</p><h4>Job description excerpt</h4><div class="full-description">${escape(j.description)}</div><p class="source-note">Fit scores measure profile overlap, not eligibility or hiring probability. Skills 45%, interests 25%, location 15%, experience 15%; blank fields are excluded. Remote jobs may have country or time-zone restrictions.</p>`;
 $('details').showModal();
}
$('jobs').addEventListener('click',e=>{const item=e.target.closest('[data-id], [data-job]');if(!item||window.getSelection()?.toString())return;openJob(item.dataset.id||item.dataset.job);});
$('close').onclick=()=>$('details').close();
$('details').addEventListener('click',e=>{if(e.target===$('details')){const r=$('details').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('details').close();}});
async function boot(){setBusy(true);$('summary').textContent='Loading recent jobs…';try{const res=await fetch('./jobs.json');if(!res.ok)throw Error();catalog=await res.json();catalog.mode='snapshot';render();await refresh(true);render();}catch{$('summary').textContent='Could not load jobs. Please try Find my matches again.';}finally{setBusy(false);}}
boot();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'find_job_matches',title:'Find job matches',description:'Update the profile, refresh recent employer postings, and rank jobs. Returns the first 20 results and total count.',inputSchema:{type:'object',properties:{skills:{type:'string'},interest:{type:'string',enum:interests},location:{type:'string'},level:{type:'string',enum:['student','graduate','junior','any']}},required:['skills','interest','location','level'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},async execute(input){if(!input||typeof input.skills!=='string'||typeof input.location!=='string'||!interests.includes(input.interest)||!['student','graduate','junior','any'].includes(input.level))throw Error('Provide valid skills, interest, location, and experience level.');for(const k of ['skills','interest','location','level'])$(k).value=input[k];await find();if(!catalog)throw Error('Job feeds unavailable.');return {total:latest.length,catalogTotal:uniqueRecent(catalog.jobs).length,matches:latest.slice(0,20).map(({title,company,score,url,publishedAt})=>({title,company,score,url,publishedAt}))};}})).catch(()=>{});}catch{}}
