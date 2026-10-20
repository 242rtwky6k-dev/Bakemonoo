const KEY="bakemono-web-v1";
const exercises=[
["Pec Deck Fly","Gym","Chest",8,15,1,false],["Incline Smith Machine Press","Gym","Chest",6,10,3,false],["Mid-Chest Press","Gym","Chest",8,12,3,false],["Chest Fly","Gym","Chest",10,15,2,false],["Overhead Triceps Extension","Gym","Triceps",8,12,3,false],["Triceps Pushdown","Gym","Triceps",10,15,3,false],["Pronation","Armwrestling","Pronation",8,15,3,true],["Riser","Armwrestling","Riser",8,15,3,true],
["Weighted Pull-Up","Gym","Back",6,10,1,false],["Bodyweight Pull-Up","Gym","Back",6,15,2,false],["Wide-Grip Bent-Over Row","Gym","Back",6,10,3,false],["Single-Arm Row","Gym","Back",8,12,3,true],["Cable Rope Hammer Curl","Gym","Biceps",8,12,3,false],["Cable Straight-Bar Curl","Gym","Biceps",8,12,3,false],["Incline Dumbbell Curl","Gym","Biceps",8,12,2,false],["Cupping","Armwrestling","Cupping",8,15,3,true],["Side Pressure","Armwrestling","Side Pressure",8,15,3,true],
["Pendulum Squat","Gym","Legs",6,10,3,false],["Romanian Deadlift","Gym","Hamstrings",8,10,3,false],["Leg Press","Gym","Quads",10,15,3,false],["Leg Curl","Gym","Hamstrings",10,15,3,false],["Leg Extension","Gym","Quads",12,15,2,false],["Shoulder Press","Gym","Shoulders",6,10,3,false],["Lateral Raise","Gym","Shoulders",12,20,3,false],["Cable Crunch","Gym","Abs",10,15,3,false],["Hanging Knee Raise","Gym","Abs",8,15,3,false]
].map((x,i)=>({id:i,name:x[0],cat:x[1],group:x[2],min:x[3],max:x[4],sets:x[5],side:x[6]}));
const byName=n=>exercises.find(e=>e.name===n);
const planNames={
Monday:["Pec Deck Fly","Incline Smith Machine Press","Mid-Chest Press","Chest Fly","Overhead Triceps Extension","Triceps Pushdown","Pronation","Riser"],
Tuesday:["Weighted Pull-Up","Bodyweight Pull-Up","Wide-Grip Bent-Over Row","Single-Arm Row","Cable Rope Hammer Curl","Cable Straight-Bar Curl","Incline Dumbbell Curl","Cupping","Side Pressure"],
Wednesday:["Pendulum Squat","Romanian Deadlift","Leg Press","Leg Curl","Leg Extension","Shoulder Press","Lateral Raise","Cable Crunch","Hanging Knee Raise"],
Thursday:["Pec Deck Fly","Incline Smith Machine Press","Mid-Chest Press","Chest Fly","Overhead Triceps Extension","Triceps Pushdown","Pronation","Riser"],
Friday:["Weighted Pull-Up","Bodyweight Pull-Up","Wide-Grip Bent-Over Row","Single-Arm Row","Cable Rope Hammer Curl","Cable Straight-Bar Curl","Incline Dumbbell Curl","Cupping","Side Pressure"],
Saturday:["Pendulum Squat","Romanian Deadlift","Leg Press","Leg Curl","Leg Extension","Shoulder Press","Lateral Raise","Cable Crunch","Hanging Knee Raise"],
Sunday:[]
};
let state=JSON.parse(localStorage.getItem(KEY)||'null')||{sessions:[],weights:[],custom:[],plans:planNames};
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function allExercises(){return [...exercises,...state.custom]}
function fmt(n){return Number.isInteger(n)?String(n):Number(n).toFixed(1)}
function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function previous(name){for(const s of state.sessions){const e=s.exercises.find(x=>x.name===name);if(e&&e.sets.length)return e.sets.reduce((a,b)=>b.weight>a.weight||b.weight===a.weight&&b.reps>a.reps?b:a)}return null}
function suggest(e){const p=previous(e.name);if(!p)return null;return p.reps>=e.max?p.weight+(e.cat==="Armwrestling"?1.25:2.5):p.weight}
function today(){return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()]}
function totalVolume(){return state.sessions.reduce((a,s)=>a+s.exercises.reduce((b,e)=>b+e.sets.reduce((c,x)=>c+x.weight*x.reps,0),0),0)}
function render(tab="home"){document.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));({home:home,history:history,routines:routines,progress:progress}[tab]||home)()}
document.querySelector(".tabs").onclick=e=>{if(e.target.dataset.tab)render(e.target.dataset.tab)}
function home(){
 const d=today(), names=state.plans[d]||[];
 const last=state.sessions[0], w=state.weights[0];
 document.getElementById("content").innerHTML=`
 <h2>${d==="Sunday"?"Rest Day":"Today: "+d}</h2>
 ${d==="Sunday"?`<div class="card"><h3>Recovery day</h3><p class="muted">No scheduled training.</p></div>`:`<div class="card"><span class="pill">${names.length} exercises</span><h3>${names.slice(0,2).join(" + ")}${names.length>2?"…":""}</h3><p class="muted">Gym + armwrestling where scheduled.</p><button class="primary" onclick="start('${d}')">START WORKOUT</button></div>`}
 <div class="grid"><div class="card"><span class="muted small">BODY WEIGHT</span><h2>${w?fmt(w.kg)+" kg":"—"}</h2><button class="secondary" onclick="addWeight()">Add</button></div><div class="card"><span class="muted small">WORKOUTS</span><h2>${state.sessions.length}</h2><span class="muted small">${last?"Last: "+new Date(last.date).toLocaleDateString():"Start your first one"}</span></div></div>
 <div class="card"><h3>Quick stats</h3><p class="summary">${totalVolume().toFixed(0)} kg total logged volume</p><p class="summary">${state.sessions.reduce((a,s)=>a+s.exercises.reduce((b,e)=>b+e.sets.length,0),0)} sets logged</p></div>`;
}
function addWeight(){const v=prompt("Body weight (kg)");if(v&&+v>0){state.weights.unshift({date:Date.now(),kg:+v});save();render("home")}}
function start(day){
 const exs=state.plans[day].map(n=>allExercises().find(e=>e.name===n)).filter(Boolean);
 const work=exs.map(e=>({name:e.name,cat:e.cat,group:e.group,min:e.min,max:e.max,side:e.side,sets:[]}));
 document.getElementById("content").innerHTML=`<button class="linkbtn" onclick="render('home')">← Home</button><h2>${day} Workout</h2><div id="workout">${work.map((e,i)=>exerciseHTML(e,i)).join("")}</div><button class="primary" onclick="finish('${day}')">FINISH WORKOUT</button>`;
}
function exerciseHTML(e,i){
 const p=previous(e.name), sug=suggest(e);
 return `<div class="exercise" id="ex${i}"><h3>${esc(e.name)}</h3><p class="summary">${p?`Previous: ${fmt(p.weight)} kg × ${p.reps}`:"No previous data"}${sug!==null?` • Suggested: ${fmt(sug)} kg`:""}</p>
 <div id="sets${i}"></div>
 <div class="row"><input class="input" id="w${i}" type="number" step="0.5" placeholder="kg" value="${sug??""}"><input class="input" id="r${i}" type="number" placeholder="reps" min="1"><button class="secondary" onclick="addSet(${i},${e.side})">Add</button></div>
 ${e.side?`<div class="row" style="margin-top:8px"><button class="secondary" onclick="side(${i},'Left')">Left</button><button class="secondary" onclick="side(${i},'Right')">Right</button></div>`:""}</div>`;
}
let working={};
function addSet(i,hasSide){const w=+document.getElementById("w"+i).value,r=+document.getElementById("r"+i).value;if(!w||!r)return;working[i]??=[];working[i].push({weight:w,reps:r,side:hasSide?(working[i].side||"Right"):null});document.getElementById("sets"+i).innerHTML=working[i].map((s,j)=>`<div class="setrow"><span class="setnum">${j+1}</span><span>${fmt(s.weight)} kg</span><span>${s.reps} reps</span><button class="linkbtn danger" onclick="removeSet(${i},${j})">×</button></div>`).join("")}
function side(i,s){working[i]??=[];working[i].side=s;alert("Next arm: "+s)}
function removeSet(i,j){working[i].splice(j,1);document.getElementById("sets"+i).innerHTML=working[i].map((s,k)=>`<div class="setrow"><span class="setnum">${k+1}</span><span>${fmt(s.weight)} kg</span><span>${s.reps} reps</span><button class="linkbtn danger" onclick="removeSet(${i},${k})">×</button></div>`).join("")}
function finish(day){
 const names=state.plans[day]||[], exs=names.map(n=>allExercises().find(e=>e.name===n)).filter(Boolean);
 const logged=exs.map((e,i)=>({name:e.name,cat:e.cat,group:e.group,sets:working[i]||[]})).filter(e=>e.sets.length);
 state.sessions.unshift({date:Date.now(),title:day+" — "+(names[0]?.includes("Pull")?"Back + Biceps":day==="Wednesday"||day==="Saturday"?"Legs + Shoulders + Abs":"Chest + Triceps"),exercises:logged});
 save();working={};alert("Workout saved. Check History and Progress.");render("home")
}
function history(){
 document.getElementById("content").innerHTML=`<h2>History</h2><div class="card"><input class="input" type="date" id="dateFilter" onchange="filterHistory(this.value)"></div><div id="historyList">${historyList(state.sessions)}</div>`;
}
function historyList(arr){return arr.length?arr.map((s,i)=>`<div class="card"><h3>${esc(s.title)}</h3><p class="muted">${new Date(s.date).toLocaleString()}</p><p class="summary">${s.exercises.reduce((a,e)=>a+e.sets.length,0)} sets • ${s.exercises.reduce((a,e)=>a+e.sets.reduce((b,x)=>b+x.weight*x.reps,0),0).toFixed(0)} kg volume</p><button class="secondary" onclick="viewSession(${i})">View</button></div>`).join(""):`<div class="empty">No completed workouts yet.</div>`}
function filterHistory(v){const a=v?state.sessions.filter(s=>new Date(s.date).toISOString().slice(0,10)===v):state.sessions;document.getElementById("historyList").innerHTML=historyList(a)}
function viewSession(i){const s=state.sessions[i];document.getElementById("content").innerHTML=`<button class="linkbtn" onclick="history()">← History</button><h2>${esc(s.title)}</h2>${s.exercises.map(e=>`<div class="exercise"><h3>${esc(e.name)}</h3>${e.sets.map((x,j)=>`<div class="setrow"><span>${j+1}</span><span>${fmt(x.weight)} kg</span><span>${x.reps} reps</span><span>${x.side||""}</span></div>`).join("")}</div>`).join("")}<button class="secondary" onclick="deleteSession(${i})">Delete workout</button>`}
function deleteSession(i){if(confirm("Delete this workout?")){state.sessions.splice(i,1);save();history()}}
function routines(){
 document.getElementById("content").innerHTML=`<h2>Routines</h2>${Object.keys(state.plans).map(d=>`<div class="card"><div class="row between"><h3>${d}</h3><span class="pill">${state.plans[d].length?"Training":"Rest"}</span></div><p class="muted">${state.plans[d].join(" • ")||"Rest day"}</p><button class="secondary" onclick="editRoutine('${d}')">Edit</button></div>`).join("")}<div class="card"><h3>Add custom exercise</h3><button class="primary" onclick="addExercise()">Create exercise</button></div>`;
}
function editRoutine(d){const names=prompt("Edit exercises for "+d+". Enter names separated by commas:",state.plans[d].join(", "));if(names===null)return;state.plans[d]=names.split(",").map(x=>x.trim()).filter(Boolean);save();routines()}
function addExercise(){const n=prompt("Exercise name");if(!n)return;const cat=confirm("Armwrestling exercise? OK = Armwrestling, Cancel = Gym")?"Armwrestling":"Gym";state.custom.push({id:"c"+Date.now(),name:n,cat,group:"Custom",min:8,max:12,sets:3,side:false});save();routines()}
function progress(){
 const weights=state.weights.slice().sort((a,b)=>a.date-b.date), names=[...new Set(state.sessions.flatMap(s=>s.exercises.map(e=>e.name)))];
 document.getElementById("content").innerHTML=`<h2>Progress</h2><div class="card"><h3>Body Weight</h3>${weights.length?`<canvas id="chart"></canvas>`:`<p class="muted">Add body-weight entries from Home.</p>`}</div><div class="card"><h3>Training</h3><p class="summary">Workouts: ${state.sessions.length}</p><p class="summary">Volume: ${totalVolume().toFixed(0)} kg</p><p class="summary">Tracked exercises: ${names.length}</p></div><div class="card"><h3>PRs</h3>${names.slice(0,10).map(n=>`<p><span class="pr">${esc(n)}</span><br><span class="muted">${best(n)}</span></p>`).join("")||"<p class='muted'>No PRs yet.</p>"}</div>`;
 if(weights.length)drawChart(weights);
}
function best(n){let a=state.sessions.flatMap(s=>s.exercises).filter(e=>e.name===n).flatMap(e=>e.sets);if(!a.length)return"—";let w=Math.max(...a.map(x=>x.weight)),r=Math.max(...a.map(x=>x.reps));return`Best weight: ${fmt(w)} kg • Best reps: ${r}`}
function drawChart(a){const c=document.getElementById("chart"),ctx=c.getContext("2d"),d=devicePixelRatio||1,w=c.clientWidth*d,h=220*d;c.width=w;c.height=h;ctx.scale(d,d);let max=Math.max(...a.map(x=>x.kg)),min=Math.min(...a.map(x=>x.kg)),range=max-min||1;ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.beginPath();a.forEach((x,i)=>{let px=16+i*(w/d-32)/Math.max(1,a.length-1),py=200-(x.kg-min)/range*170;i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.stroke()}
render("home");
