(()=>{
'use strict';
const T=30,COLS=32,ROWS=18,W=COLS*T,H=ROWS*T,PIX=2;
const GRAV=0.6,MAXFALL=14,BOUNCE=15.5,BASTION_H=100;
const MASS={g:1,t:2,k:5};
const TEST=location.hash==='#test';
const $=id=>document.getElementById(id);
const cv=$('cv'),ctx=cv.getContext('2d');
let RES=1;function fitRes(){RES=Math.min(Math.max(window.devicePixelRatio||1,1),2);cv.width=Math.round(W*RES);cv.height=Math.round(H*RES);}fitRes();addEventListener('resize',fitRes);

/* ================= képek ================= */
const IMG_LIST={logo:'logo.jpg',falu:'bg_falu.jpg',paprika:'bg_paprika.jpg',matyo:'bg_matyo.jpg',var:'bg_var.jpg',
 keyart:'keyart.jpg',reggeli:'reggeli.jpg',fesztival:'fesztival.jpg',lyuk:'howto_lyuk.jpg',bastya:'howto_bastya.jpg',tabortuz:'tabortuz.jpg',maszat:'irka.jpg',ostrom:'ostrom.jpg',hazateres:'hazateres.jpg',kapuk:'kapuk.jpg',torony:'torony.jpg'};
const IMG={};let imgDone=0;const imgTotal=Object.keys(IMG_LIST).length;
function loadImages(onProgress,onDone){
 for(const [k,f] of Object.entries(IMG_LIST)){
  const im=new Image();
  im.onload=()=>{IMG[k]=im;imgDone++;onProgress();if(imgDone===imgTotal)onDone();};
  im.onerror=()=>{imgDone++;onProgress();if(imgDone===imgTotal)onDone();};
  im.src='assets/'+f;
 }
}
const imgURL=k=>IMG[k]?'assets/'+IMG_LIST[k]:null;

/* ================= pályák ================= */
function makeGrid(){const g=[];for(let r=0;r<ROWS;r++){const row=[];for(let c=0;c<COLS;c++)row.push((r===0||r===ROWS-1||c===0||c===COLS-1)?'#':'.');g.push(row);}return g;}
function R(g,ch,c1,r1,c2,r2){for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)g[r][c]=ch;}
const LEVELS=[
 {name:'Ismerkedés',bg:'falu',intro:['reggeli','Egy átlagos reggel a tornácon. Lángos, tea, paprikafüzér. Aztán a kert végében kinyílt egy kapu, ami tegnap még nem volt ott.'],
  hint:'Tab-bal váltasz. A párkány magas a gömbnek: ugorjon előbb a kockára, vagy fusson fel a háromszögön, és a csúcsán ugorjon. A falon lévő résen átgurulva a gödörbe pottyan, ott nyitva tartja a kék ajtót. A repedt falat a háromszög rohama (E) töri át.',
  spawn:{g:[2,16],t:[12.5,16],k:[9,16]},
  build(g){R(g,'#',11,13,14,13);R(g,'#',15,1,15,11);R(g,'d',15,13,15,16);R(g,'#',17,16,30,16);g[16][19]='p';R(g,'#',23,1,23,10);R(g,'X',23,11,23,15);R(g,'E',27,14,30,15);g[11][13]='c';g[12][21]='c';g[12][29]='c';},
  dialog:[['k','Na, megint egy idegen hely. Ki hozott minket ide?'],['g','Nem tudom, de ott egy kijárat! Gurulok!'],['t','Lassan. Az a párkány magas neked. Ugorj fel előbb a kockára.'],['k','Mindig rajtam ugrálnak...'],['g','Mert te vagy a legkényelmesebb!'],['t','És szedjük össze a paprikát is. Anyám nem enged haza nélküle.'],['g','És ki ez a fekete kölyök?'],['k','Irka, a szomszéd labradorja. Senki nem bántja, de mindenbe beleüti az orrát.'],['t','Főleg a mi dolgainkba.']]},
 {name:'Lyuk',bg:'paprika',intro:['lyuk','A kapu túloldalán tüskés lyukak és furcsa lejtők várták őket. A háromszög gyanúsan jókedvű lett.'],
  hint:'A tüskés lyukba csak a háromszög léphet: beleesik, fejre fordul, és híd lesz belőle. Utána felugrik. A magas polcra a gömb úgy jut fel, ha nekifutásból felszalad a háromszögön, vagy a csúcsára ugrik.',
  spawn:{g:[2,15],t:[7,15],k:[4.5,15]},
  build(g){R(g,'#',1,16,30,16);g[16][9]='^';g[16][10]='^';R(g,'#',18,11,26,11);g[10][19]='p';R(g,'d',22,12,22,15);R(g,'E',27,14,30,15);g[12][9]='c';g[10][24]='c';g[11][13]='c';},
  dialog:[['g','Tüskék! Én ebbe bele nem gurulok.'],['t','Engem a tüske csak csiklandoz. Befordulok, és átmentek rajtam.'],['k','Elbírsz?'],['t','Elbírlak. Csak ne ugrálj rajtam.'],['g','A polcra meg úgy jutok fel, hogy nekifutok a háromszögnek. Rámpa!'],['t','Én nem vagyok rámpa. Én egy méltóságteljes háromszög vagyok.']]},
 {name:'Tűzfolyosó',bg:'var',intro:['bastya','A várfolyosón ágyúk őrködtek. Szerencsére a kocka kemény jellem, és még keményebb oldallap.'],
  hint:'A lila kapcsolót csak a kocka nyomja le, utána nyitva marad. Az ágyú lő: a lövedék elakad a kockában, a többiek maradjanak mögötte. A kocka mindenkit eltol, őt senki.',
  spawn:{g:[3,16],t:[5,16],k:[8,16]},
  build(g){g[16][12]='#';g[16][16]='P';R(g,'#',20,1,20,12);R(g,'D',20,13,20,16);g[16][30]='<';R(g,'E',25,15,29,16);g[13][12]='c';g[14][23]='c';g[12][6]='c';},
  dialog:[['t','Hallod ezt a kattogást? Ott egy ágyú.'],['k','Az ágyúgolyó nekem csak pöccintés. Bújjatok mögém.'],['g','Mögéd? Onnan semmit se látok!'],['k','Pont ez a lényeg.'],['g','Irka! Ne szaladj az ágyú elé!'],['t','Neki nem árt. Csak nekünk.']]},
 {name:'Bástya',bg:'var',intro:['keyart','Valaki dobozba zárta a kalandjukat, és az egri várat festette rá. Most mindhárman a falakon belül vannak.',true],
  hint:'Állj a háromszöggel a kockára, aztán a kockával nyomj E-t: toronnyá nő, és felemeli. A tetejéről a háromszög felér a párkányra. Fent valaki tartsa a kék kapcsolót, amíg a kocka alul átér.',
  spawn:{g:[2,16],t:[4,16],k:[6,16]},
  build(g){R(g,'#',10,12,24,12);R(g,'#',16,1,16,8);R(g,'X',16,9,16,11);g[11][19]='p';R(g,'d',21,13,21,16);R(g,'E',27,15,30,16);g[11][13]='c';g[11][23]='c';g[13][28]='c';},
  dialog:[['g','Az a párkány a felhőkben van.'],['k','Akkor ideje toronnyá nőnöm. Háromszög, mássz fel rám!'],['t','Ha leejtesz, egy hétig a hímzett terítőn alszol.'],['k','Nem ejtelek le. Bástya vagyok, nem lift. De most kivételesen lift.']]},
 {name:'Két lyuk',bg:'paprika',intro:['fesztival','Félúton egy matyó búcsúba csöppentek. Egy csárdás belefér, aztán irány tovább a paprikaföldeken át.'],
  hint:'A második lyuk széles: a háromszögnek középre kell befordulnia, különben a kocka beleesik. Hogy a kocka elé kerüljön, ugorjon fel rá, és onnan előre.',
  spawn:{g:[1,15],t:[5,15],k:[3,15]},
  build(g){R(g,'#',1,16,30,16);g[16][7]='^';g[16][8]='^';R(g,'^',15,16,17,16);R(g,'E',26,14,29,15);g[12][16]='c';g[11][11]='c';g[12][28]='c';},
  dialog:[['g','Két lyuk! Ez már kötekedés.'],['t','És a második szélesebb. Középre kell befordulnom.'],['k','Ha a széléhez fekszel, én megyek a tüskékre. Szóval középre, kérlek.'],['t','Átugrok fölötted, mint a kecske a kerítésen.'],['k','Csak óvatosan a fejemmel. Irka már háromszor rajta ült ma.']]},
 {name:'Tüskés kapcsoló',bg:'matyo',intro:['maszat','Irka, a szomszéd labradorja is utánuk jött. Segíteni nem segít, de nagyon lelkes.'],
  hint:'A kék kapcsoló a tüskés lyuk alján van, ezt csak a háromszög nyomhatja le, és közben hídként átengedi a többieket. Túloldalt a gömb egy másik kék kapcsolóval tartja nyitva az ajtót, hogy a háromszög is átjöjjön. A végén az ágyú: a kocka megy elöl.',
  spawn:{g:[1,15],t:[6,15],k:[3.5,15]},
  build(g){R(g,'#',1,16,30,16);g[16][9]='q';g[16][10]='q';R(g,'#',14,1,14,11);R(g,'d',14,12,14,15);g[15][18]='p';R(g,'#',24,1,24,11);R(g,'D',24,12,24,15);g[15][21]='P';g[15][30]='<';R(g,'E',25,14,29,15);g[12][19]='c';g[12][12]='c';g[12][27]='c';},
  dialog:[['t','A kapcsoló a lyuk alján van. Gondolom, megint én.'],['g','Te vagy a tüskék királya!'],['k','Mi átmegyünk rajtad, aztán a gömb túloldalt tartja neked az ajtót.'],['t','Ezt fel fogom írni.'],['k','És ott az ágyú is. Megint mögém, mindenki.']]},
 {name:'Ostrom',bg:'var',intro:['ostrom','Az utolsó várfal előtt tornyot kell építeniük. Kocka alul, háromszög középen, gömb a csúcson.'],
  hint:'Alul a kocka, rajta a háromszög, a gömb a csúcsra ugrik és felpattan a hídra. A falbontás után a háromszög ugorja át a kockát, hogy mögé kerüljön. A gömb csak akkor ugorjon le a híd végén, ha a kocka már előtte áll a tűzvonalban.',
  spawn:{g:[1,16],t:[2.25,16],k:[4,16]},
  build(g){R(g,'#',6,9,22,9);g[8][7]='p';R(g,'d',10,10,10,16);R(g,'X',18,10,18,16);g[16][21]='P';R(g,'#',25,1,30,9);R(g,'D',25,10,25,16);g[16][30]='<';R(g,'E',26,15,29,16);g[8][15]='c';g[14][13]='c';g[12][28]='c';},
  dialog:[['k','Ez a vár ostrom nélkül nem adja meg magát.'],['g','Építsünk tornyot! Kocka alul, háromszög középen, én a csúcson.'],['t','És a végén te pattansz fel a hídra, mi meg csináljuk a nehezét.'],['g','Pontosan. Ezt hívják csapatmunkának!']]},
 {name:'Pincekapuk',bg:'var',intro:['kapuk','A borospincében kék kapcsolók és rácsos kapuk. Irka azonnal ráült az egyikre. Persze semmi nem történt.'],
  hint:'A tüskés lyuk alján kapcsoló van: a háromszög nyomja, amíg a többiek átkelnek. Utána a gömb a gödörben tartja nyitva a kaput. A háromszögnek kétszer is át kell ugrania a kockát: előre a falbontáshoz, aztán vissza, mielőtt a kocka a lila kapcsolóra lép és megszólal az ágyú.',
  spawn:{g:[1,15],t:[4.8,15],k:[3,15]},
  build(g){R(g,'#',1,16,30,16);g[16][6]='q';g[16][7]='q';R(g,'#',10,1,10,11);R(g,'d',10,12,10,15);R(g,'#',11,15,30,15);g[15][14]='p';R(g,'X',18,11,18,14);g[14][21]='P';R(g,'#',24,1,24,10);R(g,'D',24,11,24,14);g[14][30]='<';R(g,'E',25,13,29,14);g[11][12]='c';g[9][18]='c';g[11][28]='c';},
  dialog:[['k','Kék kapcsoló, kék kapu. Ezt már ismerjük.'],['g','Irka ráült a kapcsolóra! Miért nem nyílik?'],['t','Mert Irka nem nyom semmit. Irka csak ül.'],['k','A háromszög be a lyukba, a gömb be a gödörbe. Én meg viszem az ágyúgolyókat.'],['t','És közben kétszer átugrom rajtad. Bocsánat előre.']]},
 {name:'Paprikás torony',bg:'paprika',intro:['torony','A kalocsai paprikaszárítóban a gömbnek fel kell jutnia a padlásra. A kocka szerint ő a legjobb lift a megyében.'],
  hint:'A polcra háromféleképpen is feljut a gömb: a háromszög csúcsáról pattanva, nekifutásból rámpán, vagy a kocka tetején, amikor az bástyává nő. Fent a szűk résen átgurulva tartsa a kék kapcsolót, alul a háromszög hidat csinál a lyukon a kockának.',
  spawn:{g:[1,15],t:[7,15],k:[4,15]},
  build(g){R(g,'#',1,16,30,16);R(g,'#',9,10,16,10);R(g,'#',17,1,17,8);R(g,'#',17,10,17,10);R(g,'d',17,11,17,15);R(g,'#',18,10,23,10);g[9][20]='p';g[16][20]='^';g[16][21]='^';R(g,'E',26,14,29,15);g[9][12]='c';g[8][21]='c';g[11][28]='c';},
  dialog:[['g','A padlásra kell feljutnom. Valaki dobjon fel!'],['k','Állj rám, nőni fogok.'],['t','Vagy ugorj a csúcsomra, az gyorsabb.'],['g','Vagy nekifutok a rámpán! Annyi lehetőség, és mind fáj.'],['k','A lyukat se felejtsük el. Háromszög, ez a te műfajod.']]},
 {name:'Hazatérés',bg:'falu',intro:['hazateres','Hajnalodik. Már látszik a falu tornya, és érezni a gulyás illatát.'],
  hint:'Utolsó pálya: híd a lyukon, falbontás, aztán a gömb a kocka tetejéről a háromszög csúcsára ugrik, és felpattan a polcra. Ott tartja a kék ajtót, majd a szűk résen gurul tovább. A kocka maga előtt tolja a háromszöget.',
  spawn:{g:[1,15],t:[4.6,15],k:[2.6,15]},
  build(g){R(g,'#',1,16,30,16);g[16][6]='^';g[16][7]='^';R(g,'X',12,11,12,15);R(g,'#',14,10,22,10);g[9][15]='p';R(g,'#',19,1,19,8);R(g,'d',19,11,19,15);R(g,'E',26,14,29,15);g[12][9]='c';g[9][21]='c';g[11][27]='c';},
  dialog:[['g','Érzem a gulyás illatát. Mindjárt otthon vagyunk!'],['t','Még egy lyuk, egy polc és egy repedt fal.'],['k','Utána bográcsozunk a paprikaföldön.'],['g','Aki utoljára ér a kijárathoz, az mosogat!'],['k','Az én leszek. Mindig én vagyok.'],['t','Irka meg majd felnyalja a maradékot.']]}
];

/* ================= haladás ================= */
const SAVE_KEY='haromforma-v2';
let progress={unlocked:0,best:[]};
function loadProgress(){try{const p=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(p&&typeof p.unlocked==='number')progress={unlocked:p.unlocked,best:Array.isArray(p.best)?p.best:[]};}catch(e){}}
function saveProgress(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(progress));}catch(e){}}
function resetProgress(){progress={unlocked:0,best:[]};saveProgress();}
const totalPap=()=>progress.best.reduce((a,b)=>a+(b||0),0);
loadProgress();

/* ================= szereplők ================= */
const DEFS={
 g:{name:'Gömb',w:24,h:24,speed:4.6,jump:11.5,accel:.28,color:'#F5B83D',dark:'#B9821C'},
 t:{name:'Háromszög',w:46,h:32,speed:3.1,jump:9.5,accel:.45,color:'#EF6A5A',dark:'#A8382C'},
 k:{name:'Kocka',w:40,h:40,speed:1.7,jump:7.5,accel:.5,color:'#3FB8A9',dark:'#1F7268'}
};
const NAMES={g:'GÖMB',t:'HÁROMSZÖG',k:'KOCKA'};
function makeChar(id,c,r){const d=DEFS[id];return Object.assign({id},d,{x:c*T+T/2-d.w/2,y:(r+1)*T-d.h,vx:0,vy:0,onGround:false,standingOn:null,face:1,prevX:0,coyote:0,dashT:0,dashCD:0,bastion:false,plug:false,rot:0,squash:0,flash:0,dead:false,blink:60+Math.random()*200,hop:0});}

let S=null,mode='loading',muted=false;
function loadLevel(i){
 const L=LEVELS[i],g=makeGrid();L.build(g);
 const chars=['g','t','k'].map(id=>makeChar(id,...L.spawn[id]));
 const plates=[],turrets=[],paps=[];let ex=[99,99,-1,-1];
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const ch=g[r][c];
  if(ch==='p'||ch==='P'||ch==='q')plates.push({c,r,heavy:ch==='P',pressed:false,anim:0});
  if(ch==='<'||ch==='>')turrets.push({c,r,dir:ch==='<'?-1:1,timer:60});
  if(ch==='c'){paps.push({x:c*T+T/2,y:r*T+T/2,got:false,ph:Math.random()*6});g[r][c]='.';}
  if(ch==='E'){ex[0]=Math.min(ex[0],c);ex[1]=Math.min(ex[1],r);ex[2]=Math.max(ex[2],c);ex[3]=Math.max(ex[3],r);}}
 const prevActive=S&&S.i===i?S.active:2;
 S={i,grid:g,chars,active:prevActive,plates,turrets,paps,bullets:[],parts:[],lightOpen:false,heavyOpen:false,lightAnim:0,heavyAnim:0,frame:0,timer:0,exit:ex,shake:0,
    cam:{z:1,x:W/2,y:H/2},speaker:null,dog:null};
 S.dog=makeDog();
 $('lvl').textContent=`${i+1}. pálya / ${LEVELS.length} · ${L.name}`;
 $('hint').textContent=L.hint;
 syncCards();updatePapHUD();
}

/* ================= ütközés ================= */
function solidTile(c,r){
 if(c<0||c>=COLS||r<0||r>=ROWS)return true;
 const ch=S.grid[r][c];
 if(ch==='#'||ch==='X'||ch==='<'||ch==='>')return true;
 if(ch==='d')return !S.lightOpen;
 if(ch==='D')return !S.heavyOpen;
 return false;
}
function tilesIn(x,y,w,h,fn){const c0=Math.floor(x/T),c1=Math.floor((x+w-0.01)/T),r0=Math.floor(y/T),r1=Math.floor((y+h-0.01)/T);
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){if(fn(c,r))return true;}return false;}
function rectSolid(x,y,w,h){return tilesIn(x,y,w,h,solidTile);}
function tileAt(x,y){const c=Math.floor(x/T),r=Math.floor(y/T);return(S.grid[r]&&S.grid[r][c])||'#';}
const isSpike=ch=>ch==='^'||ch==='q';

const alive=()=>S.chars.filter(c=>!c.dead);
function overlapH(a,b){return a.x<b.x+b.w-3&&a.x+a.w>b.x+3;}
function bodyOverlap(a,b){return a.x<b.x+b.w-0.5&&a.x+a.w>b.x+0.5&&a.y<b.y+b.h-1&&a.y+a.h>b.y+1;}
const isSlope=o=>o.id==='t'&&!o.plug;
function triM(o){return o.h/(o.w/2);}
function supportBottom(r,o){
 if(o.dead)return null;
 if(isSlope(o)){
  const m=triM(o),cx=o.x+o.w/2,hw=o.w/2,top=o.y,base=o.y+o.h;
  if(r.id==='g'){
   const rad=r.w/2,px=r.x+rad,adx=Math.abs(px-cx),k=Math.sqrt(1+m*m),foot=adx-rad*m/k;
   let cy=null;
   if(foot<=0)cy=top-Math.sqrt(Math.max(0,rad*rad-adx*adx));
   else if(foot<=hw)cy=top+adx*m-rad*k;
   else{const d=adx-hw;if(d<rad)cy=base-Math.sqrt(rad*rad-d*d);}
   return cy===null?null:cy+rad;
  }
  const near=Math.max(r.x,Math.min(cx,r.x+r.w)),d=Math.abs(near-cx);
  if(d>=hw-1)return null;
  return top+d*m;
 }
 if(!overlapH(r,o))return null;
 return o.y;
}
function ridersOf(o){return S.chars.filter(c=>c!==o&&!c.dead&&c.vy>=0&&(c.standingOn===o||(!isSlope(o)&&Math.abs(c.y+c.h-o.y)<1.5&&overlapH(c,o))));}
function chainOf(o,set){set=set||new Set();for(const r of ridersOf(o))if(!set.has(r)){set.add(r);chainOf(r,set);}return set;}
function canRise(o,dy){
 if(rectSolid(o.x,o.y+dy,o.w,o.h))return false;
 const chain=chainOf(o);
 for(const B of alive()){if(B===o||chain.has(B))continue;
  if(B.x<o.x+o.w-0.5&&B.x+B.w>o.x+0.5&&B.y<o.y+dy+o.h-1&&B.y+B.h>o.y+dy+1&&B.y+B.h<=o.y+1.5)return false;}
 for(const r of ridersOf(o))if(!canRise(r,dy))return false;
 return true;
}
function rise(o,dy){for(const r of ridersOf(o))rise(r,dy);o.y+=dy;}
function slopeLift(g,t,maxPen){
 if(g.dead||t.dead||!isSlope(t))return true;
 if(g.y>=t.y+t.h-1||g.y+g.h<=t.y)return true;
 const s=supportBottom(g,t);if(s===null)return true;
 const pen=g.y+g.h-s;if(pen<=0.01)return true;
 if(pen>maxPen)return false;
 if(!canRise(g,-pen))return false;
 rise(g,-pen);g.onGround=true;g.standingOn=t;
 return true;
}
function breakX(c0,r0){
 const q=[[c0,r0]];let n=0;
 while(q.length){const [c,r]=q.pop();if(c<0||r<0||c>=COLS||r>=ROWS||S.grid[r][c]!=='X')continue;
  S.grid[r][c]='.';n++;
  for(let i=0;i<7;i++)part(c*T+Math.random()*T,r*T+Math.random()*T,(Math.random()-.5)*6,-Math.random()*5,'#8a7560',5+Math.random()*4,40);
  q.push([c+1,r],[c-1,r],[c,r+1],[c,r-1]);}
 if(n){sfx('break');S.shake=8;}
}
function stepX(ch,step,depth){
 if(rectSolid(ch.x+step,ch.y,ch.w,ch.h)){
  if(ch.dashT>0&&depth===0){let hit=null;
   tilesIn(ch.x+step,ch.y,ch.w,ch.h,(c,r)=>{if(S.grid[r][c]==='X'){hit=[c,r];return true;}return false;});
   if(hit){breakX(hit[0],hit[1]);return 'retry';}}
  return false;
 }
 const ox=ch.x;ch.x+=step;
 for(const B of S.chars){
  if(B===ch||B.dead)continue;
  if(ch.id==='g'&&isSlope(B)){if(!slopeLift(ch,B,9)){ch.x=ox;return false;}continue;}
  if(isSlope(ch)&&B.id==='g'){if(!slopeLift(B,ch,9)){ch.x=ox;return false;}continue;}
  if(!bodyOverlap(ch,B))continue;
  if(Math.sign((B.x+B.w/2)-(ch.x+ch.w/2))!==Math.sign(step))continue;
  if(!isSlope(B)){const pen=ch.y+ch.h-B.y;if(pen>0&&pen<=5&&canRise(ch,-pen)){rise(ch,-pen);continue;}}
  if(depth<3&&MASS[ch.id]>MASS[B.id]&&!B.plug&&!(B.id==='k'&&B.bastion)){if(stepX(B,step,depth+1)===true){ch.pushing=true;continue;}}
  ch.x=ox;return false;
 }
 if(depth===0&&ch.id==='g'&&ch.standingOn&&isSlope(ch.standingOn)&&ch.vy>=0){
  const s=supportBottom(ch,ch.standingOn);
  if(s!==null){const gap=s-(ch.y+ch.h);if(gap>0&&gap<4&&!rectSolid(ch.x,ch.y+gap,ch.w,ch.h))ch.y+=gap;}
 }
 return true;
}
function moveX(ch,dx){
 let rem=dx,guard=0;
 while(rem!==0&&guard++<80){
  const step=Math.abs(rem)>1?Math.sign(rem):rem;
  const r=stepX(ch,step,0);
  if(r==='retry')continue;
  if(!r){if(ch.dashT>0){ch.dashT=0;S.shake=Math.max(S.shake,3);}ch.vx=0;return false;}
  rem-=step;
 }
 return true;
}
function landOn(ch,o){
 if(ch.id==='g'&&isSlope(o)&&ch.vy>2.5&&!(isActive(ch)&&keys.down)){
  const dx=(ch.x+ch.w/2)-(o.x+o.w/2);
  if(Math.abs(dx)<8){
   ch.vy=-BOUNCE;ch.onGround=false;o.squash=1;sfx('bounce');
   for(let i=0;i<10;i++)part(o.x+o.w/2,o.y,(Math.random()-.5)*5,-Math.random()*3,'#ffd38a',4,26);
   return;}
  if(ch.vy>4.5){ch.vx=Math.sign(dx)*Math.max(Math.abs(ch.vx),ch.vy*.6);ch.vy=-ch.vy*.3;ch.onGround=false;sfx('tick');return;}
 }
 if(ch.vy>6)ch.squash=.6;
 ch.vy=0;ch.onGround=true;ch.standingOn=o;
}
function moveY(ch,dy){
 ch.onGround=false;ch.standingOn=null;
 let rem=dy===0?0.01:dy,guard=0;
 while(rem!==0&&guard++<40){
  const step=Math.abs(rem)>1?Math.sign(rem):rem;
  if(step>0){
   const bottom=ch.y+ch.h;
   for(const o of S.chars){if(o===ch||o.dead)continue;
    const s=supportBottom(ch,o);if(s===null)continue;
    if(bottom<=s+0.5&&bottom+step>s){ch.y=s-ch.h;landOn(ch,o);return;}}
   if(rectSolid(ch.x,ch.y+step,ch.w,ch.h)){if(ch.vy>6){ch.squash=.6;if(ch.id==='k'){S.shake=Math.max(S.shake,4);sfx('thud');}}ch.vy=0;ch.onGround=true;return;}
   ch.y+=step;rem-=step;
  }else{
   if(!canRise(ch,step)){ch.vy=0;return;}
   rise(ch,step);rem-=step;
  }
 }
}
function resolveOverlaps(){
 const cs=alive();
 for(const g of cs)if(g.id==='g')for(const t of cs)if(isSlope(t))slopeLift(g,t,12);
 for(let i=0;i<cs.length;i++)for(let j=i+1;j<cs.length;j++){
  const a=cs[i],b=cs[j];
  if((a.id==='g'&&isSlope(b))||(b.id==='g'&&isSlope(a)))continue;
  if(!bodyOverlap(a,b))continue;
  const light=MASS[a.id]<=MASS[b.id]?a:b,heavy=light===a?b:a;
  const dir=Math.sign((light.x+light.w/2)-(heavy.x+heavy.w/2))||1;
  if(!rectSolid(light.x+dir,light.y,light.w,light.h))light.x+=dir;
  else if(!rectSolid(heavy.x-dir,heavy.y,heavy.w,heavy.h))heavy.x-=dir;
 }
}

/* ================= részecskék, hang, zene ================= */
function part(x,y,vx,vy,color,size,life,kind){S.parts.push({x,y,vx,vy,color,size,life,max:life,kind:kind||0,rot:Math.random()*6});}
let AC=null,master=null,sfxBus=null,musBus=null;
function ensureAudio(){
 if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=muted?0:1;master.connect(AC.destination);
  sfxBus=AC.createGain();sfxBus.gain.value=1;sfxBus.connect(master);musBus=AC.createGain();musBus.gain.value=.55;musBus.connect(master);}catch(e){AC=null;}}
 if(AC&&AC.state==='suspended')AC.resume().catch(()=>{});
}
function tone(f,d,type,vol,slide,when,bus){if(!AC)return;const t=when||AC.currentTime;const o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),t+d);g.gain.setValueAtTime(vol||.05,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g).connect(bus||sfxBus);o.start(t);o.stop(t+d+.03);}
let noiseBuf=null;
function noise(when,d,vol,freq){if(!AC)return;if(!noiseBuf){noiseBuf=AC.createBuffer(1,AC.sampleRate*.3,AC.sampleRate);const a=noiseBuf.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}
 const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=freq||5000;const g=AC.createGain();g.gain.setValueAtTime(vol,when);g.gain.exponentialRampToValueAtTime(0.0001,when+d);s.connect(f).connect(g).connect(musBus);s.start(when);s.stop(when+d+.02);}
const SFX={
 jump:()=>tone(380,.12,'square',.035,260),ramp:()=>tone(330,.22,'triangle',.07,620),bounce:()=>tone(260,.28,'triangle',.08,820),
 tick:()=>tone(520,.06,'triangle',.05,-120),dash:()=>tone(180,.18,'sawtooth',.05,-90),
 break:()=>{tone(120,.3,'sawtooth',.07,-60);tone(90,.35,'square',.04,-40);},
 shot:()=>tone(900,.06,'square',.018,-500),absorb:()=>tone(160,.08,'square',.05,-60),die:()=>tone(300,.6,'sawtooth',.07,-260),
 plate:()=>tone(660,.08,'triangle',.06,120),door:()=>tone(220,.22,'triangle',.06,180),thud:()=>tone(70,.12,'sine',.12,-20),
 plug:()=>{tone(200,.12,'triangle',.07,-80);setTimeout(()=>tone(320,.1,'triangle',.06,60),90);},
 tower:()=>tone(140,.3,'triangle',.07,160),switch:()=>tone(520,.05,'sine',.05,80),
 paprika:()=>{tone(988,.09,'square',.04);setTimeout(()=>tone(1319,.14,'square',.04),70);},
 win:()=>{[587,698,880,1175].forEach((f,i)=>setTimeout(()=>tone(f,.2,'triangle',.07),i*110));},
 blip:(p)=>tone(p,.035,'square',.018),
 bark:()=>{tone(520,.07,'sawtooth',.05,-260);setTimeout(()=>tone(600,.08,'sawtooth',.05,-300),110);}
};
function sfx(n,a){try{SFX[n]&&SFX[n](a);}catch(e){}}
// Saját szerzésű, pentaton népies dallam dűvő-kísérettel
const MEL=[
 [[69,1],[69,1],[72,2],[74,2],[72,1],[69,1]],[[67,2],[69,1],[72,1],[69,2],[67,1],[65,1]],[[67,1],[67,1],[69,2],[72,2],[69,1],[67,1]],[[65,2],[62,2],[62,4]],
 [[74,1],[74,1],[77,2],[79,2],[77,1],[74,1]],[[72,2],[74,1],[77,1],[74,2],[72,1],[69,1]],[[72,1],[72,1],[69,1],[67,1],[69,2],[67,1],[65,1]],[[67,2],[62,2],[62,4]],
 [[69,1],[74,1],[74,1],[69,1],[72,1],[74,1],[72,1],[69,1]],[[67,1],[72,1],[72,1],[67,1],[69,1],[72,1],[69,1],[67,1]],[[65,1],[69,1],[69,1],[65,1],[67,1],[69,1],[67,1],[65,1]],[[64,1],[67,1],[65,1],[64,1],[62,4]],
 [[69,1],[74,1],[74,1],[69,1],[72,1],[74,1],[72,1],[69,1]],[[67,1],[72,1],[72,1],[67,1],[69,1],[72,1],[69,1],[67,1]],[[65,1],[69,1],[67,1],[65,1],[64,1],[67,1],[65,1],[64,1]],[[62,2],[69,2],[62,4]]
];
const CH=[[50,0],[48,1],[48,1],[50,0],[50,0],[53,1],[48,1],[50,0],[50,0],[48,1],[53,1],[45,1],[50,0],[48,1],[45,1],[50,0]];
const midi=n=>440*Math.pow(2,(n-69)/12);
const Music={on:true,timer:null,bar:0,next:0,tempo:132,
 start(){if(!AC||!this.on||this.timer)return;this.next=AC.currentTime+.08;this.bar=0;this.timer=setInterval(()=>this.tick(),30);},
 stop(){clearInterval(this.timer);this.timer=null;},
 tick(){const e=60/this.tempo/2;while(this.next<AC.currentTime+.15){this.playBar(this.bar,this.next,e);this.next+=e*8;this.bar=(this.bar+1)%MEL.length;}},
 playBar(b,t0,e){
  let s=0;for(const [n,l] of MEL[b]){tone(midi(n),e*l*.92,'square',.05,0,t0+s*e,musBus);tone(midi(n+12),e*l*.5,'triangle',.012,0,t0+s*e,musBus);s+=l;}
  const [root,maj]=CH[b];const third=maj?4:3;
  for(let i=0;i<8;i++){const t=t0+i*e;
   if(i===0||i===4)tone(midi(root-12),e*1.6,'triangle',.16,0,t,musBus);
   if(i%2===1){const acc=(i===1||i===5)?.022:.013;[0,third,7].forEach(iv=>tone(midi(root+12+iv),e*.45,'square',acc,0,t,musBus));noise(t,.04,acc*1.6,6000);}
  }
 }
};
function setMusic(on){Music.on=on;$('bMusic').classList.toggle('off',!on);if(on){ensureAudio();Music.start();}else Music.stop();}
function setMuted(m){muted=m;if(master)master.gain.value=m?0:1;toast(m?'Minden hang kikapcsolva':'Hang bekapcsolva');}

/* ================= input ================= */
const keys={left:false,right:false,down:false};let jumpBuf=0;const pressQ=new Set();
const HOLD={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'down',KeyS:'down'};
addEventListener('keydown',e=>{
 ensureAudio();if(Music.on&&!Music.timer&&mode!=='loading')Music.start();
 const k=e.code;
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','Tab'].includes(k))e.preventDefault();
 if(mode==='intro'){if(e.repeat)return;if(k==='Enter'||k==='Space'||k==='KeyE'||k==='ArrowRight')screenPrimary();else if(k==='Escape'&&screenBack)screenBack();e.preventDefault();return;}
 if(mode==='dialog'){if(e.repeat)return;if(k==='Enter'||k==='Space'||k==='KeyE'||k==='ArrowRight')dlgNext();else if(k==='Escape')dlgEnd();return;}
 if(HOLD[k]){keys[HOLD[k]]=true;return;}
 if(e.repeat)return;
 switch(k){
  case'ArrowUp':case'KeyW':case'Space':if(mode==='play')jumpBuf=7;else if(k==='Space')screenPrimary();break;
  case'KeyE':case'ShiftLeft':case'ShiftRight':case'KeyF':pressQ.add('special');break;
  case'Tab':case'KeyQ':pressQ.add('switch');break;
  case'Digit1':pressQ.add('sel0');break;case'Digit2':pressQ.add('sel1');break;case'Digit3':pressQ.add('sel2');break;
  case'KeyR':if(mode==='play'||mode==='dead')startLevel(S.i,false);break;
  case'Enter':case'NumpadEnter':screenPrimary();break;
  case'Escape':if(mode==='play')openMenu();else if(mode==='menu')closeMenu();else if(screenBack)screenBack();break;
  case'KeyM':setMuted(!muted);break;
  case'KeyN':setMusic(!Music.on);toast(Music.on?'Zene bekapcsolva':'Zene kikapcsolva');break;
 }
});
addEventListener('keyup',e=>{if(HOLD[e.code])keys[HOLD[e.code]]=false;});
addEventListener('blur',()=>{keys.left=keys.right=keys.down=false;});
document.querySelectorAll('#touch button').forEach(b=>{
 const k=b.dataset.k;
 b.addEventListener('pointerdown',e=>{e.preventDefault();ensureAudio();if(mode==='dialog'){dlgNext();return;}if(mode==='intro'){screenPrimary();return;}if(k==='left'||k==='right')keys[k]=true;else if(k==='jump')jumpBuf=7;else pressQ.add(k);});
 const up=()=>{if(k==='left'||k==='right')keys[k]=false;};
 b.addEventListener('pointerup',up);b.addEventListener('pointerleave',up);b.addEventListener('pointercancel',up);
});
document.querySelectorAll('.card').forEach(c=>c.addEventListener('click',()=>{ensureAudio();pressQ.add('sel'+c.dataset.i);}));
$('bMenu').onclick=()=>{ensureAudio();if(mode==='play')openMenu();else if(mode==='menu')closeMenu();else if(mode!=='loading')titleScreen();};
$('bMusic').onclick=()=>{ensureAudio();setMusic(!Music.on);};
function isActive(ch){return S&&S.chars[S.active]===ch;}
function syncCards(){document.querySelectorAll('.card').forEach(c=>c.classList.toggle('active',S&&+c.dataset.i===S.active));}
const PAP_SVG='<svg width="16" height="18" viewBox="0 0 16 18"><path d="M8 2 Q9 0 11 1" stroke="#3d9a4a" stroke-width="2" fill="none"/><path d="M4 4 Q8 2 12 4 Q14 10 7 17 Q2 12 4 4Z" fill="#d8343a"/><path d="M6 6 Q7 5 8 6 Q7 10 6 12Z" fill="#ff8b7a"/></svg>';
function updatePapHUD(){if(!S)return;const got=S.paps.filter(p=>p.got).length;$('pap').innerHTML=`${PAP_SVG}<span>${got}/${S.paps.length}</span><span class="tiny" style="margin-left:4px">Σ ${Math.max(totalPap(),0)}</span>`;}

/* ================= képernyők ================= */
const scr=$('screen');let screenPrimaryFn=null,screenBack=null;
function show(html,{dim=true,primary=null,back=null}={}){scr.innerHTML=html;scr.classList.remove('hide');scr.classList.toggle('dim',dim);screenPrimaryFn=primary;screenBack=back;}
function hideScreen(){scr.classList.add('hide');scr.innerHTML='';screenPrimaryFn=null;screenBack=null;}
function screenPrimary(){if(screenPrimaryFn)screenPrimaryFn();}
function on(id,fn){const el=$(id);if(el)el.onclick=()=>{ensureAudio();sfx('switch');fn();};}
let toastT=null;function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),1800);}
function banner(top,big){const b=$('banner');b.innerHTML=`<small>${top}</small><b>${big}</b>`;b.classList.add('show');setTimeout(()=>b.classList.remove('show'),1800);}
function por(id){
 if(id==='g')return '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#F5B83D"/><circle cx="14" cy="13" r="4" fill="#ffe2a0" opacity=".6"/><circle cx="14.5" cy="19" r="4.2" fill="#fff"/><circle cx="25.5" cy="19" r="4.2" fill="#fff"/><circle cx="15.8" cy="19.6" r="2.1" fill="#141a2e"/><circle cx="26.8" cy="19.6" r="2.1" fill="#141a2e"/></svg>';
 if(id==='t')return '<svg viewBox="0 0 40 40"><path d="M20 4 L38 36 L2 36 Z" fill="#EF6A5A"/><path d="M20 4 L38 36 L20 36Z" fill="#A8382C" opacity=".35"/><circle cx="15" cy="26" r="4" fill="#fff"/><circle cx="25" cy="26" r="4" fill="#fff"/><circle cx="16.2" cy="26.5" r="2" fill="#141a2e"/><circle cx="26.2" cy="26.5" r="2" fill="#141a2e"/></svg>';
 return '<svg viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="4" fill="#3FB8A9"/><rect x="4" y="29" width="32" height="7" fill="#1F7268" opacity=".45"/><circle cx="14" cy="17" r="4.2" fill="#fff"/><circle cx="26" cy="17" r="4.2" fill="#fff"/><circle cx="15.3" cy="17.6" r="2.1" fill="#141a2e"/><circle cx="27.3" cy="17.6" r="2.1" fill="#141a2e"/></svg>';
}
const COL={g:'#F5B83D',t:'#EF6A5A',k:'#3FB8A9'};

function loaderScreen(){
 mode='loading';
 show(`<div class="full" style="background:#0b1020"></div><div class="center"><img class="logo" src="assets/logo.jpg" alt=""><div class="bar"><i id="ldbar"></i></div><div class="tiny" id="ldtxt">Betöltés: képek, hímzések, paprikák...</div><div class="btns" id="ldbtn" style="margin-top:1.6cqw"></div></div>`,{dim:false});
 loadImages(()=>{const b=$('ldbar');if(b)b.style.width=(imgDone/imgTotal*100)+'%';},()=>{
  const t=$('ldtxt');if(t)t.textContent='Kész. A zene egy kattintásra indul.';
  const w=$('ldbtn');if(w){w.innerHTML='<button class="b primary" id="bGo">Indulás</button>';on('bGo',()=>{ensureAudio();Music.tempo=112;Music.start();titleScreen();});}
  screenPrimaryFn=()=>{ensureAudio();Music.tempo=112;Music.start();titleScreen();};
 });
}
function titleScreen(){
 mode='title';Music.tempo=112;
 if(!S||S.i!==0)loadLevel(Math.min(progress.unlocked,LEVELS.length-1));
 const bg=imgURL('keyart')||imgURL('falu');
 const cont=progress.unlocked>0;
 show(`<div class="full" style="background-image:url(${bg})"></div><div class="center"><img class="logo" src="assets/logo.jpg" alt="Három forma">
  <p class="sub">Gömb, háromszög, kocka. Egyenként egyik sem jut haza, együtt mindhárom. Gyűjtsétek össze a paprikákat, és vigyázzatok a tüskékre!</p>
  <div class="btns">${cont?`<button class="b primary" id="bCont">Folytatás (${progress.unlocked+1}. pálya)</button>`:''}<button class="b ${cont?'':'primary'}" id="bNew">Új játék</button><button class="b" id="bLv">Pályák</button><button class="b" id="bHow">Hogyan játssz</button></div>
  <p class="tiny" style="margin-top:1.4cqw">Összegyűjtött paprika: ${totalPap()} / ${LEVELS.length*3}</p></div>`,
 {dim:false,primary:()=>cont?playLevel(progress.unlocked):newGame()});
 on('bCont',()=>playLevel(progress.unlocked));
 on('bNew',()=>{if(cont)confirmNew(titleScreen);else newGame();});
 on('bLv',()=>levelsScreen(titleScreen));
 on('bHow',()=>howtoScreen(titleScreen));
}
function confirmNew(back){
 show(`<div class="center"><h2 style="font-size:clamp(18px,3cqw,30px);margin:0 0 1cqw">Új játék?</h2><p class="sub">Minden elölről kezdődik: a megnyitott pályák és a paprikák is nullázódnak.</p>
  <div class="btns"><button class="b primary" id="bYes">Igen, elölről</button><button class="b" id="bNo">Mégse</button></div></div>`,{primary:newGame,back});
 on('bYes',newGame);on('bNo',back);
}
function newGame(){resetProgress();playLevel(0);}
function levelsScreen(back){
 const cells=LEVELS.map((L,i)=>{const lock=i>progress.unlocked;const best=progress.best[i]||0;
  return `<button class="lv ${lock?'locked':''}" data-i="${i}" ${lock?'disabled':''}>${i+1}. ${L.name}<small>${lock?'zárva':`paprika: ${best}/3`}</small></button>`;}).join('');
 show(`<div class="panel"><button class="b close" id="bBack">Vissza</button><h2>Pályák</h2><p>Egy pálya akkor nyílik meg, ha az előzőt teljesítettétek.</p><div class="lvgrid">${cells}</div></div>`,{back});
 on('bBack',back);
 scr.querySelectorAll('.lv:not(.locked)').forEach(b=>b.onclick=()=>{ensureAudio();playLevel(+b.dataset.i);});
}
function howtoScreen(back){
 const fig=(k,cap)=>IMG[k]?`<figure><img src="${imgURL(k)}" alt=""><figcaption>${cap}</figcaption></figure>`:'';
 show(`<div class="panel"><button class="b close" id="bBack">Vissza</button><h2>Hogyan játssz</h2>
  <p>Mindhárom formának be kell érnie a zöld, hímzett kapuba. Egyszerre egyet irányítasz, a <kbd>Tab</kbd> vagy az <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> gomb vált köztük. Ha valaki elesik, a pálya újraindul. Minden pályán három paprika van, ezek nem kötelezők, de anyáék számolják.</p>
  <h3>A hősök</h3>
  <div class="heroes">
   <div class="hero" style="--c:#F5B83D"><b>Gömb</b><p>A leggyorsabb és a legmagasabbra ugrik. Gurul: lejtőn magától is elindul, és megtartja a lendületét. Felugrik a kockára, a háromszögön nekifutásból felszalad, és a csúcsán elrugaszkodik. A csúcsra ugorva nagyot pattan. Egyedül ő fér be az egy kocka magas résekbe.</p></div>
   <div class="hero" style="--c:#EF6A5A"><b>Háromszög</b><p>Élő rámpa és trambulin. <kbd>E</kbd>: roham, amivel áttöri a repedt falat. A tüskék nem fogják: a tüskés lyukba befordul, fejre áll, és hídként átengedi a többieket. A gömböt eltolja.</p></div>
   <div class="hero" style="--c:#3FB8A9"><b>Kocka</b><p>Lassú és nehéz: mindenkit eltol, őt senki. Az ágyú lövedéke elakad benne, a többiek mögé bújhatnak. Csak ő nyomja le a lila kapcsolót. <kbd>E</kbd>: bástya, toronnyá nő, és felemeli, aki rajta áll.</p></div>
  </div>
  <div class="hero" style="--c:#d8343a;margin-top:1.2cqw"><b>Irka, a szomszéd labradorja</b><p>Fekete kölyökkutya piros matyó nyakörvvel. Mindenhová utánatok szalad, felugrik a fejetekre, dörgölőzik, ugat, és néha meglök valakit. Nem lehet bántani, nem sérül meg, és a kapcsolókat sem nyomja le. Egyszerűen csak ott van.</p></div>${IMG.maszat?`<div class="gal">${fig('maszat','Irka, aki mindent jobban tud.')}</div>`:''}
  <h3>Pályaelemek</h3>
  <ul><li>Kék kapcsoló: amíg valaki rajta áll, nyitva a kék ajtó.</li><li>Lila kapcsoló: csak a kocka nyomja le, utána a lila ajtó nyitva marad.</li><li>Repedt fal: a háromszög rohama töri át.</li><li>Tüskés lyuk: a gömb és a kocka belehal, a háromszög befordul.</li><li>Ágyú: a lövedék a kockán kívül mindenkit leterít.</li></ul>
  <div class="gal">${fig('lyuk','A háromszög befordul a tüskés lyukba, a kocka átsétál rajta, a gömb felfut a rámpán.')}${fig('bastya','A kocka bástyává nő, a lövedék lepattan róla, a gömb a háromszög csúcsáról pattan fel.')}</div>
  <h3>Irányítás</h3>
  <p><kbd>←</kbd><kbd>→</kbd> mozgás, <kbd>↑</kbd> vagy <kbd>Space</kbd> ugrás, <kbd>E</kbd> képesség, <kbd>↓</kbd> nyomva tartva a gömb nem pattan, <kbd>R</kbd> pálya újra, <kbd>Esc</kbd> menü, <kbd>N</kbd> zene, <kbd>M</kbd> minden hang. Telefonon a képernyő alján lévő gombokkal játszhatsz.</p>
  <h3>A három forma élete</h3>
  <div class="gal">${fig('reggeli','Reggel a tornácon: lángos, paprikafüzér, és a kocka tölti a teát.')}${fig('fesztival','Matyó búcsú Mezőkövesden: a gömb pörög, a háromszög ugrál, a kocka dobbant.')}${fig('keyart','A legendás dobozborító, valahonnan a kilencvenes évekből.')}${fig('kapuk','Irka a kék kapcsolón. A kapu persze zárva marad.')}${fig('torony','Lift a paprikaszárítóban: a bástya felemeli a gömböt.')}${fig('ostrom','Élő torony az egri falak alatt.')}${fig('hazateres','Hajnali hazatérés, Irka körbe-körbe szalad.')}${fig('tabortuz','Este a paprikaföldön: bogrács, csillaghullás, csend.')}</div>
 </div>`,{back});
 on('bBack',back);
}
let menuPrev=null;
function openMenu(){
 menuPrev=mode;mode='menu';
 show(`<div class="center"><h2 style="font-size:clamp(20px,3.4cqw,34px);letter-spacing:.12em;margin:0 0 1.6cqw">SZÜNET</h2><div class="btns" style="flex-direction:column;align-items:center">
  <button class="b primary" id="mRes">Folytatás</button><button class="b" id="mRe">Pálya újrakezdése</button><button class="b" id="mLv">Pályák</button><button class="b" id="mHow">Hogyan játssz</button><button class="b" id="mMus">Zene: ${Music.on?'be':'ki'}</button><button class="b" id="mTitle">Címképernyő</button><button class="b" id="mNew">Új játék (mindent elölről)</button></div></div>`,{primary:closeMenu,back:closeMenu});
 on('mRes',closeMenu);on('mRe',()=>startLevel(S.i,false));on('mLv',()=>levelsScreen(openMenuAgain));on('mHow',()=>howtoScreen(openMenuAgain));
 on('mMus',()=>{setMusic(!Music.on);$('mMus').textContent='Zene: '+(Music.on?'be':'ki');});
 on('mTitle',titleScreen);on('mNew',()=>confirmNew(openMenuAgain));
}
function openMenuAgain(){mode='play';openMenu();}
function closeMenu(){hideScreen();mode=menuPrev==='menu'?'play':(menuPrev||'play');}

/* ---------- párbeszéd ---------- */
let dlg=null;
function playLevel(i){Music.tempo=132;startLevel(i,true);}
function startLevel(i,withDialog){
 loadLevel(i);jumpBuf=0;keys.left=keys.right=keys.down=false;
 const it=LEVELS[i].intro;
 if(withDialog&&it&&IMG[it[0]]){
  mode='intro';const c=groupCenter();S.cam={z:3,x:Math.max(160,Math.min(W-160,c.x)),y:c.y+H*.17/3};
  const u=imgURL(it[0]);
  show(`<div class="full blurbg" style="background-image:url(${u})"></div><img class="scene ${it[2]?'contain':''}" src="${u}" alt=""><button class="b skip" id="bSkip">Kihagyás ⏭</button>
   <div class="cap" id="capBox"><small>${i+1}. PÁLYA · ${LEVELS[i].name.toUpperCase()}</small><p>${it[1]}</p><span class="next">tovább ▶</span></div>`,{dim:false,primary:()=>beginDialog(i),back:()=>{beginDialog(i);dlgEnd();}});
  $('capBox').onclick=()=>{ensureAudio();beginDialog(i);};
  $('bSkip').onclick=()=>{ensureAudio();beginDialog(i);dlgEnd();};
  return;
 }
 if(withDialog)return beginDialog(i);
 hideScreen();mode='play';S.cam={z:1,x:W/2,y:H/2};banner(`${i+1}. PÁLYA`,LEVELS[i].name.toUpperCase());
}
function beginDialog(i){
 if(LEVELS[i].dialog&&LEVELS[i].dialog.length){
  mode='dialog';dlg={i:0,lines:LEVELS[i].dialog,typed:0,timer:null};
  const c=groupCenter();S.cam={z:3,x:Math.max(160,Math.min(W-160,c.x)),y:c.y+H*.17/3};
  renderDlg();
 }else{hideScreen();mode='play';banner(`${i+1}. PÁLYA`,LEVELS[i].name.toUpperCase());}
}
function groupCenter(){let x=0,y=0;for(const c of S.chars){x+=c.x+c.w/2;y+=c.y+c.h/2;}return{x:x/3,y:y/3};}
function renderDlg(){
 const [who,text]=dlg.lines[dlg.i];S.speaker=who;
 show(`<div class="dlg-top"><span class="ttl">${S.i+1}. PÁLYA · ${LEVELS[S.i].name.toUpperCase()}</span></div><button class="b skip" id="bSkip">Kihagyás ⏭</button>
  <div class="dlg" id="dlgBox" style="--c:${COL[who]}"><div class="por">${por(who)}</div><div class="box"><div class="name">${NAMES[who]}</div><div class="txt" id="dlgTxt"></div><div class="next">${dlg.i<dlg.lines.length-1?'tovább ▶':'indulás ▶'}</div></div></div>`,{dim:false});
 $('dlgBox').onclick=()=>{ensureAudio();dlgNext();};
 $('bSkip').onclick=e=>{e.stopPropagation();ensureAudio();dlgEnd();};
 dlg.typed=0;clearInterval(dlg.timer);
 const pitch={g:880,t:620,k:330}[who];
 dlg.timer=setInterval(()=>{dlg.typed++;const el=$('dlgTxt');if(!el){clearInterval(dlg.timer);return;}el.textContent=text.slice(0,dlg.typed);if(dlg.typed%3===0)sfx('blip',pitch+(Math.random()*60-30));if(dlg.typed>=text.length)clearInterval(dlg.timer);},24);
}
function dlgNext(){
 if(!dlg)return;const text=dlg.lines[dlg.i][1];
 if(dlg.typed<text.length){dlg.typed=text.length;clearInterval(dlg.timer);const el=$('dlgTxt');if(el)el.textContent=text;return;}
 dlg.i++;if(dlg.i>=dlg.lines.length)dlgEnd();else{sfx('switch');renderDlg();}
}
function dlgEnd(){if(!dlg)return;clearInterval(dlg.timer);dlg=null;S.speaker=null;hideScreen();mode='play';jumpBuf=0;banner(`${S.i+1}. PÁLYA`,LEVELS[S.i].name.toUpperCase());}


/* ================= Irka, a kölyökkutya (NPC) ================= */
function makeDog(){
 const g=S.chars[0];
 let x=Math.max(T+2,g.x-36);
 const y=g.y+g.h-22;
 return {x,y,w:30,h:22,vx:0,vy:0,onGround:false,face:1,state:'sit',t:90,tail:0,bark:0,ride:null,stuck:0,lastX:x,leg:0,lick:0};
}
function dogSolid(x,y,w,h){return rectSolid(x,y,w,h);}
function dogMoveX(d,dx){
 let rem=dx,blocked=false;
 while(rem!==0){const st=Math.abs(rem)>1?Math.sign(rem):rem;
  if(dogSolid(d.x+st,d.y,d.w,d.h)){blocked=true;break;}d.x+=st;rem-=st;}
 return blocked;
}
function dogMoveY(d,dy){
 d.onGround=false;d.ride=null;let rem=dy===0?0.01:dy;
 while(rem!==0){const st=Math.abs(rem)>1?Math.sign(rem):rem;
  if(st>0){const bottom=d.y+d.h;
   for(const c of alive()){
    const top=isSlope(c)?c.y+4:c.y;
    if(d.x<c.x+c.w-6&&d.x+d.w>c.x+6&&bottom<=top+0.5&&bottom+st>top){d.y=top-d.h;d.vy=0;d.onGround=true;d.ride=c;return;}}
   if(dogSolid(d.x,d.y+st,d.w,d.h)){d.vy=0;d.onGround=true;return;}
  }else if(dogSolid(d.x,d.y+st,d.w,d.h)){d.vy=0;return;}
  d.y+=st;rem-=st;}
}
function dogTeleport(d){
 const a=S.chars[S.active];if(!a||a.dead)return;
 for(const off of[-40,a.w+10,-80,a.w+50]){
  const x=a.x+off,y=a.y+a.h-d.h;
  if(!dogSolid(x,y,d.w,d.h)&&!isSpike(tileAt(x+d.w/2,y+d.h+2))){
   for(let i=0;i<10;i++)part(d.x+d.w/2,d.y+d.h/2,(Math.random()-.5)*4,-Math.random()*3,'#9aa0b8',4,24);
   d.x=x;d.y=y;d.vx=0;d.vy=0;d.stuck=0;
   for(let i=0;i<10;i++)part(x+d.w/2,y+d.h/2,(Math.random()-.5)*4,-Math.random()*3,'#9aa0b8',4,24);
   return;}
 }
}
function updateDog(){
 const d=S.dog;if(!d)return;
 d.tail+=d.state==='sit'?.5:.35;d.lick=Math.max(0,d.lick-1);if(d.bark>0)d.bark--;
 if(mode!=='play'){if(d.onGround)d.vx*=.8;d.vy=Math.min(d.vy+GRAV,MAXFALL);dogMoveX(d,d.vx);dogMoveY(d,d.vy);return;}
 const a=S.chars[S.active];
 d.t--;
 if(d.t<=0){
  const r=Math.random();
  if(r<.4){d.state='chase';d.t=140+Math.random()*80;}
  else if(r<.58){d.state='sit';d.t=70+Math.random()*60;}
  else if(r<.75){d.state='zoom';d.t=45+Math.random()*30;d.face=Math.random()<.5?-1:1;}
  else{d.state='wander';d.t=100+Math.random()*80;d.face=Math.random()<.5?-1:1;}
  if(Math.random()<.35){d.bark=45;sfx('bark');}
 }
 let target=0;
 if(d.state==='chase'&&a&&!a.dead){
  const dx=(a.x+a.w/2)-(d.x+d.w/2);
  if(Math.abs(dx)>14){d.face=Math.sign(dx);target=d.face*3.3;}
  if(Math.abs(dx)<40&&d.onGround&&a.onGround&&Math.random()<.025){d.vy=-9.5;d.vx=Math.sign(dx)*2.5;sfx('bark');d.bark=35;}
 }else if(d.state==='zoom')target=d.face*5.2;
 else if(d.state==='wander')target=d.face*1.5;
 if(d.onGround)d.vx+=(target-d.vx)*.25;
 d.vy=Math.min(d.vy+GRAV,MAXFALL);
 const rx=d.ride?d.ride.x-d.ride.prevX:0;
 const blocked=dogMoveX(d,d.vx+rx);
 if(blocked&&d.onGround&&target!==0){if(Math.random()<.5){d.vy=-9;}else if(d.state!=='chase'){d.face*=-1;}}
 dogMoveY(d,d.vy);
 if(Math.abs(target)>.1&&Math.abs(d.x-d.lastX)<.2)d.stuck++;else d.stuck=Math.max(0,d.stuck-2);
 d.lastX=d.x;
 d.leg+=Math.abs(d.x-(d.lastX2??d.x))*.25;d.lastX2=d.x;
 // ha nagyon lemaradt vagy beszorult, utánuk szalad
 if(a&&!a.dead&&(d.stuck>200||Math.abs((a.x+a.w/2)-(d.x+d.w/2))>560||d.y>H)){dogTeleport(d);}
 // dörgölőzik, löki őket (sosem a tüskék felé, sosem a lyukba fordult háromszöget)
 for(const c of alive()){
  if(c.plug||(c.id==='k'&&c.bastion)||!c.onGround)continue;
  if(d.x<c.x+c.w&&d.x+d.w>c.x&&d.y<c.y+c.h&&d.y+d.h>c.y+4){
   const dir=Math.sign((c.x+c.w/2)-(d.x+d.w/2))||d.face;
   const nx=c.x+c.w/2+dir*(c.w/2+6);
   if(!isSpike(tileAt(nx,c.y+c.h+2))&&!isSpike(tileAt(nx,c.y+c.h-2))&&S.frame%2===0)moveX(c,dir*.6);
   if(Math.random()<.01){d.bark=40;sfx('bark');}
   if(Math.random()<.008){d.lick=30;}
  }
 }
}
function drawDog(){
 const d=S.dog;if(!d)return;
 const {x,y,w,h,face}=d;
 const run=Math.abs(d.vx)>.4&&d.onGround;
 const sit=d.state==='sit'&&!run;
 ctx.save();
 ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x+w/2,y+h+1,w*.45,3,0,0,7);ctx.fill();
 ctx.translate(x+w/2,0);ctx.scale(face,1);ctx.translate(-(x+w/2),0);
 const body='#17171d',rim='#4d5068',ear='#0b0b0f';
 // farok
 const tw=Math.sin(d.tail*2.2)*(sit?.9:.5);
 ctx.strokeStyle=rim;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+3,y+8);ctx.lineTo(x-5,y+4-tw*6);ctx.stroke();
 ctx.strokeStyle=body;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+3,y+8);ctx.lineTo(x-5,y+4-tw*6);ctx.stroke();
 // lábak
 const ph=d.leg;
 ctx.fillStyle=body;
 const legs=sit?[[4,0],[20,0]]:[[4,Math.sin(ph)*3],[9,-Math.sin(ph)*3],[18,-Math.sin(ph)*3],[23,Math.sin(ph)*3]];
 for(const [lx,o] of legs){ctx.fillStyle=rim;ctx.fillRect(x+lx-1,y+h-8,6,9);ctx.fillStyle=body;ctx.fillRect(x+lx,y+h-8+Math.min(0,o)*.3,4,8+Math.max(0,o)*.2);}
 // törzs
 ctx.fillStyle=rim;rr(x-1,y+(sit?3:5)-1,w-6+2,h-10+2,6);ctx.fill();
 ctx.fillStyle=body;rr(x,y+(sit?3:5),w-6,h-10,6);ctx.fill();
 // fej
 const hx=x+w-12,hy=y-3+(sit?-2:0)+(run?Math.sin(ph*2)*1:0);
 ctx.fillStyle=rim;rr(hx-1,hy-1,16,14,5);ctx.fill();
 ctx.fillStyle=body;rr(hx,hy,14,12,5);ctx.fill();
 ctx.fillStyle=body;rr(hx+8,hy+5,9,7,3);ctx.fill();
 ctx.fillStyle='#000';ctx.fillRect(hx+15,hy+6,3,3);
 // fül
 ctx.fillStyle=ear;rr(hx+1,hy+1,5,9+Math.sin(d.tail)*1,2);ctx.fill();
 // szem
 ctx.fillStyle='#fff';ctx.fillRect(hx+7,hy+3,3,3);ctx.fillStyle='#5a3a1a';ctx.fillRect(hx+8,hy+4,2,2);
 // nyelv
 if(run||d.lick>0||sit){ctx.fillStyle='#ff7f9a';ctx.fillRect(hx+11,hy+11,3,4+(d.lick>0?2:0));}
 // piros matyó nyakörv
 ctx.fillStyle='#d8343a';ctx.fillRect(hx-1,hy+10,6,3);ctx.fillStyle='#ffd34d';ctx.fillRect(hx+1,hy+13,2,2);
 ctx.restore();
 if(d.bark>0){
  const bx=x+w/2+face*10,by=y-18-Math.min(6,(45-d.bark)*.4);
  ctx.fillStyle='#f3ead2';rr(bx-20,by-12,40,16,6);ctx.fill();
  ctx.fillStyle='#141a2e';ctx.font='800 12px DM Sans, sans-serif';ctx.textAlign='center';ctx.fillText('VAU!',bx,by+1);
 }
}

/* ================= képességek ================= */
function special(ch){
 if(ch.id==='t'){if(ch.dashCD>0||ch.dashT>0||ch.plug)return;ch.dashT=13;ch.dashCD=42;ch.vy=0;sfx('dash');}
 else if(ch.id==='k'){if(!ch.onGround&&!ch.bastion)return;ch.bastion=!ch.bastion;sfx('tower');}
 else{ch.hop=1;sfx('blip',990);}
}
function updateBastion(k){
 const target=k.bastion?BASTION_H:DEFS.k.h;
 if(k.h<target){
  for(let i=0;i<5&&k.h<target;i++){
   const blocked=rectSolid(k.x,k.y-1,k.w,1)||ridersOf(k).some(r=>!canRise(r,-1));
   if(blocked){k.bastion=false;toast('Nincs hely a bástyának');break;}
   for(const r of ridersOf(k))rise(r,-1);
   k.y-=1;k.h+=1;
  }
 }else if(k.h>target){const d=Math.min(6,k.h-target);k.y+=d;k.h-=d;}
}

/* ================= frissítés ================= */
function animTick(){
 S.frame++;
 if(S.shake>0)S.shake*=.85;if(S.shake<.3)S.shake=0;
 for(const p of S.parts){p.x+=p.vx;p.y+=p.vy;p.vy+=p.kind?.05:.18;p.vx*=p.kind?.99:1;p.rot+=.08;p.life--;}
 S.parts=S.parts.filter(p=>p.life>0);
 for(const c of S.chars){c.blink-=1;if(c.blink<-7)c.blink=90+Math.random()*240;if(c.hop>0)c.hop=Math.max(0,c.hop-.06);}
 const cam=S.cam;let tz=1,tx=W/2,ty=H/2;
 if(mode==='dialog'||mode==='intro'){let c=groupCenter();const sp=S.speaker&&S.chars.find(q=>q.id===S.speaker);if(sp&&mode==='dialog')c={x:(sp.x+sp.w/2)*.7+c.x*.3,y:sp.y+sp.h/2};tz=3;tx=Math.max(160,Math.min(W-160,c.x));ty=Math.max(90,c.y+(H*.5-H*.33)/tz);}
 cam.z+=(tz-cam.z)*.07;cam.x+=(tx-cam.x)*.07;cam.y+=(ty-cam.y)*.07;
 if(Math.abs(cam.z-tz)<.002){cam.z=tz;}
}
function update(){
 if(!S)return;
 animTick();
 updateDog();
 if(mode==='dead'){S.timer--;if(S.timer<=0)startLevel(S.i,false);return;}
 if(mode!=='play')return;

 let sw=false;
 if(pressQ.has('switch')){S.active=(S.active+1)%3;sw=true;}
 for(let i=0;i<3;i++)if(pressQ.has('sel'+i)){S.active=i;sw=true;}
 if(sw){sfx('switch');syncCards();jumpBuf=0;S.chars[S.active].hop=.8;}
 const wantSpecial=pressQ.has('special');
 pressQ.clear();
 const a=S.chars[S.active];

 for(const ch of S.chars){ch.prevX=ch.x;ch.pushing=false;}
 for(const ch of S.chars){
  const act=ch===a;
  let dir=act?(keys.right?1:0)-(keys.left?1:0):0;
  if(ch.id==='k'&&ch.bastion)dir=0;
  if(dir&&ch.dashT===0)ch.face=dir;
  const onSlope=ch.id==='g'&&ch.onGround&&ch.standingOn&&isSlope(ch.standingOn)?ch.standingOn:null;
  if(ch.dashT>0){
   ch.dashT--;ch.vx=ch.face*9.5;ch.vy=0;
   if(S.frame%2===0)part(ch.x+ch.w/2-ch.face*ch.w/2,ch.y+ch.h*.6,-ch.face*2,(Math.random()-.5),'#ffb3a6',5,16);
  }else{
   const target=dir*ch.speed*(ch.pushingPrev?.6:1);
   const fr=dir?ch.accel:(ch.id==='g'?(ch.onGround?.09:.02):.35);
   ch.vx+=(target-ch.vx)*fr;
   if(Math.abs(ch.vx)<.05)ch.vx=0;
   if(onSlope){const dx=(ch.x+ch.w/2)-(onSlope.x+onSlope.w/2);if(Math.abs(dx)>3)ch.vx+=Math.sign(dx)*.3;}
   ch.vy=Math.min(ch.vy+GRAV,MAXFALL);
  }
  if(ch.onGround)ch.coyote=6;else if(ch.coyote>0)ch.coyote--;
  if(act&&jumpBuf>0&&ch.coyote>0&&ch.dashT===0&&!(ch.id==='k'&&ch.bastion)&&ch.h===DEFS[ch.id].h){
   let jv=ch.jump,ramp=false;
   if(onSlope){const dx=(ch.x+ch.w/2)-(onSlope.x+onSlope.w/2);if(ch.vx*dx<0){jv+=Math.abs(ch.vx)*triM(onSlope)*.45;ramp=true;}}
   ch.plug=false;
   ch.vy=-jv;ch.coyote=0;jumpBuf=0;sfx(ramp?'ramp':'jump');
  }
  if(act&&wantSpecial)special(ch);
  if(ch.dashCD>0)ch.dashCD--;
  if(ch.id==='k')updateBastion(ch);
  const rampDx=onSlope?(ch.x+ch.w/2)-(onSlope.x+onSlope.w/2):null;
  moveX(ch,ch.vx);
  if(onSlope&&ch.vy>=0&&Math.abs(ch.vx)>3){
   const ndx=(ch.x+ch.w/2)-(onSlope.x+onSlope.w/2);
   const uphill=Math.sign(ch.vx)===-Math.sign(rampDx);
   if(uphill&&(Math.sign(ndx)!==Math.sign(rampDx)||Math.abs(ndx)<2)){
    ch.vy=-Math.abs(ch.vx)*triM(onSlope)*.8;ch.coyote=0;sfx('ramp');
    for(let i=0;i<6;i++)part(ch.x+ch.w/2,ch.y+ch.h,(Math.random()-.5)*3,Math.random()*2,'#ffe3a8',4,20);
   }
  }
  moveY(ch,ch.vy);
  if(ch.id==='g')ch.rot+=(ch.x-ch.prevX)/12;
  if(ch.squash>0)ch.squash=Math.max(0,ch.squash-.08);
  if(ch.flash>0)ch.flash--;
 }
 if(jumpBuf>0)jumpBuf--;
 for(const ch of S.chars)ch.pushingPrev=ch.pushing;

 const order=[...S.chars].sort((p,q)=>(q.y+q.h)-(p.y+p.h));
 for(const ch of order){const s=ch.standingOn;if(s){const dx=s.x-s.prevX;if(dx)moveX(ch,dx);}}
 for(const ch of S.chars){const s=ch.standingOn;
  if(!s||!ch.onGround)continue;
  if(s.id==='g'||(isSlope(s)&&ch.id!=='g')){const off=(ch.x+ch.w/2)-(s.x+s.w/2);if(Math.abs(off)>3)moveX(ch,Math.sign(off)*1.4);}}
 resolveOverlaps();

 for(const t of S.chars)if(t.id==='t'){
  const was=t.plug;
  t.plug=t.onGround&&isSpike(tileAt(t.x+t.w/2,t.y+t.h-1));
  if(t.plug&&!was){sfx('plug');S.shake=Math.max(S.shake,3);toast('A háromszög befordult a lyukba: át lehet menni rajta');}
 }
 for(const ch of S.chars){if(ch.id==='t'||ch.dead)continue;
  const hit=tilesIn(ch.x+3,ch.y+ch.h-6,ch.w-6,6,(c,r)=>S.grid[r]&&isSpike(S.grid[r][c])&&ch.y+ch.h>r*T+T-12);
  if(hit){kill(ch,'a tüskékre lépett');return;}}

 // paprikák
 for(const p of S.paps){if(p.got)continue;
  for(const ch of S.chars){if(ch.dead)continue;
   const cx=Math.max(ch.x,Math.min(p.x,ch.x+ch.w)),cy=Math.max(ch.y,Math.min(p.y,ch.y+ch.h));
   if((cx-p.x)**2+(cy-p.y)**2<121){p.got=true;sfx('paprika');
    for(let i=0;i<12;i++)part(p.x,p.y,(Math.random()-.5)*5,-Math.random()*4,i%2?'#d8343a':'#3d9a4a',4,30);
    updatePapHUD();break;}}}

 let light=false;
 for(const p of S.plates){
  const px=p.c*T+2,base=(p.r+1)*T,was=p.pressed;
  p.pressed=S.chars.some(ch=>!ch.dead&&(!p.heavy||ch.id==='k')&&ch.onGround&&ch.x<px+T-4&&ch.x+ch.w>px&&Math.abs(ch.y+ch.h-base)<1.5);
  if(p.pressed&&!was)sfx('plate');
  p.anim+=((p.pressed?1:0)-p.anim)*.3;
  if(p.pressed&&!p.heavy)light=true;
  if(p.pressed&&p.heavy&&!S.heavyOpen){S.heavyOpen=true;sfx('door');toast('A nehéz ajtó kinyílt, és nyitva marad');}
 }
 if(light&&!S.lightOpen){S.lightOpen=true;sfx('door');}
 else if(!light&&S.lightOpen){
  const blocked=S.chars.some(ch=>tilesIn(ch.x,ch.y,ch.w,ch.h,(c,r)=>S.grid[r]&&S.grid[r][c]==='d'));
  if(!blocked){S.lightOpen=false;sfx('door');}
 }
 S.lightAnim+=((S.lightOpen?1:0)-S.lightAnim)*.16;
 S.heavyAnim+=((S.heavyOpen?1:0)-S.heavyAnim)*.08;

 for(const t of S.turrets){t.timer--;if(t.timer<=0){t.timer=95;S.bullets.push({x:t.dir<0?t.c*T-3:(t.c+1)*T+3,y:t.r*T+T/2,vx:t.dir*5});sfx('shot');}}
 for(const b of S.bullets){
  b.x+=b.vx;
  if(solidTile(Math.floor(b.x/T),Math.floor(b.y/T))){b.dead=true;for(let i=0;i<4;i++)part(b.x,b.y,-b.vx*.3+(Math.random()-.5)*3,(Math.random()-.5)*3,'#ff7b6b',4,18);continue;}
  for(const ch of S.chars){
   if(ch.dead)continue;
   const cx=Math.max(ch.x,Math.min(b.x,ch.x+ch.w)),cy=Math.max(ch.y,Math.min(b.y,ch.y+ch.h));
   if((cx-b.x)**2+(cy-b.y)**2<16){
    b.dead=true;
    if(ch.id==='k'){ch.flash=8;sfx('absorb');for(let i=0;i<6;i++)part(b.x,b.y,-Math.sign(b.vx)*Math.random()*3,(Math.random()-.5)*4,'#bff7ef',4,20);}
    else kill(ch,'eltalálta az ágyú');
    break;
   }
  }
 }
 S.bullets=S.bullets.filter(b=>!b.dead);
 if(mode!=='play')return;

 const inExit=S.chars.every(ch=>{const c=Math.floor((ch.x+ch.w/2)/T),r=Math.floor((ch.y+ch.h-2)/T);return ch.onGround&&S.grid[r]&&S.grid[r][c]==='E';});
 if(inExit)win();
}
function kill(ch,why){
 if(mode!=='play')return;
 mode='dead';S.timer=85;sfx('die');S.shake=10;
 for(let i=0;i<26;i++)part(ch.x+ch.w/2,ch.y+ch.h/2,(Math.random()-.5)*8,-Math.random()*7,ch.color,5+Math.random()*3,50);
 ch.dead=true;
 toast(`A ${ch.name.toLowerCase()} ${why}. Újra...`);
}
function win(){
 mode='win';sfx('win');
 const got=S.paps.filter(p=>p.got).length,i=S.i;
 progress.best[i]=Math.max(progress.best[i]||0,got);
 progress.unlocked=Math.max(progress.unlocked,Math.min(i+1,LEVELS.length-1));
 if(i===LEVELS.length-1)progress.unlocked=LEVELS.length-1;
 saveProgress();updatePapHUD();
 const cols=['#d8343a','#ff7fa0','#5EA8FF','#F5B83D','#3d9a4a','#f3ead2'];
 for(let k=0;k<70;k++)part(Math.random()*W,-10-Math.random()*120,(Math.random()-.5)*2,1+Math.random()*2,cols[k%cols.length],5+Math.random()*4,200,1);
 if(TEST)return;
 setTimeout(()=>{
  if(mode!=='win')return;
  const last=i===LEVELS.length-1;
  if(last){
   const bg=imgURL('tabortuz')||imgURL('falu');
   show(`<div class="full" style="background-image:url(${bg})"></div><div class="center"><h2 style="font-size:clamp(24px,5cqw,56px);letter-spacing:.12em;margin:0;color:#f3ead2;text-shadow:0 .4cqw 0 #d8343a">HAZAÉRTEK</h2>
    <p class="sub">Mindhárom forma hazajutott. Este bogrács, csillaghullás, és a kocka mosogat.<br>Összegyűjtött paprika: ${totalPap()} / ${LEVELS.length*3}</p>
    <div class="btns"><button class="b primary" id="bAgain">Új játék</button><button class="b" id="bTitle">Címképernyő</button></div></div>`,{dim:false,primary:()=>confirmNew(titleScreen)});
   on('bAgain',()=>confirmNew(titleScreen));on('bTitle',titleScreen);
  }else{
   show(`<div class="center"><h2 style="font-size:clamp(22px,4cqw,44px);letter-spacing:.12em;margin:0 0 .6cqw;color:#7CF29A">PÁLYA KÉSZ</h2>
    <p class="sub">${i+1}. ${LEVELS[i].name} teljesítve. Paprika ezen a pályán: ${got}/${S.paps.length}.<br>Következik: ${LEVELS[i+1].name}.</p>
    <div class="btns"><button class="b green" id="bNext">Tovább (Enter)</button><button class="b" id="bRe">Újra a paprikákért</button><button class="b" id="bTitle">Címképernyő</button></div></div>`,{primary:()=>playLevel(i+1)});
   on('bNext',()=>playLevel(i+1));on('bRe',()=>playLevel(i));on('bTitle',titleScreen);
  }
 },900);
}

/* ================= rajzolás ================= */
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function isWall(c,r){if(c<0||c>=COLS||r<0||r>=ROWS)return true;const ch=S.grid[r][c];return ch==='#'||ch==='<'||ch==='>';}
function rose(x,y,r,col){
 ctx.fillStyle='#2f7a3c';ctx.beginPath();ctx.ellipse(x-r*1.3,y+r*.3,r*.75,r*.35,-.5,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(x+r*1.3,y+r*.3,r*.75,r*.35,.5,0,7);ctx.fill();
 ctx.fillStyle=col||'#d8343a';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
 ctx.fillStyle='#ff7f86';ctx.beginPath();ctx.arc(x,y,r*.6,0,7);ctx.fill();
 ctx.fillStyle=col||'#d8343a';ctx.beginPath();ctx.arc(x,y,r*.32,0,7);ctx.fill();
 ctx.fillStyle='#ffd34d';ctx.fillRect(x-1.5,y-1.5,3,3);
}
function paprika(x,y,ph){
 const b=Math.sin(S.frame*.07+ph)*3;y+=b;
 ctx.fillStyle='rgba(255,80,60,.18)';ctx.beginPath();ctx.arc(x,y,13+Math.sin(S.frame*.1+ph)*2,0,7);ctx.fill();
 ctx.fillStyle='#d8343a';ctx.beginPath();ctx.moveTo(x-6,y-5);ctx.quadraticCurveTo(x,y-9,x+6,y-5);ctx.quadraticCurveTo(x+8,y+4,x-1,y+12);ctx.quadraticCurveTo(x-8,y+4,x-6,y-5);ctx.fill();
 ctx.fillStyle='#ff8b7a';ctx.fillRect(x-3,y-3,3,7);
 ctx.fillStyle='#3d9a4a';ctx.fillRect(x-1,y-11,3,5);ctx.fillRect(x,y-12,5,2);
}
function drawBG(){
 const L=LEVELS[S.i],im=IMG[L.bg];
 if(im){const s=Math.max(W/im.width,H/im.height),w=im.width*s,h=im.height*s;ctx.drawImage(im,(W-w)/2,(H-h)/2,w,h);
  ctx.fillStyle=L.bg==='matyo'?'rgba(6,9,22,.72)':'rgba(6,9,22,.5)';ctx.fillRect(0,0,W,H);}
 else{const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0d1329');bg.addColorStop(1,'#151c37');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);}
}
function draw(){
 if(!S)return;
 const cam=S.cam;
 ctx.setTransform(RES,0,0,RES,0,0);ctx.imageSmoothingEnabled=true;
 ctx.fillStyle='#05070f';ctx.fillRect(0,0,W,H);
 ctx.save();
 ctx.translate(W/2,H/2);ctx.scale(cam.z,cam.z);ctx.translate(-cam.x,-cam.y);
 if(S.shake)ctx.translate((Math.random()-.5)*S.shake,(Math.random()-.5)*S.shake);
 drawBG();

 const e=S.exit;
 if(e[2]>=0){const x=e[0]*T,y=e[1]*T-T,w=(e[2]-e[0]+1)*T,h=(e[3]-e[1]+2)*T;const pulse=.5+.5*Math.sin(S.frame*.06);
  const gr=ctx.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'rgba(124,242,154,0)');gr.addColorStop(1,`rgba(124,242,154,${.16+pulse*.12})`);
  ctx.fillStyle=gr;ctx.fillRect(x+4,y,w-8,h);
  ctx.fillStyle='#6b3b1f';ctx.fillRect(x,y-6,6,h+6);ctx.fillRect(x+w-6,y-6,6,h+6);ctx.fillRect(x,y-10,w,8);
  ctx.fillStyle='#f3ead2';for(let i=8;i<w-8;i+=10)ctx.fillRect(x+i,y-8,4,4);
  rose(x+w/2,y-12,8);rose(x+8,y-10,5,'#ff6f9a');rose(x+w-8,y-10,5,'#ff6f9a');
  ctx.fillStyle=`rgba(124,242,154,${.6+pulse*.4})`;ctx.font='800 16px DM Sans, sans-serif';ctx.textAlign='center';ctx.fillText('HAZA',x+w/2,y+20);}

 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  const ch=S.grid[r][c],x=c*T,y=r*T;
  if(ch==='#'){
   ctx.fillStyle='#2e3963';ctx.fillRect(x,y,T,T);
   ctx.fillStyle='rgba(0,0,0,.12)';if((c+r)%2)ctx.fillRect(x,y,T,T);
   if(!isWall(c,r-1)){ctx.fillStyle='#53639c';ctx.fillRect(x,y,T,6);const cs=['#d8343a','#f3ead2','#3d9a4a'];for(let i=0;i<4;i++){ctx.fillStyle=cs[(c+i)%3];ctx.fillRect(x+2+i*8,y+1,4,4);}}
   if(!isWall(c-1,r)){ctx.fillStyle='#3e4b7c';ctx.fillRect(x,y,2,T);}
   if(!isWall(c+1,r)){ctx.fillStyle='#1f2747';ctx.fillRect(x+T-2,y,2,T);}
   if(!isWall(c,r+1)){ctx.fillStyle='#1c2342';ctx.fillRect(x,y+T-2,T,2);}
  }else if(ch==='^'||ch==='q'){
   ctx.fillStyle='#070a16';ctx.fillRect(x,y,T,T);
   if(ch==='q'){const p=S.plates.find(p=>p.c===c&&p.r===r);ctx.fillStyle=`rgba(94,168,255,${.35+(p?p.anim*.5:0)})`;ctx.fillRect(x+2,y+T-5,T-4,5);}
   ctx.fillStyle='#c9d1ea';
   for(let i=0;i<3;i++){const sx=x+i*10;ctx.beginPath();ctx.moveTo(sx,y+T);ctx.lineTo(sx+5,y+T-14);ctx.lineTo(sx+10,y+T);ctx.closePath();ctx.fill();}
  }else if(ch==='X'){
   ctx.fillStyle='#6b5a49';ctx.fillRect(x,y,T,T);ctx.fillStyle='#806c57';ctx.fillRect(x+2,y+2,T-4,T-4);
   ctx.strokeStyle='#3d3127';ctx.lineWidth=2.4;ctx.beginPath();
   const s=(c*7+r*13)%5;ctx.moveTo(x+6+s,y+2);ctx.lineTo(x+13,y+12+s);ctx.lineTo(x+9,y+20);ctx.lineTo(x+17,y+28);ctx.moveTo(x+13,y+12+s);ctx.lineTo(x+25,y+9);ctx.stroke();
  }else if(ch==='d'||ch==='D'){
   const heavy=ch==='D',an=heavy?S.heavyAnim:S.lightAnim,col=heavy?'176,124,255':'94,168,255';
   const hh=T*(1-an);
   if(hh>.5){ctx.fillStyle=`rgba(${col},.25)`;ctx.fillRect(x+3,y,T-6,hh);
    ctx.fillStyle=`rgba(${col},.95)`;
    for(let i=0;i<(heavy?3:2);i++){const bx=heavy?x+4+i*9:x+7+i*11;ctx.fillRect(bx,y,heavy?4:4,hh);}
    if(heavy)ctx.fillRect(x+3,y+Math.max(0,hh-4),T-6,Math.min(4,hh));}
  }else if(ch==='<'||ch==='>'){
   ctx.fillStyle='#2e3963';ctx.fillRect(x,y,T,T);
   const t=S.turrets.find(t=>t.c===c&&t.r===r);const warm=t?Math.max(0,1-t.timer/30):0;
   ctx.fillStyle='#3a2a3a';rr(x+3,y+4,T-6,T-8,5);ctx.fill();
   ctx.fillStyle='#55405a';ctx.fillRect(ch==='<'?x-4:x+T-6,y+T/2-4,10,8);
   ctx.fillStyle=`rgba(255,${110-warm*60},${100-warm*60},${.45+warm*.55})`;ctx.beginPath();ctx.arc(x+T/2,y+T/2,5+warm*2,0,7);ctx.fill();
  }
 }
 for(const p of S.plates){
  if(S.grid[p.r][p.c]==='q')continue;
  const x=p.c*T,base=(p.r+1)*T,col=p.heavy?'#B07CFF':'#5EA8FF',h=p.heavy?8:6;
  const down=p.anim*(h-2);
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(x+2,base-3,T-4,3);
  ctx.fillStyle=col;ctx.globalAlpha=.75+p.anim*.25;rr(x+(p.heavy?1:4),base-h+down,T-(p.heavy?2:8),h-down,2);ctx.fill();ctx.globalAlpha=1;
 }
 for(const p of S.paps)if(!p.got)paprika(p.x,p.y,p.ph);
 drawDog();
 for(const ch of S.chars)if(!ch.dead)drawChar(ch);
 const a=S.chars[S.active];
 if(a&&!a.dead&&mode==='play'){const bob=Math.sin(S.frame*.15)*3,ax=a.x+a.w/2,ay=a.y-12+bob;
  ctx.fillStyle=a.color;ctx.beginPath();ctx.moveTo(ax-7,ay-8);ctx.lineTo(ax+7,ay-8);ctx.lineTo(ax,ay);ctx.closePath();ctx.fill();}
 for(const b of S.bullets){ctx.fillStyle='rgba(255,90,80,.3)';ctx.beginPath();ctx.arc(b.x,b.y,8,0,7);ctx.fill();ctx.fillStyle='#ff8a7a';ctx.beginPath();ctx.arc(b.x,b.y,5,0,7);ctx.fill();}
 for(const p of S.parts){ctx.globalAlpha=Math.max(0,Math.min(1,p.life/Math.min(p.max,40)));
  if(p.kind===1){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);rose(0,0,p.size*.7,p.color);ctx.restore();}
  else{ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}}
 ctx.globalAlpha=1;
 ctx.restore();
 // párbeszéd alatt csak a hősök látszanak
 const v=Math.max(0,Math.min(1,(cam.z-1)/2.2));
 if(v>0.01){const vy=H/2-H*.17*v;const g=ctx.createRadialGradient(W/2,vy,H*.15,W/2,vy,H*.6);g.addColorStop(0,'rgba(3,5,12,0)');g.addColorStop(1,`rgba(3,5,12,${.97*v})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
}
function eyes(cx,cy,face,gap,closed){
 for(const s of[-1,1]){
  if(closed){ctx.fillStyle='#141a2e';ctx.fillRect(cx+s*gap-4,cy-1,8,2.5);continue;}
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx+s*gap,cy,4.4,0,7);ctx.fill();
  ctx.fillStyle='#141a2e';ctx.beginPath();ctx.arc(cx+s*gap+face*1.6,cy+.4,2.3,0,7);ctx.fill();}
}
function drawChar(ch){
 let {x,y,w,h}=ch;const sq=ch.squash;
 const speaking=mode==='dialog'&&S.speaker===ch.id;
 const hopY=(speaking?Math.abs(Math.sin(S.frame*.22))*5:0)+Math.sin(ch.hop*Math.PI)*8;
 const closed=ch.blink<0;
 const moving=Math.abs(ch.x-ch.prevX)>.3&&ch.onGround;
 ctx.save();
 if(!ch.plug){ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x+w/2,y+h+1,w*.45,3,0,0,7);ctx.fill();}
 ctx.translate(0,-hopY);
 const breathe=1+Math.sin(S.frame*.06+(ch.id==='t'?1:ch.id==='k'?2:0))*.015;
 const sx=(1+sq*.18)/breathe,sy=(1-sq*.2)*breathe;
 ctx.translate(x+w/2,y+h);
 if(moving&&ch.id!=='g')ctx.rotate(Math.sin(S.frame*.45)*.05);
 ctx.scale(sx,sy);ctx.translate(-(x+w/2),-(y+h));
 if(ch.id==='g'){
  const cx=x+w/2,cy=y+h/2,r=w/2;
  ctx.fillStyle=ch.color;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.clip();
  ctx.strokeStyle=ch.dark;ctx.lineWidth=4;ctx.globalAlpha=.55;ctx.beginPath();
  ctx.moveTo(cx+Math.cos(ch.rot)*r,cy+Math.sin(ch.rot)*r);ctx.lineTo(cx-Math.cos(ch.rot)*r,cy-Math.sin(ch.rot)*r);ctx.stroke();ctx.restore();
  ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.arc(cx-r*.35,cy-r*.4,r*.28,0,7);ctx.fill();
  eyes(cx+ch.face*2,cy-1,ch.face,5,closed);
 }else if(ch.id==='t'){
  ctx.fillStyle=ch.dashT>0?'#ff8f7f':ch.color;
  if(ch.plug){
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w/2,y+h);ctx.closePath();ctx.fill();
   ctx.fillStyle='rgba(255,255,255,.3)';ctx.fillRect(x,y,w,3);
   eyes(x+w/2+ch.face*2,y+9,ch.face,5.5,closed);
  }else{
   ctx.beginPath();ctx.moveTo(x+w/2,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();ctx.fill();
   ctx.fillStyle=ch.dark;ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(x+w/2,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x+w/2,y+h);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
   eyes(x+w/2+ch.face*2,y+h*.66,ch.face,5,closed);
  }
  if(ch.dashCD>0&&ch.dashT===0){ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(x,y+h+4,w*(1-ch.dashCD/42),3);}
 }else{
  const tall=h>DEFS.k.h+4;
  ctx.fillStyle=ch.flash?'#c8fff6':ch.color;
  if(tall){
   const m=8,mw=w/5;
   ctx.fillRect(x,y+m,w,h-m);
   for(let i=0;i<3;i++)ctx.fillRect(x+i*2*mw,y,mw,m+1);
   ctx.strokeStyle=ch.dark;ctx.lineWidth=2;ctx.globalAlpha=.55;
   for(let yy=y+m+12;yy<y+h-2;yy+=12){ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.stroke();
    const off=((yy-y)/12)%2?w/2:w/4;ctx.beginPath();ctx.moveTo(x+off,yy-12);ctx.lineTo(x+off,yy);ctx.stroke();}
   ctx.globalAlpha=1;
   ctx.fillStyle='#d8343a';ctx.fillRect(x+w/2-2,y+m+1,4,4);
   eyes(x+w/2+ch.face*2,y+m+12,ch.face,6.5,closed);
  }else{
   rr(x,y,w,h,4);ctx.fill();
   ctx.fillStyle=ch.dark;ctx.globalAlpha=.35;ctx.fillRect(x,y+h-7,w,7);ctx.globalAlpha=1;
   eyes(x+w/2+ch.face*3,y+h*.42,ch.face,7,closed);
  }
 }
 ctx.restore();
}

/* ================= fő ciklus ================= */
let last=performance.now(),acc=0;
function loop(now){
 acc+=Math.min(100,now-last);last=now;
 while(acc>=1000/60){update();acc-=1000/60;}
 draw();requestAnimationFrame(loop);
}
loadLevel(0);
if(TEST){mode='play';hideScreen();}
else{loaderScreen();requestAnimationFrame(loop);}
window.__game={get S(){return S;},get mode(){return mode;},keys,startLevel:i=>{startLevel(i,false);},playLevel,press:k=>pressQ.add(k),jump:()=>{jumpBuf=7;},update,draw,LEVELS,dlgNext,dlgEnd,titleScreen,howtoScreen,levelsScreen,openMenu};
})();
