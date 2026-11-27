/*
  main.js — логика лендинга heartfix HF-01:
  3D-сердце (three.js), сборка/разборка, режим «Заглянуть внутрь»,
  окно детали, колесо глав и глава 01 «Поломка».
*/
(function () {
'use strict';

/* Базовый класс компонента: хранит состояние и перерисовывает страницу при изменениях */
class DCLogic {
  constructor() { this.props = {}; this.state = undefined; }
  setState(patch) {
    const prev = this.state || {};
    this.state = Object.assign({}, prev, typeof patch === 'function' ? patch(prev, this.props) : patch);
    scheduleRender();
  }
  forceUpdate() { scheduleRender(); }
}

/* ---------- данные и логика страницы ---------- */
const PARTS_INFO=[['Винт «время»','Держит всю конструкцию. Не ускоряется — поэтому больше одной детали в день не поставить.','ставится первым'],['Клей «прощение»','Себе — обязательно, другим — по желанию.','работает и для вины за первый хороший день'],['Люди в 2 ночи','Единственная деталь, которую ставит не владелец, а близкий человек.','одной не установить'],['Запасная улыбка','На случай, если своя ещё не вернулась.','временная, своя лучше'],['Плейлист для слёз','Разрешает плакать столько, сколько нужно.','потом его заменит №12'],['Одеяло-кокон','Один день, чтобы ничего не делать. Это тоже сборка.','1 день, ∞ сериалов'],['Что-то вкусное','Делится с деталью №03.','многоразовая'],['Звонок тому, кто любит','Один длинный разговор.','лучше голосом, чем текстом'],['Клапан «я в порядке»','Декоративный. Ничего не делает.','не опираться'],['Аккумулятор самоуважения','Заряжается от добрых слов себе.','зарядка ежедневная'],['Шестерёнка «спокойное утро»','Запускает первое утро без тяжести.','крутится сама, если не мешать'],['Плейлист «я справляюсь»','Многоразовый. Заменяет плейлист №05.','громкость — по желанию'],['Пружина «смех до слёз»','Первые слёзы, но уже от смеха.','возможен смех в метро'],['Свеча «вечер для себя»','Вечер без телефона.','зажигать по вечерам'],['Прогулка без цели','Воздух и шаги вместо мыслей по кругу.','маршрут не нужен'],['Мысли о будущем','Первые планы после потери.','ставится последней из базовых']];
const CH=[['00','heartfix'],['01','Поломка'],['02','Знакомство'],['03','Комплект'],['04','Модули'],['05','Сборка'],['06','Правила'],['07','Инструкция'],['08','Вкладыш'],['09','Целое'],['10','Подарок'],['11','Доставка'],['12','Вопросы'],['13','Заказ']];
const MATS=['винт «время»','клей «прощение»','люди в 2 ночи','запасная улыбка','плейлист для слёз','одеяло-кокон','что-то вкусное','звонок тому, кто любит','клапан «я в порядке» (декор.)','аккумулятор самоуважения','шестерёнка «спокойное утро»','плейлист «я справляюсь»','пружина «смех до слёз»','свеча «вечер для себя»','прогулка без цели','мысли о будущем'];
const CIRC=['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯'];
const OBJS=[
{item:'брелок на двоих',sit:'расставание',mod:'«После него»',goal:'Перестать ждать и писать.',fin:'открытость новому',trap:'ловушка: написать бывшему — откат на 3 детали',x:30,y:200,w:230,r:-4},
{item:'браслет дружбы',sit:'ссора с лучшей подругой',mod:'«Без лучшей подруги»',goal:'Не винить себя и не оставаться одной.',fin:'дружба снова возможна',trap:'ловушка: делать вид, что тебе всё равно',x:330,y:176,w:230,r:3},
{item:'рамка для фото',sit:'смерть близкого человека',mod:'«Светлая память»',goal:'Прожить горе и не закрыться от людей. Без срока и без ловушки.',fin:'любовь остаётся',trap:'без срока и без ловушки — никто не торопит',x:1060,y:140,w:200,r:0},
{item:'ошейник с жетоном',sit:'потеря питомца',mod:'«Лапа на сердце»',goal:'Разрешить себе горевать всерьёз. Без срока.',fin:'место, где он был счастлив',trap:'без срока и без ловушки — горевать можно всерьёз',x:60,y:470,w:220,r:2},
{item:'коробка «хрупкое»',sit:'переезд и одиночество',mod:'«Новый город»',goal:'Заново найти своих людей.',fin:'здесь тоже дом',trap:'по одной детали в день, как и в базе',x:400,y:432,w:230,r:-3},
{item:'письмо «к сожалению»',sit:'провал, увольнение, не поступила',mod:'«План Б»',goal:'Вернуть веру в себя.',fin:'новая попытка',trap:'ловушка: сказать себе «я ничего не умею»',x:700,y:262,w:200,r:5}];
const PIX={heart:['.XX.XX.','XXXXXXX','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'],broken:['.XX.XX.','XXX.XXX','XXXX.XX','XXX.XXX','.XX.XX.','..X.X..','...X...'],glass:['XXXXXXX','.X...X.','..X.X..','...X...','..XXX..','.XXXXX.','XXXXXXX'],mail:['.......','XXXXXXX','XX...XX','X.X.X.X','X..X..X','XXXXXXX','.......'],screw:['..XXX..','.XX.XX.','..XXX..','...X...','..XXX..','...X...','...X...']};
const TILES=['broken','glass','screw','mail','heart'];
const clamp=(v)=>Math.min(1,Math.max(0,v));
const CX=310,CY=295;
const HEART_D=(()=>{let d='';for(let i=0;i<=150;i++){const t=Math.PI*2*i/150;const x=CX+16*Math.pow(Math.sin(t),3)*7.8;const y=285-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*7.8;d+=(i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)+' ';}return d+'Z';})();
const GEAR_D=(()=>{let d='';const n=10;for(let i=0;i<n*2;i++){const a1=i*Math.PI/n,a2=(i+1)*Math.PI/n;const r=i%2?15:21;const p=(a,rr)=>(rr*Math.cos(a)).toFixed(1)+' '+(rr*Math.sin(a)).toFixed(1);d+=(i?'L':'M')+p(a1+0.05,r)+' L'+p(a2-0.05,r)+' ';}return d+'Z';})();
const SPRING_D=(()=>{let d='M0 -24';for(let i=0;i<6;i++){const y=-20+i*8;d+=` C14 ${y} 14 ${y+4} 0 ${y+4} C-14 ${y+4} -14 ${y+8} 0 ${y+8}`;}return d;})();
const POS=Array.from({length:16},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/16;return [CX+252*Math.cos(a),CY+234*Math.sin(a),a];});
const LEAD_D=POS.map(p=>{const a=p[2];return `M${(CX+150*Math.cos(a)).toFixed(1)} ${(CY+138*Math.sin(a)).toFixed(1)} L${(CX+216*Math.cos(a)).toFixed(1)} ${(CY+200*Math.sin(a)).toFixed(1)}`;}).join(' ');
class Component extends DCLogic {
  componentDidMount(){
    this._h=()=>{if(this._raf)return;this._raf=requestAnimationFrame(()=>{this._raf=null;this.measure();});};
    window.addEventListener('scroll',this._h,true);window.addEventListener('resize',this._h);this.measure();
    this._tries=0;const go=()=>{if(this._dead)return;if(window.THREE){this.init3D();}else if(this._tries++<40){setTimeout(go,150);}};go();
  }
  componentWillUnmount(){this._dead=true;if(this._rafG)cancelAnimationFrame(this._rafG);if(this._R)this._R.dispose();if(this._R2)this._R2.dispose();window.removeEventListener('scroll',this._h,true);window.removeEventListener('resize',this._h);}
  measure(){
    const vh=window.innerHeight||800;let active=0;
    for(let i=0;i<CH.length;i++){const el=document.getElementById('ch-'+CH[i][0]);if(el&&el.getBoundingClientRect().top<vh*0.5)active=i;}
    const root=document.getElementById('hf-root');const vw=root?root.clientWidth:1440;
    const hero=document.getElementById('ch-00');const st=hero?-hero.getBoundingClientRect().top+56:0;
    const a=clamp(st/560);document.querySelectorAll('#ch-01,#ch-03').forEach(el=>{if(!el.classList.contains('ch-in')&&el.getBoundingClientRect().top<vh*0.7)el.classList.add('ch-in');});
    const s=this.state||{};const seen=Object.assign({},s.seen);let ch=false;
    document.querySelectorAll('[data-rv]').forEach(el=>{const k=el.getAttribute('data-rv');if(!seen[k]&&el.getBoundingClientRect().top<vh*0.88){seen[k]=true;ch=true;}});
    if(ch||s.active!==active||Math.abs((s.a||0)-a)>0.003||s.vw!==vw||s.vh!==vh)this.setState({active,a,seen,vw,vh});
  }
  init3D(){
    const T=window.THREE;const cv=document.getElementById('hf3d');if(!T||!cv||this._R)return;
    let R;try{R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});}catch(err){return;}
    this._R=R;R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R.setClearColor(0x000000,0);
    const scene=new T.Scene();const cam=new T.PerspectiveCamera(30,1.2,0.1,100);cam.position.set(0,0.4,15);
    scene.add(new T.AmbientLight(0xffffff,0.5));const dl=new T.DirectionalLight(0xffffff,0.95);dl.position.set(3.5,5,6);scene.add(dl);
    const gm=new T.DataTexture(new Uint8Array([90,90,90,255,175,175,175,255,255,255,255,255]),3,1,T.RGBAFormat);gm.minFilter=T.NearestFilter;gm.magFilter=T.NearestFilter;gm.needsUpdate=true;
    const HATCH='#include <dithering_fragment>\n float lum=dot(gl_FragColor.rgb,vec3(.299,.587,.114));\n float d1=mod(gl_FragCoord.x+gl_FragCoord.y,7.0);\n float d2=mod(gl_FragCoord.x-gl_FragCoord.y,7.0);\n vec2 cel=floor(gl_FragCoord.xy/vec2(11.0,4.0));\n float br=fract(sin(dot(cel,vec2(12.9898,78.233)))*43758.5453);\n float br2=fract(sin(dot(cel+7.0,vec2(39.3468,11.135)))*24634.6345);\n if(lum<0.8&&d1<1.2+br*0.9&&br>0.22) gl_FragColor.rgb*=0.6;\n if(lum<0.52&&d2<1.1+br2*0.8&&br2>0.3) gl_FragColor.rgb*=0.6;';
    const toon=(c)=>{const m=new T.MeshToonMaterial({color:new T.Color(c),gradientMap:gm});m.onBeforeCompile=(sh)=>{sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>',HATCH);};return m;};
    const SEED={value:0};const NZ='float hs(vec3 p){p=fract(p*0.3183099+vec3(.1,.2,.3));p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}float nz(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);return mix(mix(mix(hs(i),hs(i+vec3(1,0,0)),f.x),mix(hs(i+vec3(0,1,0)),hs(i+vec3(1,1,0)),f.x),f.y),mix(mix(hs(i+vec3(0,0,1)),hs(i+vec3(1,0,1)),f.x),mix(hs(i+vec3(0,1,1)),hs(i+vec3(1,1,1)),f.x),f.y),f.z);}';const ink=(w,ph,op)=>new T.ShaderMaterial({side:T.BackSide,transparent:(op||1)<1,depthWrite:(op||1)>=1,uniforms:{w:{value:w},seed:SEED,ph:{value:ph||0},op:{value:op||1}},vertexShader:'uniform float w;uniform float seed;uniform float ph;'+NZ+'void main(){vec3 q=position*2.6+vec3(seed*3.1+ph,seed*1.7,ph);float n=nz(q);float n2=nz(position*9.0+seed*5.0+ph);float ww=w*(0.25+1.7*n*n)+w*0.45*(n2-0.5);vec3 p=position+normal*max(ww,w*0.12);vec4 mv=modelViewMatrix*vec4(p,1.0);mv.xy+=(vec2(nz(position*4.0+seed+ph),nz(position*4.0-seed-ph))-0.5)*w*1.1;gl_Position=projectionMatrix*mv;}',fragmentShader:'uniform float op;void main(){gl_FragColor=vec4(0.07,0.07,0.08,op);}'});
    const INK=ink(0.05,0.0,1.0),INKS=ink(0.03,0.0,1.0),INK2=ink(0.085,4.2,0.45);
    const mesh=(geo,c,parent,thin,pos,rot)=>{const g=new T.Group();g.add(new T.Mesh(geo,toon(c)));g.add(new T.Mesh(geo,thin?INKS:INK));if(pos)g.position.set(pos[0],pos[1],pos[2]);if(rot)g.rotation.set(rot[0],rot[1],rot[2]);parent.add(g);return g;};
    const V3=(x,y,z)=>new T.Vector3(x,y,z);
    const ctex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new T.CanvasTexture(c);t.anisotropy=4;return t;};
    const root=new T.Group();scene.add(root);const heart=new T.Group();heart.position.set(0.1,-0.62,0);heart.rotation.z=0.32;root.add(heart);scene.updateMatrixWorld(true);
    // ventricle shape: unit sphere -> organic, tapered to the apex
    const def=(x,y,z)=>{const k=y<0?1+y*0.3:1;const n=1+0.035*Math.sin(5*x+3*y)*Math.sin(4*z+2*y);return V3(x*1.45*k*n,y*1.72*n,z*1.2*k*n);};
    const dir=(x,y,z)=>{const v=V3(x,y,z).normalize();return def(v.x,v.y,v.z);};
    const D0=V3(0.18,-0.12,1).normalize();const AL=0.56,CA=Math.cos(AL);
    const sp=new T.SphereGeometry(1,72,52).toNonIndexed();const pa=sp.attributes.position.array;const keep=[];
    for(let i=0;i<pa.length;i+=9){const cx=(pa[i]+pa[i+3]+pa[i+6])/3,cy=(pa[i+1]+pa[i+4]+pa[i+7])/3,cz=(pa[i+2]+pa[i+5]+pa[i+8])/3;const l=Math.hypot(cx,cy,cz)||1;if((cx*D0.x+cy*D0.y+cz*D0.z)/l<CA){for(let j=0;j<9;j+=3){const p=def(pa[i+j],pa[i+j+1],pa[i+j+2]);keep.push(p.x,p.y,p.z);}}}
    const vg=new T.BufferGeometry();vg.setAttribute('position',new T.Float32BufferAttribute(keep,3));vg.computeVertexNormals();
    const vent=new T.Group();vent.add(new T.Mesh(vg,toon('#D8473F')));vent.add(new T.Mesh(vg,INK));vent.add(new T.Mesh(vg,INK2));heart.add(vent);
    const wall=new T.Mesh(vg.clone().scale(0.95,0.95,0.95),new T.MeshBasicMaterial({color:'#4E1513',side:T.BackSide}));heart.add(wall);
    // atria
    const blob=(r,sx,sy,sz,c,pos)=>{const g=new T.SphereGeometry(r,40,28);const a=g.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i);const n=1+0.05*Math.sin(6*x+2*z)*Math.sin(5*y);a.setXYZ(i,x*sx*n,y*sy*n,z*sz*n);}g.computeVertexNormals();return mesh(g,c,heart,false,pos);};
    blob(0.75,1,0.85,0.9,'#C23B35',[-1.0,1.3,0.05]);blob(0.62,1.1,0.8,0.9,'#B8352F',[0.95,1.35,-0.45]);
    // vessels
    const tube=(pts,r,c,thin)=>{const cv3=new T.CatmullRomCurve3(pts.map(p=>p.isVector3?p:V3(p[0],p[1],p[2])));return mesh(new T.TubeGeometry(cv3,72,r,14,false),c,heart,thin);};
    const cap=(p,q,r)=>{const g=mesh(new T.TorusGeometry(r*1.05,r*0.25,8,22),'#FBFBF8',heart,true,p);g.lookAt(heart.localToWorld(V3(p[0]*2-q[0],p[1]*2-q[1],p[2]*2-q[2])));return g;};
    const AO=[[0.05,1.2,-0.15],[-0.05,2.2,-0.15],[0.45,2.85,-0.25],[1.15,2.7,-0.4],[1.4,1.95,-0.6]];tube(AO,0.3,'#C2352F');
    [[[-0.02,2.5,-0.15],[-0.15,3.25,-0.15]],[[0.4,2.86,-0.25],[0.45,3.5,-0.25]],[[0.85,2.8,-0.35],[1.1,3.35,-0.35]]].forEach(b=>{tube(b,0.1,'#C2352F',true);});
    tube([[-0.35,1.15,0.55],[-0.6,2.0,0.5],[-1.15,2.45,0.4],[-1.75,2.45,0.35]],0.25,'#6E9FE6');
    tube([[-1.15,1.6,-0.1],[-1.2,2.4,-0.15],[-1.22,3.05,-0.2]],0.22,'#6E9FE6');
    // coronary vessels on the surface
    const onS=(ds)=>ds.map(d=>dir(d[0],d[1],d[2]).multiplyScalar(1.015));
    tube(onS([[-0.95,0.55,0.3],[-0.45,0.72,0.6],[0.15,0.78,0.62],[0.7,0.62,0.4],[0.98,0.4,0.1]]),0.05,'#8E2420',true);
    tube(onS([[0.98,0.4,0.1],[0.95,0.0,0.35],[0.8,-0.45,0.4],[0.5,-0.8,0.35]]),0.04,'#8E2420',true);
    tube(onS([[-0.45,0.72,0.6],[-0.7,0.35,0.65],[-0.95,0.0,0.3]]),0.035,'#8E2420',true);
    // the crack (old damage) + stitches that appear at the end
    const CR=onS([[-0.92,0.18,0.38],[-0.66,-0.04,0.74],[-0.86,-0.34,0.47],[-0.55,-0.58,0.62],[-0.62,-0.86,0.32]]);
    const crack=tube(CR,0.045,'#2A0E0C',true);
    const stitches=[];for(let i=0;i<CR.length-1;i++){const m=CR[i].clone().add(CR[i+1]).multiplyScalar(0.5);const st=mesh(new T.BoxGeometry(0.34,0.05,0.05),'#FBFBF8',heart,true,[m.x,m.y,m.z]);st.lookAt(heart.localToWorld(m.clone().multiplyScalar(2)));const dd=CR[i+1].clone().sub(CR[i]);st.rotateZ(Math.atan2(dd.y,dd.x)+Math.PI/2);st.scale.setScalar(0.001);stitches.push(st);}
    // service port in the hole
    const U=V3(0,1,0).cross(D0).normalize(),WW=D0.clone().cross(U).normalize();const ring=[];
    for(let i=0;i<48;i++){const f=i/48*Math.PI*2;const v=D0.clone().multiplyScalar(CA).add(U.clone().multiplyScalar(Math.cos(f)*Math.sin(AL))).add(WW.clone().multiplyScalar(Math.sin(f)*Math.sin(AL))).normalize();ring.push(def(v.x,v.y,v.z));}
    const RC=V3(0,0,0);ring.forEach(p=>RC.add(p));RC.multiplyScalar(1/ring.length);const top=def(D0.x,D0.y,D0.z);const N=top.clone().sub(RC).normalize();let RR=0;ring.forEach(p=>RR+=p.distanceTo(RC));RR/=ring.length;
    mesh(new T.TubeGeometry(new T.CatmullRomCurve3(ring,true),96,0.075,10,true),'#E9EDF3',heart,true);
    const port=new T.Group();port.position.copy(RC);heart.add(port);port.lookAt(heart.localToWorld(RC.clone().add(N)));port.updateMatrixWorld(true);
    const bt=ctex(512,512,(x,w,h)=>{x.fillStyle='#A9C7F1';x.fillRect(0,0,w,h);x.strokeStyle='#F4F8FF';x.lineWidth=7;x.lineCap='round';x.lineJoin='round';
      for(let i=0;i<10;i++){const a=i/10*Math.PI*2;x.beginPath();x.moveTo(w/2,h/2);x.lineTo(w/2+Math.cos(a)*150,h/2+Math.sin(a)*150);x.lineTo(w/2+Math.cos(a+0.2)*215,h/2+Math.sin(a+0.2)*215);x.stroke();}
      x.beginPath();x.arc(w/2,h/2,95,0,7);x.stroke();});
    const chassis=new T.Mesh(new T.CylinderGeometry(RR*0.93,RR*0.93,0.08,48),[new T.MeshBasicMaterial({color:'#A9C7F1'}),new T.MeshBasicMaterial({map:bt}),new T.MeshBasicMaterial({color:'#A9C7F1'})]);chassis.rotation.x=Math.PI/2;chassis.position.z=-0.3;port.add(chassis);
    const sockets=[];const SP=[];for(let i=0;i<10;i++){const a=i/10*Math.PI*2+0.2;SP.push([Math.cos(a)*RR*0.66,Math.sin(a)*RR*0.66]);}for(let i=0;i<5;i++){const a=i/5*Math.PI*2+0.6;SP.push([Math.cos(a)*RR*0.33,Math.sin(a)*RR*0.33]);}SP.push([0,0]);
    SP.forEach(p=>{const s=new T.Group();s.position.set(p[0],p[1],-0.25);port.add(s);mesh(new T.TorusGeometry(0.1,0.02,6,18),'#FBFBF8',s,true);const led=new T.Mesh(new T.SphereGeometry(0.035,10,8),new T.MeshBasicMaterial({color:'#8C939C'}));led.position.set(0.13,0.1,0.02);s.add(led);sockets.push({s,led});});
    // hinged lid
    const hinge=new T.Group();hinge.position.set(0,RR*1.02,0.02);port.add(hinge);
    const lidG=new T.CylinderGeometry(RR*1.05,RR*1.05,0.12,48);lidG.rotateX(Math.PI/2);const lid=mesh(lidG,'#D8473F',hinge,false,[0,-RR*1.02,0.04]);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;mesh(new T.BoxGeometry(0.05,0.18,0.05),'#2A0E0C',lid,true,[Math.cos(a)*RR*0.85,Math.sin(a)*RR*0.85,0.07],[0,0,a]);}
    mesh(new T.CylinderGeometry(0.06,0.06,RR*0.7,12),'#E9EDF3',hinge,true,[0,0,0],[0,0,Math.PI/2]);
    const parts=[];const P=(build,s)=>{const g=new T.Group();build(g);root.add(g);g.userData={s:s||1};parts.push(g);};
    const W='#FBFBF8',B='#A9C7F1',D='#2A2A2E',RD='#D8473F';
    /* helpers for recognisable parts: textured toon material, flat labels, rounded boxes, tubes */
    const toonT=(tex)=>{const m=new T.MeshToonMaterial({map:tex,gradientMap:gm});m.onBeforeCompile=(sh)=>{sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>',HATCH);};return m;};
    const meshT=(geo,tex,parent,pos,rot)=>{const g=new T.Group();g.add(new T.Mesh(geo,toonT(tex)));g.add(new T.Mesh(geo,INKS));if(pos)g.position.set(pos[0],pos[1],pos[2]);if(rot)g.rotation.set(rot[0],rot[1],rot[2]);parent.add(g);return g;};
    const label=(tex,w,h,parent,pos,rot)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:true}));if(pos)m.position.set(pos[0],pos[1],pos[2]);if(rot)m.rotation.set(rot[0],rot[1],rot[2]);parent.add(m);return m;};
    const rbox=(w,h,d,r)=>{const s=new T.Shape();const x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:0.012,bevelSize:0.012,bevelSegments:2,curveSegments:6});g.translate(0,0,-d/2);return g;};
    const ptube=(pts,r,c,g,closed)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts,!!closed),Math.max(24,pts.length*6),r,8,!!closed),c,g,true);
    const INKC='#121212',MONO='"IBM Plex Mono", monospace',RUB='"Rubik", sans-serif';
    // 01 screw "time": threaded screw whose head is a clock face
    P(g=>{const k=new T.Group();k.rotation.x=0.62;k.rotation.z=-0.35;g.add(k);
      mesh(new T.CylinderGeometry(0.075,0.075,0.5,14),W,k,true,[0,-0.2,0]);mesh(new T.ConeGeometry(0.075,0.14,14),W,k,true,[0,-0.52,0],[Math.PI,0,0]);
      const th=[];for(let i=0;i<=90;i++){const a=i/90*Math.PI*14;th.push(V3(Math.cos(a)*0.085,-0.43+i/90*0.44,Math.sin(a)*0.085));}ptube(th,0.014,W,k);
      mesh(new T.CylinderGeometry(0.27,0.27,0.09,32),W,k,true,[0,0.1,0]);
      const face=ctex(256,256,(x,w)=>{x.fillStyle='#FBFBF8';x.fillRect(0,0,w,w);x.strokeStyle=INKC;x.lineWidth=8;x.beginPath();x.arc(128,128,112,0,7);x.stroke();for(let i=0;i<12;i++){const a=i/12*Math.PI*2;x.lineWidth=i%3?5:10;x.beginPath();x.moveTo(128+Math.cos(a)*92,128+Math.sin(a)*92);x.lineTo(128+Math.cos(a)*106,128+Math.sin(a)*106);x.stroke();}x.lineCap='round';x.lineWidth=12;x.beginPath();x.moveTo(128,128);x.lineTo(128,62);x.stroke();x.lineWidth=8;x.strokeStyle='#2B6BF0';x.beginPath();x.moveTo(128,128);x.lineTo(186,150);x.stroke();x.fillStyle=INKC;x.beginPath();x.arc(128,128,12,0,7);x.fill();});
      label(face,0.46,0.46,k,[0,0.147,0],[-Math.PI/2,0,0]);});
    // 02 glue "forgiveness": squeezable tube with cap and label
    P(g=>{const pr=[V3(0.001,-0.36,0),V3(0.16,-0.33,0),V3(0.165,-0.24,0),V3(0.168,-0.15,0),V3(0.17,-0.06,0),V3(0.17,0.03,0),V3(0.17,0.12,0),V3(0.12,0.24,0),V3(0.05,0.29,0),V3(0.05,0.34,0),V3(0.001,0.34,0)].map(v=>new T.Vector2(v.x,v.y));
      const bo=new T.Group();bo.rotation.z=-Math.PI/2;g.add(bo);const body=new T.Group();body.rotation.y=Math.PI;bo.add(body);
      const lab=ctex(256,512,(x,w,h)=>{x.fillStyle='#A9C7F1';x.fillRect(0,0,w,h);x.fillStyle='#FBFBF8';x.fillRect(24,236,w-48,196);x.save();x.translate(w/2,334);x.rotate(-Math.PI/2);x.fillStyle=INKC;x.textAlign='center';x.font='800 30px '+RUB;x.fillText('ПРОЩЕНИЕ',0,-4);x.font='500 15px '+MONO;x.fillText('клей · себе и другим',0,28);x.restore();});lab.wrapS=T.RepeatWrapping;lab.repeat.set(1,1);
      meshT(new T.LatheGeometry(pr,28),lab,body);
      mesh(new T.BoxGeometry(0.34,0.06,0.05),W,body,true,[0,-0.38,0]);
      mesh(new T.CylinderGeometry(0.07,0.07,0.16,16),D,body,true,[0,0.42,0]);});
    // 03 people at 2 am: smartphone with an incoming call at 02:00
    P(g=>{mesh(rbox(0.42,0.8,0.05,0.07),D,g,true);
      const scr=ctex(256,480,(x,w,h)=>{x.fillStyle='#1C2C4A';x.fillRect(0,0,w,h);x.fillStyle='#FBFBF8';x.textAlign='center';x.font='300 26px '+RUB;x.fillText('входящий вызов',w/2,70);x.font='900 92px '+RUB;x.fillText('02:00',w/2,175);x.fillStyle='#A9C7F1';x.beginPath();x.arc(w/2,262,44,0,7);x.fill();x.fillStyle='#1C2C4A';x.font='900 40px '+RUB;x.fillText('К',w/2,276);x.fillStyle='#FBFBF8';x.font='500 30px '+RUB;x.fillText('Катя',w/2,350);x.fillStyle='#D8473F';x.beginPath();x.arc(70,420,30,0,7);x.fill();x.fillStyle='#2B6BF0';x.beginPath();x.arc(186,420,30,0,7);x.fill();});
      label(scr,0.36,0.7,g,[0,0,0.042]);mesh(new T.BoxGeometry(0.1,0.018,0.01),'#121212',g,false,[0,0.365,0.04]);});
    // 04 spare smile: round pin badge with a smile
    P(g=>{const k=new T.Group();g.add(k);const f=ctex(256,256,(x,w)=>{x.beginPath();x.arc(128,128,127,0,7);x.clip();x.fillStyle='#A9C7F1';x.fillRect(0,0,w,w);x.fillStyle=INKC;x.beginPath();x.ellipse(86,100,14,20,0,0,7);x.fill();x.beginPath();x.ellipse(170,100,14,20,0,0,7);x.fill();x.lineWidth=16;x.lineCap='round';x.strokeStyle=INKC;x.beginPath();x.arc(128,130,70,0.25,Math.PI-0.25);x.stroke();x.fillStyle='#FBFBF8';x.font='500 20px '+MONO;x.textAlign='center';x.fillText('ЗАПАСНАЯ',128,236);});
      mesh(new T.CylinderGeometry(0.33,0.33,0.06,40),B,k,true,[0,0,0],[Math.PI/2,0,0]);label(f,0.6,0.6,k,[0,0,0.034]);mesh(new T.TorusGeometry(0.33,0.018,6,40),W,k,true);});
    // 05 playlist for tears: cassette tape
    P(g=>{mesh(rbox(0.72,0.46,0.09,0.04),W,g,true);
      const c=ctex(360,230,(x,w,h)=>{x.fillStyle='#FBFBF8';x.fillRect(0,0,w,h);x.fillStyle='#A9C7F1';x.fillRect(18,16,w-36,120);x.fillStyle=INKC;x.font='700 30px '+RUB;x.textAlign='left';x.fillText('для слёз',34,58);x.font='400 16px '+MONO;x.fillText('сторона A · 90 мин',34,86);x.fillStyle='#2B6BF0';x.beginPath();x.moveTo(300,34);x.quadraticCurveTo(318,62,300,72);x.quadraticCurveTo(282,62,300,34);x.fill();x.fillStyle='#2A2A2E';x.fillRect(70,148,220,58);x.fillStyle='#FBFBF8';[124,236].forEach(cx=>{x.beginPath();x.arc(cx,177,22,0,7);x.fill();x.fillStyle='#2A2A2E';for(let i=0;i<6;i++){const a=i/6*Math.PI*2;x.fillRect(cx+Math.cos(a)*11-3,177+Math.sin(a)*11-3,6,6);}x.fillStyle='#FBFBF8';});x.fillStyle='#8C939C';x.fillRect(150,170,60,14);});
      label(c,0.68,0.434,g,[0,0,0.062]);});
    // 06 blanket cocoon: rolled plaid blanket with a spiral end
    P(g=>{const pl=ctex(256,256,(x,w,h)=>{x.fillStyle='#A9C7F1';x.fillRect(0,0,w,h);x.fillStyle='rgba(251,251,248,.85)';for(let i=0;i<4;i++){x.fillRect(i*64+20,0,14,h);x.fillRect(0,i*64+20,w,14);}x.fillStyle='rgba(43,107,240,.5)';for(let i=0;i<4;i++){x.fillRect(i*64+44,0,5,h);x.fillRect(0,i*64+44,w,5);}});pl.wrapS=pl.wrapT=T.RepeatWrapping;pl.repeat.set(3,1);
      meshT(new T.CylinderGeometry(0.21,0.21,0.66,28,1,true),pl,g,[0,0,0],[0,0,Math.PI/2]);
      [-1,1].forEach(sd=>{mesh(new T.CircleGeometry(0.21,28),W,g,true,[sd*0.33,0,0],[0,sd*Math.PI/2,0]);const sp=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*6;const r=0.02+i/80*0.18;sp.push(V3(sd*0.335,Math.sin(a)*r,Math.cos(a)*r));}ptube(sp,0.012,'#2B6BF0',g);});
      mesh(new T.TorusGeometry(0.215,0.018,6,28),W,g,true,[-0.16,0,0],[0,Math.PI/2,0]);mesh(new T.TorusGeometry(0.215,0.018,6,28),W,g,true,[0.16,0,0],[0,Math.PI/2,0]);});
    // 07 something tasty: wrapped candy with stripes and twisted ends
    P(g=>{const st=ctex(128,128,(x,w,h)=>{x.fillStyle='#FBFBF8';x.fillRect(0,0,w,h);x.fillStyle='#A9C7F1';for(let i=-2;i<6;i++){x.beginPath();x.moveTo(i*32,0);x.lineTo(i*32+16,0);x.lineTo(i*32+16+h,h);x.lineTo(i*32+h,h);x.fill();}});st.wrapS=st.wrapT=T.RepeatWrapping;st.repeat.set(3,2);
      const c=meshT(new T.SphereGeometry(0.18,24,16),st,g);c.scale.set(1.25,1,1);
      [-1,1].forEach(sd=>{const w=mesh(new T.ConeGeometry(0.13,0.22,7,1),B,g,true,[sd*0.33,0,0],[0,0,sd*Math.PI/2]);w.rotation.x=0.4;mesh(new T.CylinderGeometry(0.035,0.035,0.06,8),W,g,true,[sd*0.235,0,0],[0,0,Math.PI/2]);});});
    // 08 call to someone who loves you: retro handset with a coiled cord
    P(g=>{const arc=[];for(let i=0;i<=16;i++){const a=Math.PI*(0.15+0.7*i/16);arc.push(V3(-Math.cos(a)*0.34,Math.sin(a)*0.16,0));}ptube(arc,0.05,D,g);
      [-1,1].forEach(sd=>{const e=mesh(new T.CylinderGeometry(0.1,0.085,0.11,20),D,g,true,[sd*0.34,0.02,0.02],[Math.PI/2-0.25,0,sd*0.35]);mesh(new T.CircleGeometry(0.075,20),W,e,true,[0,0.056,0],[-Math.PI/2,0,0]);});
      const cd=[];for(let i=0;i<=140;i++){const t=i/140;const a=t*Math.PI*18;cd.push(V3(0.34+Math.cos(a)*0.035-t*0.05,-0.06-t*0.38+Math.sin(a)*0.035,0.02+Math.sin(a)*0.035));}ptube(cd,0.01,W,g);
      mesh(new T.SphereGeometry(0.035,10,8),RD,g,true,[0,0.16,0.05]);});
    // 09 "I'm fine" valve: pressure gauge, needle stuck on OK
    P(g=>{mesh(new T.CylinderGeometry(0.06,0.06,0.2,12),D,g,true,[0,-0.36,0]);mesh(new T.CylinderGeometry(0.29,0.29,0.1,36),W,g,true,[0,0,0],[Math.PI/2,0,0]);mesh(new T.TorusGeometry(0.29,0.03,8,36),D,g,true);
      const f=ctex(256,256,(x,w)=>{x.fillStyle='#FBFBF8';x.fillRect(0,0,w,w);x.strokeStyle=INKC;x.lineWidth=5;x.beginPath();x.arc(128,140,90,Math.PI*1.1,Math.PI*1.9);x.stroke();for(let i=0;i<=8;i++){const a=Math.PI*(1.1+0.8*i/8);x.beginPath();x.moveTo(128+Math.cos(a)*78,140+Math.sin(a)*78);x.lineTo(128+Math.cos(a)*92,140+Math.sin(a)*92);x.stroke();}x.fillStyle='#D8473F';x.font='700 22px '+MONO;x.textAlign='center';x.fillText('плохо',62,196);x.fillStyle='#2B6BF0';x.fillText('ОК',196,196);x.strokeStyle='#121212';x.lineWidth=7;x.lineCap='round';x.beginPath();x.moveTo(128,140);x.lineTo(128+Math.cos(Math.PI*1.82)*80,140+Math.sin(Math.PI*1.82)*80);x.stroke();x.fillStyle=INKC;x.beginPath();x.arc(128,140,10,0,7);x.fill();x.font='500 17px '+MONO;x.fillText('я в порядке',128,232);});
      label(f,0.5,0.5,g,[0,0,0.052]);});
    // 10 self-esteem battery: AA battery with a charge level
    P(g=>{const b=ctex(256,256,(x,w,h)=>{x.fillStyle='#FBFBF8';x.fillRect(0,0,w,h);x.fillStyle='#2B6BF0';x.fillRect(0,h*0.38,w,h*0.62);x.fillStyle='#121212';x.fillRect(0,0,w,26);x.fillStyle='#FBFBF8';x.font='900 60px '+RUB;x.textAlign='center';x.fillText('+',64,150);x.fillText('+',192,150);x.fillStyle='#121212';x.font='600 22px '+MONO;x.fillText('САМО',64,82);x.fillText('УВАЖ.',192,82);});
      meshT(new T.CylinderGeometry(0.15,0.15,0.56,28),b,g);mesh(new T.CylinderGeometry(0.06,0.06,0.07,14),D,g,true,[0,0.315,0]);mesh(new T.CylinderGeometry(0.15,0.15,0.02,28),D,g,true,[0,-0.28,0]);});
    // 11 calm morning gear: gear with a small sun in the middle
    P(g=>{const sh=new T.Shape();const n=10;for(let i=0;i<n*2;i++){const r=i%2?0.24:0.33;const a1=i*Math.PI/n+0.05,a2=(i+1)*Math.PI/n-0.05;if(i===0)sh.moveTo(r*Math.cos(a1),r*Math.sin(a1));else sh.lineTo(r*Math.cos(a1),r*Math.sin(a1));sh.lineTo(r*Math.cos(a2),r*Math.sin(a2));}const hole=new T.Path();hole.absarc(0,0,0.15,0,Math.PI*2,true);sh.holes.push(hole);const geo=new T.ExtrudeGeometry(sh,{depth:0.1,bevelEnabled:false});geo.translate(0,0,-0.05);mesh(geo,W,g,true);
      mesh(new T.CylinderGeometry(0.075,0.075,0.08,20),B,g,true,[0,0,0],[Math.PI/2,0,0]);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;mesh(new T.BoxGeometry(0.03,0.05,0.04),'#2B6BF0',g,false,[Math.cos(a)*0.11,Math.sin(a)*0.11,0],[0,0,a+Math.PI/2]);}});
    // 12 "I'm coping" playlist: over-ear headphones
    P(g=>{const hb=[];for(let i=0;i<=20;i++){const a=Math.PI*i/20;hb.push(V3(Math.cos(a)*0.3,Math.sin(a)*0.34,0));}ptube(hb,0.035,D,g);
      [-1,1].forEach(sd=>{mesh(new T.BoxGeometry(0.05,0.12,0.06),D,g,true,[sd*0.3,-0.04,0]);mesh(new T.CylinderGeometry(0.13,0.13,0.1,24),B,g,true,[sd*0.31,-0.16,0],[0,0,Math.PI/2]);mesh(new T.TorusGeometry(0.1,0.035,8,24),W,g,true,[sd*0.25,-0.16,0],[0,Math.PI/2,0]);});});
    // 13 laughing-to-tears spring: spring with a laughing head
    P(g=>{const pts=[];for(let i=0;i<=120;i++){const a=i/120*Math.PI*10;pts.push(V3(Math.cos(a)*0.12,-0.38+i/120*0.4,Math.sin(a)*0.12));}ptube(pts,0.025,W,g);mesh(new T.CylinderGeometry(0.16,0.16,0.04,20),D,g,true,[0,-0.4,0]);
      const f=ctex(256,128,(x,w,h)=>{x.fillStyle='#A9C7F1';x.fillRect(0,0,w,h);x.strokeStyle=INKC;x.lineWidth=7;x.lineCap='round';[96,160].forEach(cx=>{x.beginPath();x.moveTo(cx-14,52);x.lineTo(cx,40);x.lineTo(cx+14,52);x.stroke();});x.fillStyle=INKC;x.beginPath();x.arc(128,72,26,0,Math.PI);x.fill();x.fillStyle='#2B6BF0';x.beginPath();x.moveTo(70,62);x.quadraticCurveTo(80,82,70,88);x.quadraticCurveTo(60,82,70,62);x.fill();x.beginPath();x.moveTo(186,62);x.quadraticCurveTo(196,82,186,88);x.quadraticCurveTo(176,82,186,62);x.fill();});f.wrapS=T.RepeatWrapping;f.offset.x=0.25;
      meshT(new T.SphereGeometry(0.17,24,16),f,g,[0,0.17,0]);});
    // 14 evening-for-yourself candle: candle on a dish with a flame
    P(g=>{mesh(new T.CylinderGeometry(0.3,0.26,0.05,28),B,g,true,[0,-0.3,0]);mesh(new T.CylinderGeometry(0.12,0.12,0.46,22),W,g,true,[0,-0.05,0]);
      mesh(new T.SphereGeometry(0.03,8,6),W,g,true,[0.1,0.1,0.06]);mesh(new T.SphereGeometry(0.025,8,6),W,g,true,[-0.09,0.05,0.08]);mesh(new T.CylinderGeometry(0.008,0.008,0.06,6),'#121212',g,false,[0,0.21,0]);
      const fl=[new T.Vector2(0.001,0),new T.Vector2(0.05,0.04),new T.Vector2(0.055,0.09),new T.Vector2(0.03,0.15),new T.Vector2(0.001,0.2)];mesh(new T.LatheGeometry(fl,16),'#F2A33A',g,true,[0,0.22,0]);
      mesh(new T.TorusGeometry(0.3,0.02,6,28,Math.PI*1.4),B,g,true,[0.02,-0.28,0],[Math.PI/2,0,0]);});
    // 15 aimless walk: sneaker (side view extrusion)
    P(g=>{const k=new T.Group();k.rotation.y=-0.22;k.rotation.x=0.12;g.add(k);
      const so=new T.Shape();so.moveTo(-0.38,-0.12);so.lineTo(0.34,-0.12);so.quadraticCurveTo(0.44,-0.11,0.43,-0.03);so.lineTo(-0.4,-0.03);so.quadraticCurveTo(-0.42,-0.1,-0.38,-0.12);
      const sg=new T.ExtrudeGeometry(so,{depth:0.24,bevelEnabled:true,bevelThickness:0.01,bevelSize:0.01,bevelSegments:1});sg.translate(0,0,-0.12);mesh(sg,W,k,true);
      const up=new T.Shape();up.moveTo(-0.39,-0.03);up.lineTo(0.42,-0.03);up.quadraticCurveTo(0.42,0.06,0.28,0.08);up.lineTo(0.02,0.14);up.lineTo(-0.16,0.26);up.quadraticCurveTo(-0.34,0.3,-0.38,0.22);up.quadraticCurveTo(-0.42,0.1,-0.39,-0.03);
      const ug=new T.ExtrudeGeometry(up,{depth:0.2,bevelEnabled:true,bevelThickness:0.02,bevelSize:0.02,bevelSegments:2});ug.translate(0,0,-0.1);mesh(ug,B,k,true);
      for(let i=0;i<4;i++){mesh(new T.BoxGeometry(0.02,0.012,0.22),W,k,false,[0.02-i*0.06,0.13+i*0.035,0],[0,0,0.5]);}
      const sd=ctex(430,170,(x,w,h)=>{const X=v=>(v+0.43)/0.87*w,Y=v=>(0.31-v)/0.45*h;x.lineCap='round';x.lineJoin='round';
        x.strokeStyle='#2B6BF0';x.lineWidth=11;x.beginPath();x.moveTo(X(-0.3),Y(0.02));x.quadraticCurveTo(X(-0.05),Y(0.0),X(0.22),Y(0.12));x.stroke();
        x.lineWidth=7;x.beginPath();x.moveTo(X(-0.26),Y(0.06));x.quadraticCurveTo(X(-0.04),Y(0.05),X(0.16),Y(0.13));x.stroke();
        x.strokeStyle='#121212';x.lineWidth=3;x.fillStyle='#FBFBF8';for(let i=0;i<4;i++){x.beginPath();x.arc(X(0.0-i*0.05),Y(0.12+i*0.035),6,0,7);x.fill();x.stroke();}
        x.lineWidth=4;x.beginPath();x.moveTo(X(-0.4),Y(-0.075));x.lineTo(X(0.42),Y(-0.075));x.stroke();
        x.fillStyle='#121212';x.font='900 30px '+RUB;x.fillText('HF',X(-0.36),Y(0.12));});
      label(sd,0.87,0.45,k,[0.005,0.085,0.126]);});
    // 16 thoughts about the future: folded paper plane
    P(g=>{const k=new T.Group();k.rotation.set(0.85,-0.45,0.2);g.add(k);
      const N=V3(0.5,0,0),TC=V3(-0.4,0.04,0),TL=V3(-0.4,0.04,0.34),TR=V3(-0.4,0.04,-0.34),KB=V3(-0.4,-0.17,0);
      const tri=(a,b,c,col)=>{const geo=new T.BufferGeometry().setFromPoints([a,b,c]);geo.computeVertexNormals();const m=new T.Mesh(geo,toon(col));m.material.side=T.DoubleSide;k.add(m);};
      tri(N,TC,TL,W);tri(N,TR,TC,W);tri(N,KB,TC,B);tri(N,TC,KB,B);
      [[N,TL],[N,TR],[N,TC],[N,KB],[TL,TC],[TR,TC],[TC,KB]].forEach(e=>{mesh(new T.TubeGeometry(new T.LineCurve3(e[0],e[1]),1,0.012,6,false),'#121212',k,false);});
      const tr=[];for(let i=0;i<=14;i++){tr.push(V3(-0.46-i*0.045,0.04+Math.sin(i*0.8)*0.04,0));}const dl=new T.Line(new T.BufferGeometry().setFromPoints(tr),new T.LineDashedMaterial({color:'#2B6BF0',dashSize:0.03,gapSize:0.025}));dl.computeLineDistances();k.add(dl);});
    /* chapter 01: the six "what broke it" objects in the same toon + boiling-ink style as the heart and the parts */
    const C1=[];const C1G=(build)=>{const g=new T.Group();build(g);C1.push(g);};const KR='#D9BE90',FL='#F2A33A';
    // 01 keyring for two: a heart split along a crack, two rings
    C1G(g=>{const L=new T.Shape();L.moveTo(0,-0.45);L.bezierCurveTo(-0.25,-0.25,-0.5,-0.05,-0.5,0.18);L.bezierCurveTo(-0.5,0.38,-0.32,0.48,-0.2,0.48);L.bezierCurveTo(-0.08,0.48,0,0.38,0,0.28);L.lineTo(-0.06,0.14);L.lineTo(0.04,0.02);L.lineTo(-0.05,-0.12);L.lineTo(0.03,-0.28);L.lineTo(0,-0.45);
      const Rr=new T.Shape();Rr.moveTo(0,0.28);Rr.bezierCurveTo(0,0.38,0.08,0.48,0.2,0.48);Rr.bezierCurveTo(0.32,0.48,0.5,0.38,0.5,0.18);Rr.bezierCurveTo(0.5,-0.05,0.25,-0.25,0,-0.45);Rr.lineTo(0.03,-0.28);Rr.lineTo(-0.05,-0.12);Rr.lineTo(0.04,0.02);Rr.lineTo(-0.06,0.14);Rr.lineTo(0,0.28);
      const ex=(sh)=>{const geo=new T.ExtrudeGeometry(sh,{depth:0.12,bevelEnabled:true,bevelThickness:0.025,bevelSize:0.025,bevelSegments:3,curveSegments:18});geo.translate(0,0,-0.06);return geo;};
      const l=mesh(ex(L),B,g,false,[-0.12,-0.04,0],[0,0,0.14]);const r=mesh(ex(Rr),W,g,false,[0.12,0.04,0],[0,0,-0.12]);
      mesh(new T.TorusGeometry(0.075,0.017,8,24),D,l,true,[-0.2,0.56,0]);mesh(new T.TorusGeometry(0.075,0.017,8,24),D,r,true,[0.2,0.56,0]);
      mesh(new T.TorusGeometry(0.04,0.012,6,16),D,l,true,[-0.2,0.66,0],[0,Math.PI/2,0]);mesh(new T.TorusGeometry(0.04,0.012,6,16),D,r,true,[0.2,0.66,0],[0,Math.PI/2,0]);});
    // 02 friendship bracelet: beads on a cord and three letter cubes B F F
    C1G(g=>{const k=new T.Group();k.rotation.x=-1.12;g.add(k);mesh(new T.TorusGeometry(0.42,0.012,6,48),D,k,true);
      const N=16;for(let i=0;i<N;i++){const a=i/N*Math.PI*2;if(a>4.2&&a<5.3)continue;mesh(new T.SphereGeometry(0.058,14,10),i%2?B:W,k,true,[Math.cos(a)*0.42,Math.sin(a)*0.42,0]);}
      ['B','F','F'].forEach((ch,j)=>{const a=4.38+j*0.38;const tx=ctex(64,64,(x,w)=>{x.fillStyle='#FBFBF8';x.fillRect(0,0,w,w);x.fillStyle=INKC;x.font='900 44px '+RUB;x.textAlign='center';x.textBaseline='middle';x.fillText(ch,32,35);});
        const c=meshT(new T.BoxGeometry(0.13,0.13,0.13),tx,k,[Math.cos(a)*0.42,Math.sin(a)*0.42,0]);c.rotation.set(Math.PI/2,0,a+Math.PI/2);});});
    // 03 photo frame with a candle
    C1G(g=>{const f=new T.Group();f.rotation.y=-0.22;g.add(f);mesh(rbox(0.6,0.76,0.07,0.03),W,f,true,[-0.12,0.04,0]);
      const ph=ctex(240,310,(x,w,h)=>{x.fillStyle='#FBFBF8';x.fillRect(0,0,w,h);x.fillStyle='#E4ECF8';x.fillRect(16,16,w-32,h-32);x.strokeStyle=INKC;x.lineWidth=3;x.strokeRect(16,16,w-32,h-32);x.lineWidth=2.5;x.beginPath();x.moveTo(16,232);x.bezierCurveTo(80,190,130,220,170,190);x.bezierCurveTo(196,172,214,186,224,180);x.stroke();x.setLineDash([5,6]);x.beginPath();x.arc(124,118,34,0,7);x.stroke();});
      label(ph,0.5,0.66,f,[-0.12,0.04,0.051]);
      mesh(new T.CylinderGeometry(0.07,0.07,0.3,18),W,g,true,[0.4,-0.24,0.12]);mesh(new T.CylinderGeometry(0.006,0.006,0.05,6),'#121212',g,false,[0.4,-0.07,0.12]);
      mesh(new T.LatheGeometry([new T.Vector2(0.001,0),new T.Vector2(0.035,0.03),new T.Vector2(0.038,0.06),new T.Vector2(0.02,0.1),new T.Vector2(0.001,0.13)],14),FL,g,true,[0.4,-0.06,0.12]);});
    // 04 collar with a bone-shaped tag
    C1G(g=>{const k=new T.Group();k.rotation.x=-1.15;g.add(k);mesh(new T.TorusGeometry(0.38,0.065,12,40),B,k,false);mesh(new T.BoxGeometry(0.13,0.11,0.16),W,k,true,[0.38,0,0]);
      mesh(new T.TorusGeometry(0.04,0.012,6,16),D,g,true,[0,-0.18,0.36],[0,0,0]);
      const bone=new T.Group();bone.position.set(0,-0.32,0.38);bone.rotation.z=0.12;g.add(bone);mesh(new T.BoxGeometry(0.2,0.07,0.035),W,bone,true);[[-0.1,0.035],[-0.1,-0.035],[0.1,0.035],[0.1,-0.035]].forEach(p=>mesh(new T.SphereGeometry(0.045,12,8),W,bone,true,[p[0],p[1],0]));});
    // 05 box "fragile"
    C1G(g=>{const k=new T.Group();k.rotation.set(0.32,-0.55,0);g.add(k);mesh(new T.BoxGeometry(0.72,0.5,0.52),KR,k,false);mesh(new T.BoxGeometry(0.73,0.012,0.14),B,k,true,[0,0.256,0]);
      const fr=ctex(256,180,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle=INKC;x.font='800 34px '+RUB;x.textAlign='center';x.fillText('ХРУПКОЕ',w/2,62);x.strokeStyle=INKC;x.lineWidth=5;x.beginPath();x.moveTo(108,90);x.lineTo(148,90);x.lineTo(136,124);x.lineTo(120,124);x.closePath();x.stroke();x.beginPath();x.moveTo(128,124);x.lineTo(128,150);x.moveTo(112,150);x.lineTo(144,150);x.stroke();});
      label(fr,0.5,0.35,k,[0,-0.02,0.262]);
      const ar=ctex(128,128,(x,w)=>{x.clearRect(0,0,w,w);x.strokeStyle=INKC;x.lineWidth=7;x.lineCap='round';[44,84].forEach(cx=>{x.beginPath();x.moveTo(cx,100);x.lineTo(cx,34);x.moveTo(cx-14,50);x.lineTo(cx,34);x.lineTo(cx+14,50);x.stroke();});});
      label(ar,0.26,0.26,k,[0.362,0,0],[0,Math.PI/2,0]);});
    // 06 rejection letter in an envelope
    C1G(g=>{const sh=new T.Group();sh.position.set(-0.02,0.16,-0.03);sh.rotation.z=0.07;g.add(sh);mesh(new T.BoxGeometry(0.56,0.56,0.012),W,sh,true);
      const tx=ctex(240,240,(x,w,h)=>{x.fillStyle='#FBFBF8';x.fillRect(0,0,w,h);x.fillStyle=INKC;x.font='500 19px '+MONO;x.fillText('к сожалению,',22,44);x.fillText('вы не прошли…',22,70);x.strokeStyle='#4C4C47';x.lineWidth=2;for(let i=0;i<4;i++){x.beginPath();x.moveTo(22,104+i*24);x.lineTo(w-30-((i*37)%60),104+i*24);x.stroke();}});
      label(tx,0.52,0.52,sh,[0,0,0.008]);
      mesh(rbox(0.74,0.44,0.04,0.02),B,g,true,[0,-0.2,0.04]);
      const fl=ctex(256,152,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle=INKC;x.lineWidth=4;x.lineJoin='round';x.beginPath();x.moveTo(6,6);x.lineTo(w/2,h*0.62);x.lineTo(w-6,6);x.stroke();x.lineWidth=3;x.beginPath();x.moveTo(6,h-6);x.lineTo(w*0.36,h*0.5);x.moveTo(w-6,h-6);x.lineTo(w*0.64,h*0.5);x.stroke();});
      label(fl,0.72,0.42,g,[0,-0.2,0.065]);});
    const sc1=new T.Scene();sc1.add(new T.AmbientLight(0xffffff,0.5));{const d1=new T.DirectionalLight(0xffffff,0.95);d1.position.set(3.5,5,6);sc1.add(d1);}
    const cam1=new T.PerspectiveCamera(30,1.4,0.1,50);cam1.position.set(0,0.1,3.15);cam1.lookAt(0,0,0);
    /* real break: two clones of each object, each keeps one side of a zigzag crack (fragment discard in object space) */
    const CLIPV='varying vec3 vWp;\n',CLIPF='uniform mat4 uInv;uniform float uSide;varying vec3 vWp;\n',CLIPD='vec3 cp=(uInv*vec4(vWp,1.0)).xyz;float tri=abs(fract(cp.y*3.2+0.25)-0.5)*2.0;if(uSide*(cp.x-(tri-0.5)*0.11)<0.0)discard;\n';
    const clipify=(root,U)=>{root.traverse(o=>{if(!o.isMesh)return;const m0=o.material;let m;
      if(m0.isShaderMaterial){m=m0.clone();m.uniforms.seed=SEED;m.uniforms.uInv=U.uInv;m.uniforms.uSide=U.uSide;
        m.vertexShader=CLIPV+m0.vertexShader.replace('gl_Position=projectionMatrix*mv;','vWp=(modelMatrix*vec4(p,1.0)).xyz;gl_Position=projectionMatrix*mv;');
        m.fragmentShader=CLIPF+m0.fragmentShader.replace('void main(){','void main(){'+CLIPD);}
      else{m=m0.clone();const toonish=m0.isMeshToonMaterial;m.onBeforeCompile=(sh)=>{sh.uniforms.uInv=U.uInv;sh.uniforms.uSide=U.uSide;
        sh.vertexShader=CLIPV+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvWp=(modelMatrix*vec4(transformed,1.0)).xyz;');
        sh.fragmentShader=CLIPF+sh.fragmentShader.replace('void main() {','void main() {\n'+CLIPD);if(toonish)sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>',HATCH);};
        m.customProgramCacheKey=()=>'c1clip'+(toonish?'t':'b');}
      o.material=m;});};
    C1.forEach((g,i)=>{const bx=new T.Box3().setFromObject(g);const sz=bx.getSize(V3(0,0,0));const ct=bx.getCenter(V3(0,0,0));g.position.sub(ct);const wr=new T.Group();wr.add(g);const s0=Math.max(sz.x,sz.y,sz.z*0.8,0.01);
      const halves=[-1,1].map(sd=>{const pv=new T.Group();const cg=g.clone(true);const U={uInv:{value:new T.Matrix4()},uSide:{value:sd}};clipify(cg,U);pv.add(cg);pv.visible=false;wr.add(pv);return {pv,cg,U,sd};});
      const shards=[];for(let j=0;j<7;j++){const sh=mesh(new T.TetrahedronGeometry(s0*0.045),j%3?B:W,wr,true);sh.visible=false;shards.push({m:sh,v:V3(0,0,0),w:V3(0,0,0)});}
      wr.userData={fit:1.22/s0,s0,sc:1,spin:0,t0:-9,lastSel:false,split:0,halves,shards,whole:g};wr.scale.setScalar(wr.userData.fit);sc1.add(wr);C1[i]=wr;});
    const cv1=document.getElementById('hf3d1');let R1=null;
    if(cv1){try{R1=new T.WebGLRenderer({canvas:cv1,antialias:true,alpha:true});R1.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R1.setClearColor(0x000000,0);R1.autoClear=false;}catch(err){R1=null;}}
    if(R1){const sec=document.getElementById('ch-01');if(sec)sec.classList.add('c1-3d');this._R1=R1;}
    let lt1=0;
    this._c1=(t)=>{if(!R1)return;const sec=document.getElementById('ch-01');if(!sec)return;if(!sec.classList.contains('c1-3d'))sec.classList.add('c1-3d');
      const r=cv1.getBoundingClientRect();if(r.bottom<0||r.top>(window.innerHeight||800)||!r.width)return;
      if(Math.round(r.width)!==this._c1w||Math.round(r.height)!==this._c1h){this._c1w=Math.round(r.width);this._c1h=Math.round(r.height);R1.setSize(this._c1w,this._c1h,false);}
      const dt=Math.min(0.05,Math.max(0,t-lt1));lt1=t;R1.setScissorTest(false);R1.clear();R1.setScissorTest(true);
      const st=this.state||{};const has=st.sel!=null;const cards=sec.querySelectorAll('.c1card');
      cards.forEach((el,i)=>{const wr=C1[i];if(!wr)return;const art=el.querySelector('.c1-art');if(!art)return;const a=art.getBoundingClientRect();if(a.width<2)return;
        const u=wr.userData;const isSel=has&&st.sel===i;const hov=el.matches(':hover');
        if(isSel&&!u.lastSel){u.t0=t;u.burst=false;}u.lastSel=isSel;const k=t-u.t0;
        u.spin+=dt*(hov&&!isSel?2.4:0);u.spin*=hov?1:0.96;
        const tgt=isSel?1.1:(has?0.86:1);u.sc+=(tgt-u.sc)*Math.min(1,dt*7);
        /* break: shiver 0.15s, then the halves spring apart; un-select glues them back */
        const shiver=isSel&&k<0.15;const want=isSel&&k>=0.15?1:0;
        if(want){const e=k-0.15;u.split=1-Math.exp(-e*9)*Math.cos(e*14);}else{u.split+=(0-u.split)*Math.min(1,dt*8);if(u.split<0.002)u.split=0;}
        const broken=u.split>0.002||want;u.whole.visible=!broken;
        wr.scale.setScalar(u.fit*u.sc);
        wr.rotation.set(0.12+Math.sin(t*0.9+i)*0.05,Math.sin(t*0.55+i*1.3)*0.42*(isSel?0.35:1)+u.spin,0);
        wr.position.set(shiver?(Math.random()-0.5)*0.05:0,Math.sin(t*1.3+i)*0.03,0);
        u.halves.forEach(h=>{h.pv.visible=broken;const d=u.split*u.s0*0.14;h.pv.position.set(h.sd*d,-u.split*u.s0*0.03,0);h.pv.rotation.set(0,h.sd*u.split*0.18,-h.sd*u.split*0.14);});
        if(isSel&&k>=0.15&&!u.burst){u.burst=true;u.shards.forEach((p,j)=>{p.m.visible=true;p.m.position.set((Math.random()-0.5)*u.s0*0.08,(Math.random()-0.5)*u.s0*0.5,u.s0*0.15);const ang=(j/u.shards.length)*Math.PI*2+Math.random()*0.5;p.v.set(Math.cos(ang)*u.s0*(0.8+Math.random()*0.6),u.s0*(0.6+Math.random()*0.9),u.s0*(0.3+Math.random()*0.5));p.w.set(Math.random()*9,Math.random()*9,Math.random()*9);p.life=0.9+Math.random()*0.4;p.m.scale.setScalar(1);});}
        u.shards.forEach(p=>{if(!p.m.visible)return;p.life-=dt;if(p.life<=0){p.m.visible=false;return;}p.v.y-=u.s0*3.2*dt;p.m.position.addScaledVector(p.v,dt);p.m.rotation.x+=p.w.x*dt;p.m.rotation.y+=p.w.y*dt;p.m.scale.setScalar(Math.min(1,p.life*2.2));});
        C1.forEach(o=>{o.visible=o===wr;});
        if(broken){wr.updateMatrixWorld(true);u.halves.forEach(h=>h.U.uInv.value.copy(h.cg.matrixWorld).invert());}
        const cb=el.getBoundingClientRect();const cx0=cb.left-r.left,cy0=r.bottom-cb.bottom;R1.setScissor(cx0,cy0,cb.width,cb.height);R1.setClearColor(0xFBFBF8,1);R1.clear();R1.setClearColor(0x000000,0);
        const x=a.left-r.left,y=r.bottom-a.bottom;R1.setViewport(x,y,a.width,a.height);R1.setScissor(x,y,a.width,a.height);cam1.aspect=a.width/a.height;cam1.updateProjectionMatrix();R1.render(sc1,cam1);});
      R1.setScissorTest(false);};
    /* chapter 02: the heartfix HF-01 box unpacks on scroll — b3lid, 16 parts popping into cells, module pouch, instruction booklet */
    const ownMats=(root)=>{root.traverse(o=>{if(!o.material)return;const m0=o.material;const m=m0.clone();if(m0.onBeforeCompile)m.onBeforeCompile=m0.onBeforeCompile;if(m0.customProgramCacheKey)m.customProgramCacheKey=m0.customProgramCacheKey;if(m.isShaderMaterial&&m.uniforms&&m.uniforms.seed)m.uniforms.seed=SEED;o.material=m;});return root;};
    const sc3=new T.Scene();sc3.add(new T.AmbientLight(0xffffff,0.5));{const d3=new T.DirectionalLight(0xffffff,0.95);d3.position.set(3.5,6,5);sc3.add(d3);}
    const cam3=new T.PerspectiveCamera(30,1.2,0.1,60);
    const BX=new T.Group();sc3.add(BX);const BW=2.4,BH=0.62,BD=1.6,TH=0.06;
    const b3wall=(w,h,d,c,pos)=>mesh(new T.BoxGeometry(w,h,d),c,BX,true,pos);
    b3wall(BW,TH,BD,W,[0,0,0]);b3wall(BW,BH,TH,W,[0,BH/2,BD/2-TH/2]);b3wall(BW,BH,TH,W,[0,BH/2,-BD/2+TH/2]);b3wall(TH,BH,BD,W,[BW/2-TH/2,BH/2,0]);b3wall(TH,BH,BD,W,[-BW/2+TH/2,BH/2,0]);
    const front=ctex(1024,264,(x,w,h)=>{x.fillStyle='#FBFBF8';x.fillRect(0,0,w,h);x.fillStyle='#A9C7F1';x.fillRect(0,150,w,114);x.fillStyle=INKC;x.font='900 118px '+RUB;x.fillText('heartfix',40,128);x.font='800 44px '+RUB;x.fillText('®',530,70);x.font='500 30px '+MONO;x.fillText('HF-01',w-160,60);x.font='500 30px '+MONO;x.fillText('ремкомплект для разбитого сердца · 16 + 10 деталей',40,218);x.strokeStyle=INKC;x.lineWidth=4;x.strokeRect(2,2,w-4,h-4);});
    label(front,BW-0.02,BH-0.02,BX,[0,BH/2,BD/2+0.002]);
    const ins=ctex(512,512,(x,w,h)=>{x.fillStyle='#EEF3FB';x.fillRect(0,0,w,h);x.strokeStyle='#121212';x.lineWidth=5;for(let r=0;r<4;r++)for(let c=0;c<4;c++){x.strokeRect(14+c*124,14+r*124,112,112);x.fillStyle='#4C4C47';x.font='500 18px '+MONO;x.fillText(String(r*4+c+1).padStart(2,'0'),22+c*124,40+r*124);}});
    label(ins,1.34,1.34,BX,[-0.44,0.2,0],[-Math.PI/2,0,0]);mesh(new T.BoxGeometry(BW-TH*2.2,0.18,BD-TH*2.2),'#EEF3FB',BX,true,[0,0.1,0]);
    /* b3lid hinged at the back edge */
    const LID=new T.Group();LID.position.set(0,BH+0.01,-BD/2-0.03);BX.add(LID);const LW=BW+0.08,LD=BD+0.08,LS=0.22;
    const lidIn=new T.Group();lidIn.position.set(0,0,LD/2);LID.add(lidIn);
    mesh(new T.BoxGeometry(LW,TH,LD),W,lidIn,true,[0,LS-TH/2,0]);mesh(new T.BoxGeometry(LW,LS,TH),W,lidIn,true,[0,LS/2,LD/2-TH/2]);mesh(new T.BoxGeometry(LW,LS,TH),W,lidIn,true,[0,LS/2,-LD/2+TH/2]);mesh(new T.BoxGeometry(TH,LS,LD),W,lidIn,true,[LW/2-TH/2,LS/2,0]);mesh(new T.BoxGeometry(TH,LS,LD),W,lidIn,true,[-LW/2+TH/2,LS/2,0]);
    const b3top=ctex(1024,680,(x,w,h)=>{x.fillStyle='#FBFBF8';x.fillRect(0,0,w,h);x.fillStyle=INKC;x.font='900 150px '+RUB;x.fillText('heartfix',60,250);x.font='800 56px '+RUB;x.fillText('®',735,160);x.font='500 34px '+MONO;x.fillText('HF-01 · ремкомплект для разбитого сердца',64,330);
      x.strokeStyle=INKC;x.lineWidth=7;x.lineJoin='round';x.beginPath();x.moveTo(800,610);x.bezierCurveTo(700,540,640,480,640,420);x.bezierCurveTo(640,370,680,340,722,340);x.bezierCurveTo(756,340,785,360,800,392);x.bezierCurveTo(815,360,844,340,878,340);x.bezierCurveTo(920,340,960,370,960,420);x.bezierCurveTo(960,480,900,540,800,610);x.stroke();
      x.strokeStyle='#2B6BF0';x.beginPath();x.moveTo(800,392);x.lineTo(786,440);x.lineTo(812,480);x.lineTo(790,530);x.lineTo(804,600);x.stroke();
      x.fillStyle='#A9C7F1';x.fillRect(60,420,460,150);x.fillStyle=INKC;x.font='800 44px '+RUB;x.fillText('ХРУПКОЕ',90,490);x.font='500 28px '+MONO;x.fillText('открывать бережно ↑',90,545);x.strokeStyle=INKC;x.lineWidth=4;x.strokeRect(4,4,w-8,h-8);});
    label(b3top,LW-0.04,LD-0.04,lidIn,[0,LS+0.002,0],[-Math.PI/2,0,0]);
    const lidFront=ctex(1024,96,(x,w,h)=>{x.fillStyle='#FBFBF8';x.fillRect(0,0,w,h);x.fillStyle=INKC;x.font='500 40px '+MONO;x.fillText('heartfix® HF-01 · по одной детали в день · инструкция внутри',30,62);});
    label(lidFront,LW-0.02,LS-0.02,lidIn,[0,LS/2,LD/2+0.002]);
    /* 16 parts (clones of the first-screen parts) */
    const BP=parts.map((src,i)=>{const c=ownMats(src.clone(true));c.position.set(0,0,0);c.rotation.set(0,0,0);c.scale.set(1,1,1);const wr=new T.Group();wr.add(c);
      const bb=new T.Box3().setFromObject(c);const sz=bb.getSize(V3(0,0,0));const ct=bb.getCenter(V3(0,0,0));c.position.sub(ct);const f=0.24/Math.max(sz.x,sz.y,sz.z,0.01);
      const col=i%4,row=Math.floor(i/4);wr.userData={f,x:-0.44-0.62+0.155+col*0.31,z:-0.62+0.155+row*0.31};wr.position.set(wr.userData.x,0.34,wr.userData.z);BX.add(wr);return wr;});
    /* module pouch with a flap (label follows the module picked in chapter 01) */
    const POU=new T.Group();POU.position.set(0.72,0.19,-0.36);BX.add(POU);mesh(new T.BoxGeometry(0.74,0.2,0.62),B,POU,true,[0,0.1,0]);
    for(let i=0;i<10;i++){mesh(new T.SphereGeometry(0.045,10,8),i%2?W:'#2B6BF0',POU,true,[-0.26+(i%5)*0.13,0.21,-0.12+Math.floor(i/5)*0.2]);}
    const FLAP=new T.Group();FLAP.position.set(0,0.205,-0.31);POU.add(FLAP);const flapIn=new T.Group();flapIn.position.set(0,0,0.31);FLAP.add(flapIn);mesh(new T.BoxGeometry(0.76,0.025,0.64),B,flapIn,true);
    let pouchCv=null,pouchTx=null,pouchMod='';const drawPouch=(mod)=>{if(!pouchCv){pouchCv=document.createElement('canvas');pouchCv.width=380;pouchCv.height=320;pouchTx=new T.CanvasTexture(pouchCv);}
      const x=pouchCv.getContext('2d'),w=380,h=320;x.fillStyle='#A9C7F1';x.fillRect(0,0,w,h);x.strokeStyle=INKC;x.lineWidth=5;x.setLineDash([12,10]);x.strokeRect(14,14,w-28,h-28);x.setLineDash([]);
      x.fillStyle=INKC;x.font='500 26px '+MONO;x.fillText('МОДУЛЬ · 10 деталей',34,74);x.font='900 44px '+RUB;const t=mod||'твоя история';x.fillText(t.length>14?t.slice(0,14)+'…':t,34,150);x.font='500 22px '+MONO;x.fillText('№17–26',34,270);x.fillStyle='#2B6BF0';x.font='900 90px '+RUB;x.fillText('+10',220,280);pouchTx.needsUpdate=true;};
    drawPouch('');label(pouchTx,0.72,0.6,flapIn,[0,0.014,0],[-Math.PI/2,0,0]);
    /* instruction booklet: back + pages + front cover on a spine hinge */
    const BK=new T.Group();BX.add(BK);const KW=0.62,KD=0.76;const bkIn=new T.Group();BK.add(bkIn);
    mesh(new T.BoxGeometry(KW,0.015,KD),W,bkIn,true,[0,0,0]);mesh(new T.BoxGeometry(KW-0.03,0.03,KD-0.03),'#F4F4EF',bkIn,true,[0.01,0.022,0]);
    const page=ctex(372,456,(x,w,h)=>{x.fillStyle='#F4F4EF';x.fillRect(0,0,w,h);x.fillStyle='#4C4C47';x.font='500 18px '+MONO;x.fillText('шаг 01 / 26 · день 1',22,40);x.fillStyle=INKC;x.font='900 38px '+RUB;x.fillText('Винт «время»',22,96);x.font='400 21px '+RUB;['Держит всю конструкцию.','Не ускоряется — поэтому','за один вечер сердце','не собрать.'].forEach((l,i)=>x.fillText(l,22,140+i*30));
      x.strokeStyle=INKC;x.lineWidth=4;x.beginPath();x.arc(186,350,50,0,7);x.stroke();x.beginPath();x.moveTo(186,350);x.lineTo(186,316);x.moveTo(186,350);x.lineTo(212,362);x.stroke();x.fillStyle='#2B6BF0';x.font='500 16px '+MONO;x.fillText('полистать целиком — глава 07',22,436);});
    label(page,KW-0.05,KD-0.05,bkIn,[0.01,0.038,0],[-Math.PI/2,0,0]);
    const COV=new T.Group();COV.position.set(-KW/2,0.045,0);bkIn.add(COV);const covIn=new T.Group();covIn.position.set(KW/2,0,0);COV.add(covIn);mesh(new T.BoxGeometry(KW,0.015,KD),W,covIn,true);
    const cover=ctex(372,456,(x,w,h)=>{x.fillStyle='#FBFBF8';x.fillRect(0,0,w,h);x.fillStyle='#A9C7F1';x.fillRect(0,300,w,156);x.fillStyle=INKC;x.font='500 18px '+MONO;x.fillText('heartfix® HF-01',24,46);x.font='900 52px '+RUB;x.fillText('Инструкция',22,130);x.font='400 22px '+RUB;x.fillText('сборка сердца',24,176);x.fillText('в 26 шагов',24,206);x.font='500 18px '+MONO;x.fillText('1 деталь в день',24,360);x.fillText('№03 — ставит близкий',24,392);x.strokeStyle=INKC;x.lineWidth=4;x.strokeRect(3,3,w-6,h-6);});
    label(cover,KW-0.03,KD-0.03,covIn,[0,0.009,0],[-Math.PI/2,0,0]);
    const inside=ctex(372,456,(x,w,h)=>{x.fillStyle='#FBFBF8';x.fillRect(0,0,w,h);x.fillStyle='#4C4C47';x.font='500 18px '+MONO;x.fillText('как пользоваться',24,44);x.fillStyle=INKC;x.font='800 28px '+RUB;
      [['1','одна деталь в день'],['2','по порядку номеров'],['3','собирать самой'],['№03','ставит близкий']].forEach((r,i)=>{x.fillStyle='#2B6BF0';x.font='900 30px '+RUB;x.fillText(r[0],24,110+i*72);x.fillStyle=INKC;x.font='500 22px '+RUB;x.fillText(r[1],118,108+i*72);});
      x.strokeStyle='#121212';x.lineWidth=2;x.setLineDash([6,6]);x.beginPath();x.moveTo(24,400);x.lineTo(w-24,400);x.stroke();x.setLineDash([]);x.fillStyle='#4C4C47';x.font='500 16px '+MONO;x.fillText('ловушка модуля = −3 детали',24,432);});
    label(inside,KW-0.03,KD-0.03,covIn,[0,-0.009,0],[Math.PI/2,0,Math.PI]);
    const BKhome=V3(0.72,0.2,0.4);
    const b3cv3=document.getElementById('hf3d2');let R3=null;
    if(b3cv3){try{R3=new T.WebGLRenderer({canvas:b3cv3,antialias:true,alpha:true});R3.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R3.setClearColor(0x000000,0);}catch(err){R3=null;}}
    this._R3=R3;
    const sm3=(v,a,b)=>{const q=Math.min(1,Math.max(0,(v-a)/(b-a)));return q*q*(3-2*q);};const back3=(q)=>{const c1=1.7,c3=c1+1;return q<=0?0:1+c3*Math.pow(q-1,3)+c1*Math.pow(q-1,2);};
    const L3=(a,b,q)=>a+(b-a)*q;
    this._c2=(t)=>{if(!R3)return;const sec=document.getElementById('ch-02');if(!sec)return;if(!sec.classList.contains('c2-3d'))sec.classList.add('c2-3d');
      const sr=sec.getBoundingClientRect();const vh=window.innerHeight||800;if(sr.bottom<0||sr.top>vh)return;
      const stH=b3cv3.parentElement.getBoundingClientRect().height||vh;const p=Math.min(1,Math.max(0,(56-sr.top)/Math.max(1,sr.height-stH)));
      if(sr.top<vh*0.8&&!sec.classList.contains('c2-in'))sec.classList.add('c2-in');const step=p<0.2?0:(p<0.45?1:(p<0.7?2:3));if(sec.getAttribute('data-step')!==String(step))sec.setAttribute('data-step',String(step));sec.style.setProperty('--c2p',p.toFixed(3));
      const st=this.state||{};const mod=st.sel!=null?OBJS[st.sel].mod:'';if(mod!==pouchMod){pouchMod=mod;drawPouch(mod);}
      const r=b3cv3.getBoundingClientRect();if(Math.round(r.width)!==this._c3w||Math.round(r.height)!==this._c3h){this._c3w=Math.round(r.width);this._c3h=Math.round(r.height);R3.setSize(this._c3w,this._c3h,false);}
      const art=sec.querySelector('.c2-art');if(!art)return;const a=art.getBoundingClientRect();
      /* timeline */
      const b3lid=back3(sm3(p,0.12,0.3));LID.rotation.x=-b3lid*1.92;
      BX.rotation.y=L3(-0.75,-0.18,sm3(p,0,0.35))+Math.sin(t*0.5)*0.03;BX.position.y=Math.sin(t*1.1)*0.02;
      BP.forEach((w,i)=>{const q=sm3(p,0.24+i*0.011,0.29+i*0.011);const s=back3(q);w.scale.setScalar(Math.max(0.0001,w.userData.f*s));w.position.y=0.34+(1-q)*0.35+(q>0.99?Math.sin(t*2+i)*0.01:0);w.rotation.y=(1-q)*2.4+Math.sin(t*0.7+i)*0.15;w.visible=q>0.001;});
      const pq=sm3(p,0.46,0.56);FLAP.rotation.x=-back3(pq)*1.7;POU.scale.setScalar(1+(step===2?Math.sin(t*4)*0.025:0));
      const bq=sm3(p,0.68,0.86),cq=sm3(p,0.84,0.97);
      BK.position.set(L3(BKhome.x,0.05,bq),L3(BKhome.y,0.95,bq)+Math.sin(t*1.4)*0.02*bq,L3(BKhome.z,0.75,bq));BK.rotation.set(L3(0,1.0,bq),L3(0,0.12,bq),L3(0,-0.06,bq));BK.scale.setScalar(L3(1,1.25,bq));
      COV.rotation.z=back3(cq)*Math.PI*0.94;
      /* camera: front 3/4 → look inside → back up for the booklet */
      const ci=sm3(p,0.12,0.42),cb=sm3(p,0.66,0.86);
      cam3.position.set(L3(0.4,0.15,ci),L3(1.9,4.1,ci)-cb*1.5,L3(6.4,4.7,ci)+cb*1.1);cam3.lookAt(0,L3(0.35,0.3,ci)+cb*0.35,0);
      const x=a.left-r.left,y=r.bottom-a.bottom;R3.setScissorTest(true);R3.setViewport(x,y,a.width,a.height);R3.setScissor(x,y,a.width,a.height);R3.setClearColor(0,0);R3.clear();cam3.aspect=a.width/a.height;cam3.updateProjectionMatrix();R3.render(sc3,cam3);R3.setScissorTest(false);};
    /* chapter 03: the 16 parts in a 4×4 tray + the selected one large, in the same toon/ink style */
    const sc4=new T.Scene();sc4.add(new T.AmbientLight(0xffffff,0.5));{const d4=new T.DirectionalLight(0xffffff,0.95);d4.position.set(3.5,5,6);sc4.add(d4);}
    const cam4=new T.PerspectiveCamera(30,1,0.1,50);cam4.position.set(0,0.1,3.3);cam4.lookAt(0,0,0);
    const C4=parts.map((src)=>{const c=ownMats(src.clone(true));c.position.set(0,0,0);c.rotation.set(0,0,0);c.scale.set(1,1,1);const bb=new T.Box3().setFromObject(c);const sz=bb.getSize(V3(0,0,0));const ct=bb.getCenter(V3(0,0,0));c.position.sub(ct);
      const wr=new T.Group();wr.add(c);wr.userData={fit:1.25/Math.max(sz.x,sz.y,sz.z*0.85,0.01),spin:0};wr.visible=false;sc4.add(wr);return wr;});
    const c4cv=document.getElementById('hf3d3');let R4=null;
    if(c4cv){try{R4=new T.WebGLRenderer({canvas:c4cv,antialias:true,alpha:true});R4.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R4.setClearColor(0x000000,0);R4.autoClear=false;}catch(err){R4=null;}}
    this._R4=R4;let c4lt=0,c4sel=-1,c4t0=0;
    this._c3=(t)=>{if(!R4)return;const sec=document.getElementById('ch-03');if(!sec)return;const r=c4cv.getBoundingClientRect();if(r.bottom<0||r.top>(window.innerHeight||800)||!r.width)return;
      if(Math.round(r.width)!==this._c4w||Math.round(r.height)!==this._c4h){this._c4w=Math.round(r.width);this._c4h=Math.round(r.height);R4.setSize(this._c4w,this._c4h,false);}
      const dt=Math.min(0.05,Math.max(0,t-c4lt));c4lt=t;const st=this.state||{};const sel=st.p3||0;if(sel!==c4sel){c4sel=sel;c4t0=t;}
      R4.setScissorTest(false);R4.clear();R4.setScissorTest(true);
      const draw=(i,el,big)=>{const a=el.getBoundingClientRect();if(a.width<2)return;const w=C4[i];const u=w.userData;C4.forEach(o=>{o.visible=o===w;});
        if(big){const k=t-c4t0;const intro=k<1.2?1-Math.pow(1-Math.min(1,k/0.7),3):1;const sp=k<1.2?(1-intro)*Math.PI*2:0;
          w.scale.setScalar(u.fit*(0.5+0.4*intro));w.rotation.set(0.2+Math.sin(t*0.8)*0.05,Math.sin(t*0.55)*0.85+sp,Math.sin(t*0.5)*0.04);w.position.set(0,Math.sin(t*1.2)*0.03,0);cam4.position.set(0,0.1,2.9);}
        else{const hov=el.parentElement&&el.parentElement.matches(':hover');u.spin+=dt*(hov?2.6:0);u.spin*=hov?1:0.95;const on=i===sel;
          w.scale.setScalar(u.fit*(on?1.08:0.92));w.rotation.set(0.14,Math.sin(t*0.6+i*0.8)*0.4+u.spin,0);w.position.set(0,0,0);cam4.position.set(0,0.1,3.3);}
        cam4.lookAt(0,0,0);const x=a.left-r.left,y=r.bottom-a.bottom;R4.setViewport(x,y,a.width,a.height);R4.setScissor(x,y,a.width,a.height);cam4.aspect=a.width/a.height;cam4.updateProjectionMatrix();R4.render(sc4,cam4);};
      sec.querySelectorAll('.c3-slot').forEach((el,i)=>{if(C4[i])draw(i,el,false);});
      const view=sec.querySelector('.c3-view');if(view&&C4[sel])draw(sel,view,true);
      R4.setScissorTest(false);};
    const DOCK=[[-1.45,0.75,0.62,0.3],[-0.95,1.15,0.7,-0.2],[-0.4,0.95,0.86,0.4],[0.4,0.95,0.86,-0.3],[0.95,1.15,0.7,0.25],[1.45,0.75,0.62,-0.4],[-1.55,0.15,0.6,0.1],[-0.95,0.4,0.88,-0.15],[-0.35,0.25,0.95,0.2],[0.25,-0.25,0.95,-0.3],[-1.15,-0.45,0.72,0.35],[-0.5,-0.55,0.92,-0.1],[0.45,-0.7,0.9,0.3],[1.05,-0.55,0.7,-0.25],[-0.6,-1.15,0.74,0.15],[0.2,-1.35,0.7,-0.35]];
    parts.forEach((p,i)=>{p.userData.a=-Math.PI/2+i/parts.length*Math.PI*2;p.userData.z=(i%2?0.9:-0.3);p.userData.rx=0.3+((i*37)%10)/14;p.userData.ry=0.4+((i*53)%10)/12;p.userData.t0=0.12+i*0.036;});
    const rack=new T.Group();scene.add(cam);cam.add(rack);const RX=[3.45,4.83],RY0=3.0,RS=0.94;
    mesh(new T.BoxGeometry(2.86,8*RS+0.2,0.1),'#FBFBF8',rack,true,[4.14,RY0-3.5*RS,-0.62]);
    for(let r=0;r<=8;r++)mesh(new T.BoxGeometry(2.8,0.035,0.2),'#2A2A2E',rack,true,[4.14,RY0+RS/2-r*RS,-0.5]);
    mesh(new T.BoxGeometry(0.035,8*RS,0.2),'#2A2A2E',rack,true,[4.14,RY0-3.5*RS,-0.5]);
    const ntag=(n)=>{const tx=ctex(96,64,(x,w,h)=>{x.fillStyle='#121212';x.font='500 40px "IBM Plex Mono", monospace';x.textBaseline='middle';x.fillText(n,6,34);});const sp=new T.Sprite(new T.SpriteMaterial({map:tx,transparent:true}));sp.scale.set(0.27,0.18,1);return sp;};
    const CELL=[];for(let i=0;i<16;i++){const c=V3(RX[i%2],RY0-Math.floor(i/2)*RS,-0.3);CELL.push(c);const tg=ntag((i<9?'0':'')+(i+1));tg.position.set(c.x-0.5,c.y+0.31,-0.38);rack.add(tg);}
    const sh2=ctex(512,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.save();x.beginPath();x.ellipse(w/2,h/2,w/2-8,h/2-10,0,0,7);x.clip();x.strokeStyle='rgba(18,18,18,.55)';x.lineWidth=3;for(let i=-h;i<w+h;i+=11){x.beginPath();x.moveTo(i,h);x.lineTo(i+h,0);x.stroke();}x.restore();});
    const shadow=new T.Mesh(new T.PlaneGeometry(4.6,0.95),new T.MeshBasicMaterial({map:sh2,transparent:true,depthWrite:false}));shadow.position.set(0.3,-3.02,-0.8);scene.add(shadow);
    this._mx=0;this._my=0;const onMove=(ev)=>{this._mx=(ev.clientX/window.innerWidth-0.5);this._my=(ev.clientY/window.innerHeight-0.5);};window.addEventListener('pointermove',onMove);
    const sm=(v)=>{v=Math.min(1,Math.max(0,v));return v*v*(3-2*v);};
    const tmp=V3(0,0,0),pw=V3(0,0,0),look=V3(0,0,0);
    if(this._sel==null)this._sel=-1;
    const pc=document.getElementById('hfPart');let R2=null,sc2=null,cam2=null,holder=null,shown=-2;
    if(pc){try{R2=new T.WebGLRenderer({canvas:pc,antialias:true,alpha:true});R2.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R2.setClearColor(0x000000,0);}catch(err){R2=null;}
      if(R2){sc2=new T.Scene();sc2.add(new T.AmbientLight(0xffffff,0.55));const d2=new T.DirectionalLight(0xffffff,0.95);d2.position.set(3,4,5);sc2.add(d2);cam2=new T.PerspectiveCamera(30,1.5,0.1,50);cam2.position.set(0,0.25,4.4);cam2.lookAt(0,0,0);holder=new T.Group();sc2.add(holder);}}
    this._R2=R2;
    const ray=new T.Raycaster();const ndc=new T.Vector2();
    const pick=(ev)=>{const r=cv.getBoundingClientRect();ndc.set(((ev.clientX-r.left)/r.width)*2-1,-((ev.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ndc,cam);const hits=ray.intersectObjects(parts,true);if(!hits.length)return -1;let o=hits[0].object;while(o&&parts.indexOf(o)<0)o=o.parent;return o?parts.indexOf(o):-1;};
    const onDown=(ev)=>{const i=pick(ev);if(i>=0){this._sel=i;this._photo=i;this.setState({selPart:i,pop:true});}};
    const onHover=(ev)=>{cv.style.cursor=(pick(ev)>=0)?'pointer':'default';};
    cv.addEventListener('pointerdown',onDown);cv.addEventListener('pointermove',onHover);
    const clock=new T.Clock();
    const loop=()=>{if(this._dead){window.removeEventListener('pointermove',onMove);return;}if(document.getElementById('hf3d')!==cv||(cv1&&document.getElementById('hf3d1')!==cv1)||(b3cv3&&document.getElementById('hf3d2')!==b3cv3)||(c4cv&&document.getElementById('hf3d3')!==c4cv)||(pc&&document.getElementById('hfPart')!==pc)){window.removeEventListener('pointermove',onMove);try{R.dispose();if(R2)R2.dispose();if(this._R1)this._R1.dispose();if(this._R3)this._R3.dispose();if(this._R4)this._R4.dispose();}catch(err){}this._R4=null;this._c3=null;this._R1=null;this._c1=null;this._R3=null;this._c2=null;this._R2=null;this._R=null;this._w=0;this._h=0;this.init3D();return;}this._rafG=requestAnimationFrame(loop);
      const t=clock.getElapsedTime();const dt=Math.min(0.05,t-(this._lt||t));this._lt=t;const tg=this._tA||0;const cur=this._Ac||0;const sp=tg>cur?0.13:0.3;this._Ac=cur+Math.sign(tg-cur)*Math.min(Math.abs(tg-cur),dt*sp);const A=this._Ac;const e=1-A;if(Math.abs((this._lastPa||0)-A)>0.01||(A===tg&&this._lastPa!==A)){this._lastPa=A;this.setState({pa:A});}SEED.value=(Math.floor(t*7)%5)*0.73;
      const w=cv.clientWidth,h=cv.clientHeight;if(w&&h&&(w!==this._w||h!==this._h)){this._w=w;this._h=h;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
      const ti=this._insp||0;const icur=this._ic||0;this._ic=icur+Math.sign(ti-icur)*Math.min(Math.abs(ti-icur),dt*1.3);const ic=sm(this._ic);const open=Math.max(sm((A-0.02)/0.09)*(1-sm((A-0.74)/0.1)),ic);const zoom=Math.max(sm((A-0.03)/0.1)*(1-sm((A-0.76)/0.12)),ic);
      root.rotation.y=(Math.sin(t*0.45)*0.4+this._mx*0.5)*(1-zoom*0.85);root.rotation.x=(Math.sin(t*0.33)*0.08+this._my*0.25)*(1-zoom*0.85);
      hinge.rotation.x=-1.95*open;
      port.updateMatrixWorld(true);port.getWorldPosition(pw);
      const zr=sm((A-0.03)/0.1)*(1-sm((A-0.76)/0.12));const fx=0.35*zr*(1-ic)+ic;const dz=2.2*zr*(1-ic)+7.4*ic;cam.position.set(pw.x*fx,0.4+(pw.y-0.4)*fx,12.3-dz);look.set(pw.x*Math.max(0.6*zr,ic),pw.y*Math.max(0.6*zr,ic),0);cam.lookAt(look);{const hw=Math.tan(15*Math.PI/180)*12.3*cam.aspect;const vh2=Math.tan(15*Math.PI/180)*12.3*2;const rs=Math.min(1.05,vh2*0.86/7.75);rack.scale.setScalar(rs);this._rs=rs;rack.position.set(hw*0.9-5.57*rs+ic*hw*1.3,0.45*rs-0.4,-12.3);cam.updateMatrixWorld(true);}if(this._w){cam.setViewOffset(this._w,this._h,-0.035*this._w*(1-ic),0.02*this._h*(1-ic),this._w,this._h);cam.updateProjectionMatrix();}
      let done=0;
      parts.forEach((p,i)=>{const u=p.userData;const q=Math.max(sm((A-u.t0)/0.1),ic);const isSel=this._sel===i;
        const cw=CELL[i].clone();rack.localToWorld(cw);root.worldToLocal(cw);const ox=cw.x,oy=cw.y+Math.sin(t*1.6+i)*0.025,oz=cw.z;
        const s=sockets[i];tmp.set(0,0,0);s.s.localToWorld(tmp);root.worldToLocal(tmp);
        const lift=Math.sin(q*Math.PI)*0.9;
        p.position.set(ox+(tmp.x-ox)*q,oy+(tmp.y-oy)*q+lift*0.3,oz+(tmp.z+0.05-oz)*q+lift);
        if(u.fit==null){p.scale.setScalar(1);p.rotation.set(0,0,0);p.position.set(0,0,0);p.updateMatrixWorld(true);const bx=new T.Box3().setFromObject(p);const sz=bx.getSize(V3(0,0,0));u.cOff=bx.getCenter(V3(0,0,0));u.fit=Math.min(0.92/Math.max(Math.hypot(sz.x,sz.z),0.01),0.58/Math.max(sz.y,0.01));}const sCell=u.fit*(this._rs||1);const sSock=(0.25+0.2*ic)*u.s;const scl=(sCell+(sSock-sCell)*q)*(isSel?(q<0.5?1.1:1.5):1);p.scale.setScalar(scl);p.rotation.set(0.12*(1-q),Math.sin(t*0.7+i)*0.35*(1-q)+(isSel?Math.sin(t*3)*0.3:0),0);{const off=u.cOff.clone().applyEuler(p.rotation).multiplyScalar(scl*(1-q));p.position.sub(off);p.position.y-=0.06*(this._rs||1)*(1-q);}if(isSel&&q>0.5)p.position.addScaledVector(V3(0,0,1),0.3+Math.sin(t*4)*0.05);
        const inn=q>0.98;if(inn)done++;s.led.material.color.set(inn?'#2B6BF0':'#8C939C');if(isSel)s.led.material.color.set(Math.sin(t*8)>0?'#2B6BF0':'#FBFBF8');});
      this._done=done;
      const heal=sm((A-0.86)/0.1);crack.visible=heal<0.99;crack.scale.setScalar(1);stitches.forEach((st,i)=>{st.scale.setScalar(Math.max(0.001,sm(heal*1.4-i*0.1)));});
      const bt2=A>0.97?1+0.06*Math.pow(Math.max(0,Math.sin(t*5.2)),8):1+0.015*Math.pow(Math.max(0,Math.sin(t*3.1+Math.sin(t*1.7)*2)),6);heart.scale.setScalar(bt2);
      shadow.scale.set(0.9+0.15*A,1,1);
      if(R2){const sl=this._photo==null?0:this._photo;if(sl!==shown){shown=sl;while(holder.children.length)holder.remove(holder.children[0]);const c=parts[sl].clone(true);c.position.set(0,0,0);c.rotation.set(0,0,0);c.scale.setScalar(1);c.updateMatrixWorld(true);const box=new T.Box3().setFromObject(c);const sz=box.getSize(V3(0,0,0));const ct=box.getCenter(V3(0,0,0));c.position.sub(ct);const wr=new T.Group();wr.add(c);wr.scale.setScalar(1.3/Math.max(sz.x,sz.y,sz.z,0.01));holder.add(wr);}
        holder.rotation.y=t*0.8;holder.rotation.x=Math.sin(t*0.6)*0.25;const pw2=pc.clientWidth,ph2=pc.clientHeight;if(pw2&&ph2&&(pw2!==this._pw||ph2!==this._ph)){this._pw=pw2;this._ph=ph2;R2.setSize(pw2,ph2,false);cam2.aspect=pw2/ph2;cam2.updateProjectionMatrix();}R2.render(sc2,cam2);}
      R.render(scene,cam);if(this._c1)this._c1(t);if(this._c2)this._c2(t);if(this._c3)this._c3(t);};
    loop();this.setState({three:true});
  }
  renderVals(){
    const s=this.state||{};const active=s.active||0;const a=s.pa||0;const e=1-a;const seen=s.seen||{};
    const W=1440,H=780;const vh0=Math.min(s.vh||900,1000);const stage=Math.max(420,vh0-56);const k=(s.vw||1440)/W;const HH=stage/k;const lineH=Math.max(150,Math.min(330,(HH-112)/2));const lw=(s.vw||1440)>=1180?200:0;const k1=Math.min(((s.vw||1440)-lw-40)/W,(stage-24)/H);
    const wheel=CH.map((c,i)=>{const d=i-active;const ad=Math.abs(d);const th=d*25*Math.PI/180;const r=ad===0?100:108;
      const x=r*Math.cos(th);const y=190+r*Math.sin(th)-(ad===0?14:10);const op=ad===0?1:(ad===1?0.45:(ad===2?0.2:0));
      return {href:'#ch-'+c[0],small:c[0]+' · '+c[1],big:c[1],cls:'wl'+(ad===0?' on':''),style:`position:absolute;left:0;top:0;transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px);white-space:nowrap;text-decoration:none;color:#121212;opacity:${op};pointer-events:${ad<3?'auto':'none'}`};});
    const pp={};POS.forEach((p,i)=>{const x=p[0]*e+CX*(1-e),y=p[1]*e+(CY+10)*(1-e);const sc=0.25+0.75*e;pp['p'+(i+1)]=`transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${sc.toFixed(3)});opacity:${Math.min(1,e*1.8).toFixed(2)}`;});
    const sh=(dx,dy,r)=>`transform-box:fill-box;transform-origin:center;transform:translate(${(dx*e).toFixed(1)}px,${(dy*e).toFixed(1)}px) rotate(${(r*e).toFixed(2)}deg)`;
    const nums=POS.map((p,i)=>{const lx=CX+292*Math.cos(p[2]),ly=CY+268*Math.sin(p[2]);return {n:String(i+1),style:`position:absolute;left:${(lx/620*100).toFixed(2)}%;top:${(ly/600*100).toFixed(2)}%;transform:translate(-50%,-50%);border:1px solid #121212;background:#FBFBF8;font-size:10px;line-height:1;padding:3px 4px;min-width:18px;text-align:center;opacity:${e.toFixed(2)};transition:opacity .2s`};});
    const tiles=TILES.map((k,ti)=>{const last=ti===TILES.length-1;const on=last?'#121212':'#FBFBF8';const bg=last?'#86B2EE':'#121212';
      return {arrow:last?'▶':'',style:`display:grid;grid-template-columns:repeat(7,1fr);width:58px;height:58px;padding:6px;background:${bg};gap:0`,cells:PIX[k].join('').split('').map(ch=>`display:block;aspect-ratio:1;background:${ch==='X'?on:'transparent'}`)};});
    const sel=s.sel==null?0:s.sel;const C=OBJS[sel];
    return {
      wheel,curNum:CH[active][0],numStrip:`transform:translateY(${(-active*176).toFixed(0)}px)`,heartD:HEART_D,gearD:GEAR_D,springD:SPRING_D,leadD:LEAD_D,pp,nums,tiles,
      leadStyle:`opacity:${e.toFixed(2)}`,shL:sh(-74,8,-7),shR:sh(74,-8,6),
      c1Section:`position:relative;height:${stage}px;background:#FBFBF8;overflow:hidden;display:flex;align-items:center;justify-content:center;padding-left:${lw}px`,
      c2Section:`position:relative;height:${Math.round(stage*3.4)}px;background:#FBFBF8;padding-left:${lw}px`,c2Sticky:`position:sticky;top:56px;height:${stage}px;display:flex;align-items:center;justify-content:center;overflow:hidden`,c2Mod:s.sel!=null?('Твой — '+OBJS[s.sel].mod+', 10 деталей именно под эту историю.'):'Выбираешь при заказе: расставание, ссора, потеря, переезд или провал.',c3Section:`position:relative;height:${stage}px;background:#FBFBF8;background-image:radial-gradient(rgba(110,159,230,.22) 1px,transparent 1.3px);background-size:14px 14px;overflow:hidden;display:flex;align-items:center;justify-content:center;padding-left:${lw}px`,c3Cls:'c3-card k'+(s.p3||0),p3:(()=>{const i=s.p3||0;const d=PARTS_INFO[i];const PR=[590,390,-1,290,190,790,250,-2,99,490,350,190,320,450,270,390];const pr=PR[i];const price=pr===-1?'не продаётся':(pr===-2?'0 ₽':pr+' ₽');const buy=pr===-1?'ставит только близкий':(pr===-2?'просто позвони':'Докупить деталь');return {n:String(i+1).padStart(2,'0'),day:String(i+1),name:d[0],desc:d[1],note:d[2],price,buy,off:pr<0?'true':'false',priceCls:'c3-price'+(pr===-1?' free':''),buyCls:'c3-buyb'+(pr<0?' off':'')};})(),c3prev:()=>this.setState({p3:((s.p3||0)+15)%16}),c3next:()=>this.setState({p3:((s.p3||0)+1)%16}),c3cells:PARTS_INFO.map((d,i)=>({n:String(i+1).padStart(2,'0'),label:'№'+String(i+1).padStart(2,'0')+' — '+d[0],cls:'c3cell'+(i===(s.p3||0)?' on':''),pressed:i===(s.p3||0)?'true':'false',pick:()=>this.setState({p3:i})})),c1Box:`position:relative;width:${(W*k1).toFixed(0)}px;height:${(H*k1).toFixed(0)}px`,
      c1Inner:`position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:top left;transform:scale(${k1.toFixed(4)})`,
      flatStyle:s.three?'display:none':'position:absolute;left:452px;top:246px;width:500px;height:490px',
      tag3d:s.three?'position:absolute;left:452px;top:712px;font-size:10px;color:#4C4C47':'display:none',
      heroStyle:`position:relative;height:${stage}px;background-image:radial-gradient(rgba(255,255,255,.55) 1px,transparent 1.3px);background-size:12px 12px`,
      stageStyle:`position:sticky;top:56px;height:${stage}px;display:flex;align-items:center;justify-content:center;overflow:hidden`,
      boxStyle:`position:relative;width:${(s.vw||1440)}px;height:${stage}px`,
      sheetStyle:`position:absolute;left:0;top:0;width:${W}px;height:${HH.toFixed(1)}px;background:#FBFBF8;overflow:hidden;transform-origin:top left;transform:scale(${k.toFixed(4)})`,
      heartWordStyle:`position:absolute;left:20px;top:44px;width:1400px;height:${lineH.toFixed(0)}px;overflow:visible;z-index:1;opacity:.22`,
      fixStyle:`position:absolute;right:20px;bottom:48px;width:900px;height:${lineH.toFixed(0)}px;overflow:visible;z-index:1;opacity:.22;transform:translateX(${(60*e).toFixed(1)}px);transition:transform .2s linear`,
      wL:`transform-box:fill-box;transform-origin:center;transform:translate(${(-34*e).toFixed(1)}px,${(10*e).toFixed(1)}px) rotate(${(-2.2*e).toFixed(2)}deg);transition:transform .2s linear`,
      wR:`transform-box:fill-box;transform-origin:center;transform:translate(${(34*e).toFixed(1)}px,${(-10*e).toFixed(1)}px) rotate(${(2*e).toFixed(2)}deg);transition:transform .2s linear`,
      canvasStyle:`position:absolute;left:0;top:0;width:1440px;height:${(HH-40).toFixed(0)}px;pointer-events:auto;filter:url(#wob3);z-index:2`,
      toggleAsm:()=>{if(this._insp)return;this._tA=(this._tA||0)>0.5?0:1;this._sel=-1;this.setState({tgt:this._tA,pop:false});},
      showAsm:!s.insp,
      asmLabel:(s.tgt||0)>0.5?(a<0.995?'Собирается…':'Разобрать обратно'):(a>0.005?'Разбирается…':'Начать сборку'),
      toggleInsp:()=>{this._insp=this._insp?0:1;if(!this._insp){this._sel=-1;}this.setState({insp:this._insp,pop:this._insp?s.pop:false});},
      inspLabel:s.insp?'Закрыть':'Заглянуть внутрь',
      
      sel:(()=>{const i=s.selPart==null?0:s.selPart;const P=PARTS_INFO[i];return {n:'№'+(i<9?'0':'')+(i+1),name:P[0],does:P[1],note:P[2]};})(),
      panelKicker:s.insp?'деталь внутри':'что внутри',
      panelHint:s.insp?'Нажми на любую деталь внутри сердца — здесь появится, что это и зачем.':'Внутри 16 деталей. Нажми «Заглянуть внутрь», чтобы открыть сердце и рассмотреть каждую.',
      panelStyle:`position:absolute;right:40px;top:50%;transform:translateY(-60%) rotate(${s.insp?0:1.5}deg);width:250px;z-index:6;background:#FBFBF8;border:1.5px solid #121212;box-shadow:6px 6px 0 ${s.insp?'#A9C7F1':'#121212'};padding:14px 16px 16px;transition:transform .3s,box-shadow .3s`,
      leftStyle:`position:absolute;left:64px;top:0;bottom:40px;width:380px;z-index:4;display:flex;flex-direction:column;justify-content:center;opacity:${(s.insp||s.pop)?0:1};transform:translateX(${(s.insp||s.pop)?-30:0}px);pointer-events:${(s.insp||s.pop)?'none':'auto'};transition:opacity .5s,transform .5s`,
      popStyle:`position:absolute;left:64px;top:50%;width:340px;z-index:8;background:#FBFBF8;border:1.5px solid #121212;box-shadow:7px 7px 0 #121212;transform:translateY(-58%) scale(${s.pop?1:0.92});opacity:${s.pop?1:0};pointer-events:${s.pop?'auto':'none'};transition:opacity .25s,transform .3s cubic-bezier(.3,1.4,.5,1)`,
      closePop:()=>{this._sel=-1;this.setState({pop:false});},
      ctrlStyle:`position:absolute;left:${s.insp?50:63}%;bottom:58px;transform:translateX(-50%);z-index:7;display:flex;flex-direction:column;gap:12px;align-items:center;transition:left .6s cubic-bezier(.3,1,.4,1)`,
      pct:Math.round(a*100)+'%',
      barPos:`position:absolute;left:${s.insp?50:53}%;bottom:58px;transform:translateX(-50%);z-index:7;display:flex;align-items:center;gap:16px;background:#FBFBF8;border:1.3px solid #121212;box-shadow:4px 4px 0 #A9C7F1;padding:10px 18px 10px 14px;white-space:nowrap;transition:left .6s cubic-bezier(.3,1,.4,1)`,
      statusUp:e<0.03?'ASSEMBLED':'BROKEN',
      stampStyle:`position:absolute;left:50%;bottom:64px;z-index:5;padding:4px;border:3px solid ${e<0.03?'#2457C9':'#121212'};color:${e<0.03?'#2457C9':'#121212'};background:${e<0.03?'#E4EEFC':'rgba(251,251,248,.94)'};transform:translateX(-50%) rotate(${e<0.03?-2:-6}deg) scale(${e<0.03?1.06:1});transition:all .35s cubic-bezier(.3,1.4,.5,1)`,
      stampBar:`position:absolute;left:0;top:0;bottom:0;width:${(a*100).toFixed(1)}%;background:currentColor`,
      stWord:`text-transform:uppercase;letter-spacing:.08em;font-weight:500;color:#121212;padding:2px 7px;background:${e<0.03?'#A9C7F1':'transparent'};border:1.2px solid ${e<0.03?'#121212':'transparent'};transition:background .3s`,
      segs:Array.from({length:26},(_,i)=>`display:block;flex:1;height:10px;border:1px solid #121212;background:${i<Math.round(a*26)?(e<0.03?'#86B2EE':'#121212'):'transparent'};transition:background .15s`),
      barStyle:`position:absolute;left:0;top:0;bottom:0;width:${(a*100).toFixed(1)}%;background:#121212`,
      ticker:MATS.concat(MATS).map((t,i)=>({n:CIRC[i%16],t})),
      wheelBox:`position:fixed;left:0;top:50%;margin-top:-190px;width:240px;height:380px;z-index:50;transform:translateX(${active>=1?0:-260}px);opacity:${active>=1?1:0};transition:transform .7s cubic-bezier(.2,.9,.25,1.1),opacity .4s;pointer-events:${active>=1?'auto':'none'}`,
      status:e<0.03?'собрано':'разбито',count:Math.round(a*26),approval:e<0.03?'complete':'pending',
      mats:MATS.map((t,i)=>({n:CIRC[i],t})),
      rvT:'rv'+(seen.t?' in':''),rvS:'rv'+(seen.s?' in':''),rvB:'rv'+(seen.b?' in':''),
      objs:OBJS.map((o,i)=>{const key='o'+i;return {key,n:'0'+(i+1),item:o.item,sit:o.sit,sel:i===sel,aria:'Поломка '+(i+1)+': '+o.sit,
        is1:i===0,is2:i===1,is3:i===2,is4:i===3,is5:i===4,is6:i===5,
        cls:'obj rv'+(seen[key]?' in':'')+(i===sel?' sel':''),pick:()=>this.setState({sel:i}),
        style:`position:absolute;left:${o.x}px;top:${o.y}px;width:${o.w}px;rotate:${o.r}deg;transition-delay:${(i*0.08).toFixed(2)}s`};}),
      c1Has:s.sel!=null,c1None:s.sel==null,step2Cls:'c1-dot'+(s.sel!=null?' on':''),diagCls:'c1-res k'+sel,reset:()=>this.setState({sel:null}),d:{n:'0'+(sel+1),sit:C.sit.charAt(0).toUpperCase()+C.sit.slice(1),mod:C.mod,goal:C.goal,fin:C.fin,trap:C.trap},cards:OBJS.map((o,i)=>{const key='o'+i;const has=s.sel!=null;return {key,n:'0'+(i+1),sit:o.sit.charAt(0).toUpperCase()+o.sit.slice(1),item:o.item,is1:i===0,is2:i===1,is3:i===2,is4:i===3,is5:i===4,is6:i===5,pressed:has&&i===sel?'true':'false',cls:'c1card'+(seen[key]?' in':'')+(has?(i===sel?' sel':' dim'):''),style:`transition-delay:${(i*0.07).toFixed(2)}s,${(i*0.07).toFixed(2)}s,0s,0s,0s`,pick:()=>this.setState({sel:i})};}),cur:{n:'0'+(sel+1),sit:C.sit,mod:C.mod,goal:C.goal,fin:C.fin}
    };
  }
}

/* ---------- запуск ---------- */
const comp = new Component();
const rootEl = document.getElementById('app');
const items = window.HFBinder.bindTree([rootEl]);
let pending = false;
function render() { window.HFBinder.update(items, comp.renderVals()); }
function scheduleRender() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(function () { pending = false; render(); });
}
render();
if (comp.componentDidMount) comp.componentDidMount();
window.addEventListener('beforeunload', function () { if (comp.componentWillUnmount) comp.componentWillUnmount(); });
})();
