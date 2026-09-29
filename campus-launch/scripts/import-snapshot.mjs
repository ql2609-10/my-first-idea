import fs from 'node:fs/promises';
import {normalizeJob,uniqueRecent} from '../dist/core.js';
const boards=JSON.parse(await fs.readFile(new URL('../dist/boards.json',import.meta.url)));
const feeds=(await Promise.all(process.argv.slice(2).map(async p=>JSON.parse(await fs.readFile(p))))).flat();
const jobs=uniqueRecent(feeds.flatMap(f=>f.jobs.map(j=>normalizeJob(j,boards.find(b=>b.slug===f.board))).filter(Boolean)));
if(jobs.length<1000)throw Error(`Only ${jobs.length} recent jobs; refusing to claim 1,000.`);
await fs.writeFile(new URL('../dist/jobs.json',import.meta.url),JSON.stringify({jobs,fetchedAt:new Date().toISOString(),recentDays:30,sourceCount:boards.length,failedSources:[],mode:'snapshot'}));
console.log(JSON.stringify({count:jobs.length,sources:boards.length,levels:jobs.reduce((o,j)=>(o[j.level]=(o[j.level]||0)+1,o),{})}));
