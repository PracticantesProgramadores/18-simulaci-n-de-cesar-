const app=document.getElementById('app');
const startScreen=document.getElementById('start-screen');
const gameScreen=document.getElementById('game-screen');
const finalScreen=document.getElementById('final-screen');
const btnStart=document.getElementById('btn-start');
const btnMusic=document.getElementById('btn-music');
const cards=document.getElementById('cards');
const levelIndicator=gameScreen.querySelector('.level-indicator');
const progressFill=gameScreen.querySelector('.progress-fill');
const progressText=gameScreen.querySelector('.progress-text');
const starsDisplay=gameScreen.querySelectorAll('.star');
const btnNext=document.getElementById('btn-next');
const btnRestart=document.getElementById('btn-restart');
const btnAnswers=document.getElementById('btn-answers');
const answersModal=document.getElementById('answers-modal');
const answersContainer=document.getElementById('answers');
const btnClose=document.getElementById('btn-close');
const sparkleRoot=document.getElementById('sparkle');

let audioCtx;
let musicOn=false;
let musicNodes=[];
let levelIndex=0;
let levels=[];
let mistakes=0;
let solvedCount=0;
let totalCount=0;
let starsEarnedPerLevel=[];
let firstTryCorrect=0;
let firstTryWrong=0;

const levelData=[
  {
    title:'Nivel 1 — Identifica el Comparative',
    mode:'comparative',
    items:[
      {s:'My sister is ____ than me. (tall)',c:'taller',pool:['taller','more interesting','smaller','colder','easier','more dangerous','more expensive','farther','further']},
      {s:'This book is ____ than the movie. (interesting)',c:'more interesting',pool:['taller','more interesting','smaller','colder','easier','more dangerous','more expensive','farther','further']},
      {s:'The red bag is ____ than the blue one. (small)',c:'smaller',pool:['taller','more interesting','smaller','colder','easier','more dangerous','more expensive','farther','further']},
      {s:'Today is ____ than yesterday. (cold)',c:'colder',pool:['taller','more interesting','smaller','colder','easier','more dangerous','more expensive','farther','further']},
      {s:'Math is ____ than English for me. (easy)',c:'easier',pool:['taller','more interesting','smaller','colder','easier','more dangerous','more expensive','farther','further']},
      {s:'A lion is ____ than a dog. (dangerous)',c:'more dangerous',pool:['taller','more interesting','smaller','colder','easier','more dangerous','more expensive','farther','further']},
      {s:'My car is ____ than yours. (expensive)',c:'more expensive',pool:['taller','more interesting','smaller','colder','easier','more dangerous','more expensive','farther','further']},
      {s:'The river is ____ from here than I thought. (far)',c:'farther',pool:['taller','more interesting','smaller','colder','easier','more dangerous','more expensive','farther','further']}
    ]
  },
  {
    title:'Nivel 2 — Elige el Superlative',
    mode:'superlative',
    items:[
      {s:'The cheetah is the ____ animal on land. (fast)',c:'fastest',pool:['fastest','most intelligent','highest','most boring','biggest','best','hottest','most beautiful']},
      {s:'Maria is the ____ student in my class. (intelligent)',c:'most intelligent',pool:['fastest','most intelligent','highest','most boring','biggest','best','hottest','most beautiful']},
      {s:'That mountain is the ____ in the world. (high)',c:'highest',pool:['fastest','most intelligent','highest','most boring','biggest','best','hottest','most beautiful']},
      {s:'This is the ____ movie I have ever seen. (boring)',c:'most boring',pool:['fastest','most intelligent','highest','most boring','biggest','best','hottest','most beautiful']},
      {s:'Elephants are the ____ animals in the jungle. (big)',c:'biggest',pool:['fastest','most intelligent','highest','most boring','biggest','best','hottest','most beautiful']},
      {s:'My dad is the ____ cook at home. (good)',c:'best',pool:['fastest','most intelligent','highest','most boring','biggest','best','hottest','most beautiful']},
      {s:'That was the ____ day of the year. (hot)',c:'hottest',pool:['fastest','most intelligent','highest','most boring','biggest','best','hottest','most beautiful']},
      {s:'She is the ____ girl in the group. (beautiful)',c:'most beautiful',pool:['fastest','most intelligent','highest','most boring','biggest','best','hottest','most beautiful']}
    ]
  },
  {
    title:'Nivel 3 — Mixed Challenge',
    mode:'mixed',
    items:[
      {s:'Medellín is the ____ city in Colombia. (modern)',c:'more modern',pool:['more modern','more difficult','funnier','fatter','best','bigger','the kindest','heavier']},
      {s:'This exercise is ____ than the last one. (difficult)',c:'more difficult',pool:['more modern','more difficult','funnier','fatter','best','bigger','the kindest','heavier']},
      {s:'My brother is ____ than me. (funny)',c:'funnier',pool:['more modern','more difficult','funnier','fatter','best','bigger','the kindest','heavier']},
      {s:'Gordon is ____ than Tom. (fat)',c:'fatter',pool:['more modern','more difficult','funnier','fatter','best','bigger','the kindest','heavier']},
      {s:'This is the ____ place to eat pizza. (good)',c:'best',pool:['more modern','more difficult','funnier','fatter','best','bigger','the kindest','heavier']},
      {s:'Elephants are ____ than horses. (big)',c:'bigger',pool:['more modern','more difficult','funnier','fatter','best','bigger','the kindest','heavier']},
      {s:'She is the ____ person I know. (kind)',c:'the kindest',pool:['more modern','more difficult','funnier','fatter','best','bigger','the kindest','heavier']},
      {s:'My backpack is ____ than yours. (heavy)',c:'heavier',pool:['more modern','more difficult','funnier','fatter','best','bigger','the kindest','heavier']}
    ]
  }
];

function buildLevels(){
  firstTryCorrect=0;firstTryWrong=0;
  levels=levelData.map(l=>({title:l.title,mode:l.mode,items:l.items.map(it=>({s:it.s,c:it.c,opts:pickOptions(it.pool,it.c,4),solved:false,attempted:false,locked:false,firstCorrect:false}))}));
}

function pickOptions(pool,correct,count){
  const unique=[...new Set(pool)];
  const others=unique.filter(x=>x!==correct);
  shuffle(others);
  const picked=[correct,...others.slice(0,Math.max(0,count-1))];
  return shuffle(picked.slice(0,count));
}

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}
  return arr;
}

function initAudio(){
  if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();}
}

function playTone(freq,dur,vol){
  if(!audioCtx||!musicOn)return;
  const o=audioCtx.createOscillator();
  const g=audioCtx.createGain();
  o.type='sine';
  o.frequency.value=freq;
  g.gain.value=vol;
  o.connect(g);g.connect(audioCtx.destination);
  o.start();
  setTimeout(()=>{o.stop();},dur);
}

function startMusic(){
  initAudio();
  stopMusic();
  const o1=audioCtx.createOscillator();
  const g1=audioCtx.createGain();
  o1.type='sine';
  o1.frequency.value=196;
  g1.gain.value=0.02;
  const o2=audioCtx.createOscillator();
  const g2=audioCtx.createGain();
  o2.type='triangle';
  o2.frequency.value=261.63;
  g2.gain.value=0.015;
  o1.connect(g1);g1.connect(audioCtx.destination);
  o2.connect(g2);g2.connect(audioCtx.destination);
  o1.start();o2.start();
  musicNodes=[o1,o2,g1,g2];
}

function stopMusic(){
  musicNodes.forEach(n=>{try{if(n.stop)n.stop();if(n.disconnect)n.disconnect();}catch{}});
  musicNodes=[];
}

function updateStarsDisplay(n){
  starsDisplay.forEach((el,i)=>{el.textContent=i<n?'★':'☆'});
}

function calcStars(m){
  if(m<=2)return 3;
  if(m<=5)return 2;
  return 1;
}

function renderLevel(){
  cards.innerHTML='';
  const level=levels[levelIndex];
  levelIndicator.textContent=level.title;
  mistakes=0;
  solvedCount=0;
  totalCount=level.items.length;
  updateProgress();
  updateStarsDisplay(0);
  level.items.forEach((item,idx)=>{
    const card=document.createElement('div');
    card.className='card';
    const sentence=document.createElement('div');
    sentence.className='sentence';
    const blank=document.createElement('span');
    blank.className='blank drop-target';
    blank.dataset.correct=item.c;
    blank.textContent='____';
    const parts=item.s.split('____');
    sentence.append(parts[0]);
    sentence.append(blank);
    sentence.append(parts[1]||'');
    const options=document.createElement('div');
    options.className='options';
    item.opts.forEach(opt=>{
      const o=document.createElement('div');
      o.className='option';
      o.textContent=opt;
      o.draggable=true;
      o.dataset.value=opt;
      o.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',opt);});
      o.addEventListener('touchstart',e=>{o.classList.add('dragging');});
      o.addEventListener('touchend',e=>{o.classList.remove('dragging');});
      options.appendChild(o);
    });
    card.appendChild(sentence);
    card.appendChild(options);
    enableDrop(blank,card,idx);
    cards.appendChild(card);
  });
  btnNext.classList.add('hidden');
}

function enableDrop(target,card,idx){
  target.addEventListener('dragover',e=>{e.preventDefault();target.classList.add('hover')});
  target.addEventListener('dragenter',()=>{target.classList.add('hover')});
  target.addEventListener('dragleave',()=>{target.classList.remove('hover')});
  target.addEventListener('drop',e=>{e.preventDefault();target.classList.remove('hover');const val=e.dataTransfer.getData('text/plain');applyAnswer(target,card,idx,val)});
  target.addEventListener('click',()=>{});
  let current=null;
  target.addEventListener('touchmove',e=>{const t=e.touches[0];current=document.elementFromPoint(t.clientX,t.clientY)});
  target.addEventListener('touchend',()=>{const dragging=document.querySelector('.option.dragging');if(dragging){applyAnswer(target,card,idx,dragging.dataset.value);dragging.classList.remove('dragging');}});
}

function applyAnswer(target,card,idx,val){
  const correct=target.dataset.correct;
  const item=levels[levelIndex].items[idx];
  if(card.classList.contains('solved')||card.classList.contains('locked'))return;
  if(val===correct){
    target.textContent=val;
    card.classList.add('solved');
    target.classList.remove('incorrect');
    target.classList.add('correct');
    target.classList.remove('hover');
    playTone(880,120,0.05);
    sparkleBurst(target);
    item.solved=true;
    if(!item.attempted){firstTryCorrect++;item.firstCorrect=true;}
    item.attempted=true;
    solvedCount++;
    updateProgress();
    if(getCompletedCount()===totalCount){
      const s=calcStars(mistakes);
      starsEarnedPerLevel[levelIndex]=s;
      updateStarsDisplay(s);
      btnNext.classList.remove('hidden');
    }
  } else {
    mistakes++;
    target.classList.add('incorrect');
    card.classList.add('locked');
    item.locked=true;
    if(!item.attempted){firstTryWrong++;}
    item.attempted=true;
    setTimeout(()=>target.classList.remove('incorrect'),300);
    playTone(120,140,0.05);
    updateProgress();
    if(getCompletedCount()===totalCount){
      const s=calcStars(mistakes);
      starsEarnedPerLevel[levelIndex]=s;
      updateStarsDisplay(s);
      btnNext.classList.remove('hidden');
    }
  }
}

function getCompletedCount(){
  const level=levels[levelIndex];
  return level.items.filter(x=>x.solved||x.locked).length;
}

function sparkleBurst(el){
  const r=el.getBoundingClientRect();
  for(let i=0;i<14;i++){
    const d=document.createElement('div');
    d.className='sparkle';
    const colors=['#fb7185','#22c55e','#facc15','#7c5cff','#22d3ee','#60a5fa'];
    d.style.background=colors[i%colors.length];
    d.style.left=r.left+r.width/2+'px';
    d.style.top=r.top+r.height/2+'px';
    const dx=(Math.random()*2-1)*60;
    const dy=(Math.random()*2-1)*60;
    d.style.setProperty('--dx',dx+'px');
    d.style.setProperty('--dy',dy+'px');
    sparkleRoot.appendChild(d);
    setTimeout(()=>{d.remove();},650);
  }
}

function updateProgress(){
  const completed=getCompletedCount();
  const pct=Math.round((completed/Math.max(1,totalCount))*100);
  progressFill.style.width=pct+'%';
  progressText.textContent=`${completed}/${totalCount}`;
}

function startLevel(i){
  levelIndex=i;
  startScreen.classList.add('hidden');
  finalScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  renderLevel();
}

function nextLevel(){
  if(levelIndex<levels.length-1){
    levelIndex++;
    renderLevel();
  } else {
    showFinal();
  }
}

function showFinal(){
  gameScreen.classList.add('hidden');
  finalScreen.classList.remove('hidden');
  runConfetti();
  const scoreBox=document.getElementById('score');
  const total=levels.reduce((a,l)=>a+l.items.length,0);
  const pct=Math.round((firstTryCorrect/Math.max(1,total))*100);
  let msg='';
  if(pct>=90)msg='¡Excelente! Dominaste comparatives y superlatives.';
  else if(pct>=70)msg='¡Muy bien! Sigue practicando para llegar al 100%.';
  else if(pct>=50)msg='¡Buen esfuerzo! Practica un poco más.';
  else msg='No te rindas, con práctica lo lograrás.';
  scoreBox.innerHTML=`<div class="big">Tu puntuación: ${pct}%</div><div class="stats">Aciertos al primer intento: ${firstTryCorrect} &nbsp;|&nbsp; Intentos con error: ${firstTryWrong}</div><div class="stats">${msg}</div>`;
}

function buildAnswers(){
  answersContainer.innerHTML='';
  levels.forEach((lvl,li)=>{
    const head=document.createElement('div');
    head.className='answer';
    head.textContent=lvl.title;
    answersContainer.appendChild(head);
    lvl.items.forEach(it=>{
      const a=document.createElement('div');
      a.className='answer';
      a.textContent=it.s.replace('____',it.c);
      answersContainer.appendChild(a);
    });
  });
}

function runConfetti(){
  const root=document.getElementById('confetti');
  const c=document.createElement('canvas');
  c.width=window.innerWidth;c.height=window.innerHeight;
  root.innerHTML='';
  root.appendChild(c);
  const ctx=c.getContext('2d');
  const parts=[];
  const colors=['#7c5cff','#22c55e','#facc15','#ef4444','#60a5fa'];
  for(let i=0;i<150;i++){
    parts.push({x:Math.random()*c.width,y:-20-Math.random()*c.height,vy:1+Math.random()*3,vx:-2+Math.random()*4,s:4+Math.random()*6,r:Math.random()*Math.PI*2,c:colors[i%colors.length]});
  }
  let t=0;
  function loop(){
    ctx.clearRect(0,0,c.width,c.height);
    parts.forEach(p=>{p.y+=p.vy;p.x+=p.vx;p.r+=0.02;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s);ctx.restore();if(p.y>c.height+40){p.y=-20;p.x=Math.random()*c.width}});
    t++;if(t<900)requestAnimationFrame(loop);
  }
  loop();
}

btnStart.addEventListener('click',()=>{buildLevels();startLevel(0);});
btnNext.addEventListener('click',()=>{nextLevel();});
btnRestart.addEventListener('click',()=>{buildLevels();startLevel(0);});
btnAnswers.addEventListener('click',()=>{buildAnswers();answersModal.classList.remove('hidden');});
btnClose.addEventListener('click',()=>{answersModal.classList.add('hidden');});
btnMusic.addEventListener('click',()=>{
  if(!audioCtx)initAudio();
  musicOn=!musicOn;
  btnMusic.textContent=musicOn?'🎵 Música: On':'🎵 Música: Off';
  if(musicOn)startMusic();else stopMusic();
});
