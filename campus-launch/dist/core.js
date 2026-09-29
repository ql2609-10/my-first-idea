export const RECENT_DAYS = 30;
export const levels = {student:'Internship',graduate:'Entry level',junior:'1–2 years',experienced:'Experienced',unknown:'Experience not confirmed'};
export const interests = ['', 'Technology','Design','Marketing','Business','Education','Data & Analytics'];
export const normalize = value => String(value || '').toLowerCase().trim();
export function safeUrl(value) { try { const u = new URL(value); return u.protocol === 'https:' && u.hostname === 'jobs.ashbyhq.com' ? u.href : ''; } catch { return ''; } }
export function recent(j, now=Date.now()) {const date=Date.parse(j.publishedAt);return Number.isFinite(date)&&date<=now&&date>=now-RECENT_DAYS*86400000;}
export function inferLevel(title, description, type) {
 const t=normalize(title), d=normalize(description);
 if(/\b(senior|sr\.?|staff|principal|director|head|lead|manager|vp|chief)\b/.test(t))return 'experienced';
 if(type==='Intern'||/\b(intern|internship|co-op)\b/.test(t))return 'student';
 const requirements=[...d.matchAll(/\b(\d{1,2})(?:\s*[-–]\s*\d{1,2})?\s*\+?\s*years?\s+(?:(?:of|in|relevant|professional|industry|related|work|working|hands-on|software|engineering)\s+){0,4}experience/g)].map(m=>+m[1]);
 if(requirements.some(n=>n>=3))return 'experienced';
 if(/\b(new grad|graduate|entry.level|university grad|early career)\b/.test(t))return 'graduate';
 if(/\b(junior|jr\.?)\b/.test(t)||requirements.some(n=>n>=1&&n<=2))return 'junior';
 if(requirements.includes(0))return 'graduate';
 return 'unknown';
}
export function normalizeJob(j, board, now=Date.now()) {
 const url=safeUrl(j.jobUrl);
 if(!j.isListed||!j.title||!url||!recent(j,now))return null;
 const fullDescription=String(j.descriptionPlain||'Full details are available on the original job page.');
 const description=fullDescription.slice(0,6000);
 const area=normalize(`${j.department} ${j.team} ${j.title}`);
 const interest=/data|analytics|statistic/.test(area)?'Data & Analytics':/design|creative|ux|ui\b/.test(area)?'Design':/marketing|content|brand|growth/.test(area)?'Marketing':/education|teacher|learning program/.test(area)?'Education':/engineer|technical|technology|software|research|security|product/.test(area)?'Technology':'Business';
 const locations=[j.location,...(j.secondaryLocations||[]).map(x=>x.location)].filter(Boolean);
 return {id:url,url,title:String(j.title),company:board.name,board:board.slug,department:String(j.department||''),interest,location:[...new Set(locations)].join(' · ')||'Location not specified',remote:j.isRemote===true||j.workplaceType==='Remote',workplaceType:j.workplaceType||'',level:inferLevel(j.title,fullDescription,j.employmentType),employmentType:j.employmentType||'',publishedAt:j.publishedAt,description,salary:String(j.compensation?.scrapeableCompensationSalarySummary||''),checkedAt:new Date(now).toISOString()};
}
export function uniqueRecent(jobs,now=Date.now()) {return [...new Map(jobs.filter(j=>recent(j,now)&&safeUrl(j.url)).map(j=>[j.url,j])).values()];}
function includesTerm(text,term){const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`,'i').test(text);}
function locationText(s){return normalize(s).replace(/\bnyc\b/g,'new york').replace(/\bsf\b/g,'san francisco').replace(/\busa\b|\bu\.s\.\b/g,'united states');}
export function rankJobs(jobs,profile,now=Date.now()) {
 const skills=[...new Set(profile.skills.split(/[,;\n]/).map(normalize).filter(Boolean))].slice(0,30);
 const location=locationText(profile.location);
 return uniqueRecent(jobs,now).filter(j=>profile.level==='any'||j.level!=='experienced').map(j=>{
 const text=normalize(`${j.title} ${j.department} ${j.description}`);
 const matched=skills.filter(s=>includesTerm(text,s));
 const place=location?Number(location==='remote'?j.remote:locationText(j.location).includes(location)):0;
 const interestScore=profile.interest?Number(j.interest===profile.interest):0;
 const experience=profile.level==='any'?0:Number(j.level===profile.level||(profile.level==='junior'&&j.level==='graduate'));
 const weight=(skills.length?45:0)+(profile.interest?25:0)+(location?15:0)+(profile.level!=='any'?15:0);
 const score=weight?Math.round((45*(skills.length?matched.length/skills.length:0)+25*interestScore+15*place+15*experience)/weight*100):null;
 return {...j,matched,score,place,interestScore,experience};
 }).sort((a,b)=>(b.score??0)-(a.score??0)||Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
}
