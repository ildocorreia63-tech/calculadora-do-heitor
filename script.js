const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let soundOn = true;
let audioCtx;
function beep(freq=520,duration=.07,type="sine"){
  if(!soundOn)return;
  try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.08,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration)}catch(e){}
}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2100)}
// Navegação
$$(".tab").forEach(btn=>btn.addEventListener("click",()=>{beep(480);$$(".tab").forEach(b=>b.classList.toggle("active",b===btn));$$(".panel").forEach(p=>p.classList.toggle("active",p.id===btn.dataset.panel))}));
// Calculadora
let expression="",justCalculated=false;
const display=$("#display"),hint=$("#calcHint");
function render(){display.textContent=expression||"0"}
function addValue(v){
  if(justCalculated&&!["+", "−","×","÷","%"].includes(v))expression="";
  justCalculated=false;
  if(/[0-9]/.test(v)&&expression.length>25)return;
  if(v==="." ){const chunk=expression.split(/[+−×÷%]/).pop();if(chunk.includes("."))return;v=chunk===""?"0.":"."}
  expression+=v;hint.textContent="DIGITANDO...";render();beep(600,.045,"triangle");
}
function calculate(){
  if(!expression)return;
  try{
    let safe=expression.replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-");
    if(!/^[0-9+*/%.()\- ]+$/.test(safe))throw Error();
    const result=Function('"use strict";return ('+safe+')')();
    if(!Number.isFinite(result))throw Error();
    expression=String(Number(result.toPrecision(10)));justCalculated=true;hint.textContent="RESULTADO ✨";render();beep(760,.12,"sine");
  }catch(e){hint.textContent="OPS! TENTE DE NOVO";beep(160,.2,"square");toast("Essa conta não deu certo. Vamos tentar outra?")}
}
$("#keypad").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const a=b.dataset.action;if(a==="clear"){expression="";justCalculated=false;hint.textContent="PRONTO PARA CALCULAR";render();beep(330)}else if(a==="delete"){expression=expression.slice(0,-1);render();beep(380)}else if(a==="equals")calculate();else addValue(b.dataset.value)});
document.addEventListener("keydown",e=>{if(e.key>="0"&&e.key<="9")addValue(e.key);else if(["+","-","*","/","."].includes(e.key))addValue(({ "*":"×","/":"÷","-":"−"}[e.key]||e.key));else if(e.key==="Enter"||e.key==="=")calculate();else if(e.key==="Backspace"){expression=expression.slice(0,-1);render()}else if(e.key==="Escape"){expression="";render()}});
// Tabuada
const select=$("#tableNumber");
for(let n=1;n<=20;n++){const opt=document.createElement("option");opt.value=n;opt.textContent=n+" vezes";select.append(opt)}
function showTable(n){$("#tableResults").innerHTML=Array.from({length:10},(_,i)=>'<div class="table-line"><span>'+n+' × '+(i+1)+'</span><b>'+(n*(i+1))+'</b></div>').join("")}
select.addEventListener("change",()=>{showTable(+select.value);beep(530)});
$("#randomTable").addEventListener("click",()=>{select.value=String(1+Math.floor(Math.random()*20));showTable(+select.value);beep(700);toast("Tabuada sorteada! Boa prática!")});
showTable(1);
// Desafios
let score=0,questionNo=0,correctAnswer=0,answered=false;
function level(){return Math.floor(score/30)+1}
function newQuestion(){
  if(questionNo>=10){finishChallenge();return}
  answered=false;const lvl=level();const ops=lvl===1?["+","×"]:["+","−","×"];const op=ops[Math.floor(Math.random()*ops.length)];
  let a=1+Math.floor(Math.random()*(lvl*5+5)),b=1+Math.floor(Math.random()*(lvl*4+5));
  if(op==="−"&&b>a)[a,b]=[b,a];
  correctAnswer=op==="+"?a+b:op==="−"?a-b:a*b;
  $("#questionCount").textContent=questionNo;$("#level").textContent=lvl;$("#score").textContent=score;$("#progress").style.width=(questionNo*10)+"%";
  $("#challengeContent").innerHTML='<div class="eyebrow">PERGUNTA '+(questionNo+1)+' DE 10</div><div class="question">'+a+' '+op+' '+b+' = ?</div><div class="answers">'+makeAnswers(correctAnswer)+'</div><div class="feedback" id="feedback" aria-live="polite"></div>';
  $$(".answer-btn").forEach(btn=>btn.addEventListener("click",()=>answer(+btn.dataset.answer,btn)));
}
function makeAnswers(correct){const set=new Set([correct]);while(set.size<4){let v=correct+Math.floor(Math.random()*13)-6;if(v>=0)set.add(v)}return [...set].sort(()=>Math.random()-.5).map(v=>'<button class="answer-btn" data-answer="'+v+'">'+v+'</button>').join("")}
function answer(value,btn){if(answered)return;answered=true;const good=value===correctAnswer;if(good){score+=10;btn.classList.add("correct");$("#feedback").textContent="Muito bem! Você acertou! ⭐";beep(880,.16)}else{btn.classList.add("wrong");$("#feedback").textContent="Quase! A resposta era "+correctAnswer+".";beep(190,.18,"triangle");$$(".answer-btn").find(b=>+b.dataset.answer===correctAnswer)?.classList.add("correct")}
  $$(".answer-btn").forEach(b=>b.disabled=true);questionNo++;$("#score").textContent=score;$("#level").textContent=level();$("#questionCount").textContent=questionNo;$("#progress").style.width=(questionNo*10)+"%";
  setTimeout(()=>{if(questionNo<10)newQuestion();else finishChallenge()},1150);
}
function finishChallenge(){$("#challengeContent").innerHTML='<div class="mission-icon">🏆</div><h3>Missão cumprida, Heitor!</h3><p>Você fez <b>'+score+' pontos</b> e chegou ao nível '+level()+'. '+(score>=80?"Que campeão!":"Continue praticando, você consegue!")+'</p><button class="primary-btn" id="startChallenge">Jogar novamente ↻</button>';$("#startChallenge").addEventListener("click",startChallenge);beep(740,.12);setTimeout(()=>beep(980,.18),150)}
function startChallenge(){score=0;questionNo=0;$("#score").textContent=0;$("#level").textContent=1;newQuestion();beep(560)}
$("#startChallenge").addEventListener("click",startChallenge);
// Som e imagem de fundo
$("#soundToggle").addEventListener("click",()=>{soundOn=!soundOn;$("#soundToggle").textContent=soundOn?"🔊":"🔇";toast(soundOn?"Sons ativados":"Sons desligados");if(soundOn)beep(660)});
$("#backgroundBtn").addEventListener("click",()=>$("#backgroundInput").click());
$("#backgroundInput").addEventListener("change",e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith("image/"))return toast("Escolha uma imagem.");if(file.size>4*1024*1024)return toast("Escolha uma imagem de até 4 MB.");const reader=new FileReader();reader.onload=()=>{document.body.style.backgroundImage='linear-gradient(#f7f5efbb,#f7f5efbb),url("'+reader.result+'")';document.body.classList.add("custom-bg");try{localStorage.setItem("heitorBg",reader.result)}catch(err){toast("Imagem aplicada, mas não foi possível salvá-la.")}toast("Seu fundo foi personalizado!")};reader.readAsDataURL(file)});
try{const saved=localStorage.getItem("heitorBg");if(saved){document.body.style.backgroundImage='linear-gradient(#f7f5efbb,#f7f5efbb),url("'+saved+'")';document.body.classList.add("custom-bg")}}catch(e){}
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}
