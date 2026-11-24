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
{item:'брелок на двоих',sit:'расставание',mod:'«После него»',goal:'Перестать ждать и писать.',fin:'открытость новому',x:30,y:200,w:230,r:-4},
{item:'браслет дружбы',sit:'ссора с лучшей подругой',mod:'«Без лучшей подруги»',goal:'Не винить себя и не оставаться одной.',fin:'дружба снова возможна',x:330,y:176,w:230,r:3},
{item:'рамка для фото',sit:'смерть близкого человека',mod:'«Светлая память»',goal:'Прожить горе и не закрыться от людей. Без срока и без ловушки.',fin:'любовь остаётся',x:1060,y:140,w:200,r:0},
{item:'ошейник с жетоном',sit:'потеря питомца',mod:'«Лапа на сердце»',goal:'Разрешить себе горевать всерьёз. Без срока.',fin:'место, где он был счастлив',x:60,y:470,w:220,r:2},
{item:'коробка «хрупкое»',sit:'переезд и одиночество',mod:'«Новый город»',goal:'Заново найти своих людей.',fin:'здесь тоже дом',x:400,y:432,w:230,r:-3},
{item:'письмо «к сожалению»',sit:'провал, увольнение, не поступила',mod:'«План Б»',goal:'Вернуть веру в себя.',fin:'новая попытка',x:700,y:262,w:200,r:5}];
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
    const a=clamp(st/560);
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
    const root=new T.Group();scene.add(root);const heart=new T.Group();heart.position.set(0.1,-0.35,0);heart.rotation.z=0.32;root.add(heart);scene.updateMatrixWorld(true);
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
    const W='#FBFBF8',B='#A9C7F1',D='#2A2A2E';
    P(g=>{mesh(new T.CylinderGeometry(0.24,0.24,0.12,24),W,g,true,[0,0.34,0]);mesh(new T.CylinderGeometry(0.09,0.05,0.62,12),W,g,true,[0,0,0]);mesh(new T.BoxGeometry(0.3,0.03,0.04),D,g,true,[0,0.41,0]);});
    P(g=>{mesh(new T.CylinderGeometry(0.16,0.16,0.62,20),B,g,true,[0,0,0],[0,0,Math.PI/2]);mesh(new T.ConeGeometry(0.1,0.22,12),D,g,true,[0.42,0,0],[0,0,-Math.PI/2]);});
    P(g=>{mesh(new T.BoxGeometry(0.4,0.7,0.08),W,g,true);mesh(new T.BoxGeometry(0.3,0.5,0.02),B,g,true,[0,0.04,0.05]);});
    P(g=>{mesh(new T.TorusGeometry(0.3,0.07,10,30,Math.PI),W,g,true,[0,0,0],[0,0,Math.PI]);});
    P(g=>{mesh(new T.BoxGeometry(0.66,0.42,0.12),W,g,true);mesh(new T.CylinderGeometry(0.08,0.08,0.04,16),B,g,true,[-0.14,0.03,0.07],[Math.PI/2,0,0]);mesh(new T.CylinderGeometry(0.08,0.08,0.04,16),B,g,true,[0.14,0.03,0.07],[Math.PI/2,0,0]);});
    P(g=>{mesh(new T.CylinderGeometry(0.22,0.22,0.66,24),B,g,false,[0,0,0],[0,0,Math.PI/2]);});
    P(g=>{mesh(new T.SphereGeometry(0.17,20,14),B,g,true);mesh(new T.ConeGeometry(0.12,0.2,12),W,g,true,[-0.26,0,0],[0,0,-Math.PI/2]);mesh(new T.ConeGeometry(0.12,0.2,12),W,g,true,[0.26,0,0],[0,0,Math.PI/2]);});
    P(g=>{mesh(new T.TorusGeometry(0.32,0.08,10,30,Math.PI),D,g,true);mesh(new T.BoxGeometry(0.2,0.12,0.16),W,g,true,[-0.32,-0.04,0]);mesh(new T.BoxGeometry(0.2,0.12,0.16),W,g,true,[0.32,-0.04,0]);});
    P(g=>{mesh(new T.TorusGeometry(0.22,0.045,8,24),'#E6E6E2',g,true,[0,0.16,0]);mesh(new T.CylinderGeometry(0.06,0.06,0.42,10),'#E6E6E2',g,true,[0,-0.08,0]);});
    P(g=>{mesh(new T.CylinderGeometry(0.15,0.15,0.58,20),B,g,true,[0,0,0],[0,0,Math.PI/2]);mesh(new T.CylinderGeometry(0.06,0.06,0.08,12),D,g,true,[0.33,0,0],[0,0,Math.PI/2]);});
    P(g=>{const sh=new T.Shape();const n=10;for(let i=0;i<n*2;i++){const r=i%2?0.24:0.33;const a1=i*Math.PI/n+0.05,a2=(i+1)*Math.PI/n-0.05;if(i===0)sh.moveTo(r*Math.cos(a1),r*Math.sin(a1));else sh.lineTo(r*Math.cos(a1),r*Math.sin(a1));sh.lineTo(r*Math.cos(a2),r*Math.sin(a2));}const hole=new T.Path();hole.absarc(0,0,0.09,0,Math.PI*2,true);sh.holes.push(hole);const geo=new T.ExtrudeGeometry(sh,{depth:0.12,bevelEnabled:false});geo.translate(0,0,-0.06);mesh(geo,W,g,true);});
    P(g=>{mesh(new T.CylinderGeometry(0.36,0.36,0.03,36),D,g,true,[0,0,0],[Math.PI/2,0,0]);mesh(new T.CylinderGeometry(0.13,0.13,0.035,24),B,g,true,[0,0,0],[Math.PI/2,0,0]);});
    P(g=>{const pts=[];for(let i=0;i<=120;i++){const a=i/120*Math.PI*12;pts.push(new T.Vector3(Math.cos(a)*0.16,-0.32+i/120*0.64,Math.sin(a)*0.16));}mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),200,0.03,6,false),W,g,true);});
    P(g=>{mesh(new T.CylinderGeometry(0.13,0.13,0.48,20),W,g,true);mesh(new T.ConeGeometry(0.08,0.22,12),B,g,true,[0,0.4,0]);});
    P(g=>{const a=mesh(new T.SphereGeometry(0.16,16,12),W,g,true,[-0.12,-0.1,0]);a.scale.set(0.7,1.3,0.4);const b=mesh(new T.SphereGeometry(0.16,16,12),B,g,true,[0.14,0.14,0]);b.scale.set(0.7,1.3,0.4);});
    P(g=>{const sh=new T.Shape([new T.Vector2(-0.4,0),new T.Vector2(0.42,0.22),new T.Vector2(0,-0.3)]);const geo=new T.ExtrudeGeometry(sh,{depth:0.04,bevelEnabled:false});mesh(geo,W,g,true);});
    const DOCK=[[-1.45,0.75,0.62,0.3],[-0.95,1.15,0.7,-0.2],[-0.4,0.95,0.86,0.4],[0.4,0.95,0.86,-0.3],[0.95,1.15,0.7,0.25],[1.45,0.75,0.62,-0.4],[-1.55,0.15,0.6,0.1],[-0.95,0.4,0.88,-0.15],[-0.35,0.25,0.95,0.2],[0.25,-0.25,0.95,-0.3],[-1.15,-0.45,0.72,0.35],[-0.5,-0.55,0.92,-0.1],[0.45,-0.7,0.9,0.3],[1.05,-0.55,0.7,-0.25],[-0.6,-1.15,0.74,0.15],[0.2,-1.35,0.7,-0.35]];
    parts.forEach((p,i)=>{p.userData.a=-Math.PI/2+i/parts.length*Math.PI*2;p.userData.z=(i%2?0.9:-0.3);p.userData.rx=0.3+((i*37)%10)/14;p.userData.ry=0.4+((i*53)%10)/12;p.userData.t0=0.12+i*0.036;});
    const rack=new T.Group();scene.add(rack);const RX=[3.45,4.83],RY0=3.0,RS=0.94;
    mesh(new T.BoxGeometry(2.86,8*RS+0.2,0.1),'#FBFBF8',rack,true,[4.14,RY0-3.5*RS,-0.62]);
    for(let r=0;r<=8;r++)mesh(new T.BoxGeometry(2.8,0.035,0.2),'#2A2A2E',rack,true,[4.14,RY0+RS/2-r*RS,-0.5]);
    mesh(new T.BoxGeometry(0.035,8*RS,0.2),'#2A2A2E',rack,true,[4.14,RY0-3.5*RS,-0.5]);
    const ntag=(n)=>{const tx=ctex(96,64,(x,w,h)=>{x.fillStyle='#121212';x.font='600 40px "IBM Plex Mono", monospace';x.textBaseline='middle';x.fillText(n,6,34);});const sp=new T.Sprite(new T.SpriteMaterial({map:tx,transparent:true}));sp.scale.set(0.27,0.18,1);return sp;};
    const CELL=[];for(let i=0;i<16;i++){const c=V3(RX[i%2],RY0-Math.floor(i/2)*RS,-0.3);CELL.push(c);const tg=ntag((i<9?'0':'')+(i+1));tg.position.set(c.x-0.5,c.y+0.31,-0.38);rack.add(tg);}
    const sh2=ctex(512,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.save();x.beginPath();x.ellipse(w/2,h/2,w/2-8,h/2-10,0,0,7);x.clip();x.strokeStyle='rgba(18,18,18,.55)';x.lineWidth=3;for(let i=-h;i<w+h;i+=11){x.beginPath();x.moveTo(i,h);x.lineTo(i+h,0);x.stroke();}x.restore();});
    const shadow=new T.Mesh(new T.PlaneGeometry(4.6,0.95),new T.MeshBasicMaterial({map:sh2,transparent:true,depthWrite:false}));shadow.position.set(0.3,-2.75,-0.8);scene.add(shadow);
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
    const loop=()=>{if(this._dead){window.removeEventListener('pointermove',onMove);return;}if(document.getElementById('hf3d')!==cv||(pc&&document.getElementById('hfPart')!==pc)){window.removeEventListener('pointermove',onMove);try{R.dispose();if(R2)R2.dispose();}catch(err){}this._R2=null;this._R=null;this._w=0;this._h=0;this.init3D();return;}this._rafG=requestAnimationFrame(loop);
      const t=clock.getElapsedTime();const dt=Math.min(0.05,t-(this._lt||t));this._lt=t;const tg=this._tA||0;const cur=this._Ac||0;const sp=tg>cur?0.13:0.3;this._Ac=cur+Math.sign(tg-cur)*Math.min(Math.abs(tg-cur),dt*sp);const A=this._Ac;const e=1-A;if(Math.abs((this._lastPa||0)-A)>0.01||(A===tg&&this._lastPa!==A)){this._lastPa=A;this.setState({pa:A});}SEED.value=(Math.floor(t*7)%5)*0.73;
      const w=cv.clientWidth,h=cv.clientHeight;if(w&&h&&(w!==this._w||h!==this._h)){this._w=w;this._h=h;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
      const ti=this._insp||0;const icur=this._ic||0;this._ic=icur+Math.sign(ti-icur)*Math.min(Math.abs(ti-icur),dt*1.3);const ic=sm(this._ic);const open=Math.max(sm((A-0.02)/0.09)*(1-sm((A-0.74)/0.1)),ic);const zoom=Math.max(sm((A-0.03)/0.1)*(1-sm((A-0.76)/0.12)),ic);
      root.rotation.y=(Math.sin(t*0.45)*0.4+this._mx*0.5)*(1-zoom*0.85);root.rotation.x=(Math.sin(t*0.33)*0.08+this._my*0.25)*(1-zoom*0.85);
      hinge.rotation.x=-1.95*open;
      port.updateMatrixWorld(true);port.getWorldPosition(pw);
      const zr=sm((A-0.03)/0.1)*(1-sm((A-0.76)/0.12));const fx=0.35*zr*(1-ic)+ic;const dz=2.2*zr*(1-ic)+7.4*ic;cam.position.set(pw.x*fx,0.4+(pw.y-0.4)*fx,12.3-dz);look.set(pw.x*Math.max(0.6*zr,ic),pw.y*Math.max(0.6*zr,ic),0);cam.lookAt(look);{const hw=Math.tan(15*Math.PI/180)*cam.position.z*cam.aspect;const vh2=Math.tan(15*Math.PI/180)*cam.position.z*2;const rs=Math.min(1.05,vh2*0.86/7.75);rack.scale.setScalar(rs);this._rs=rs;rack.position.set((hw*0.9-5.57*rs)*(1-ic),0.45*rs,0);rack.updateMatrixWorld(true);}if(this._w){cam.setViewOffset(this._w,this._h,-0.035*this._w*(1-ic),0.02*this._h*(1-ic),this._w,this._h);cam.updateProjectionMatrix();}
      let done=0;
      parts.forEach((p,i)=>{const u=p.userData;const q=Math.max(sm((A-u.t0)/0.1),ic);const isSel=this._sel===i;
        const cw=CELL[i].clone();rack.localToWorld(cw);root.worldToLocal(cw);const ox=cw.x,oy=cw.y+Math.sin(t*1.6+i)*0.025,oz=cw.z;
        const s=sockets[i];tmp.set(0,0,0);s.s.localToWorld(tmp);root.worldToLocal(tmp);
        const lift=Math.sin(q*Math.PI)*0.9;
        p.position.set(ox+(tmp.x-ox)*q,oy+(tmp.y-oy)*q+lift*0.3,oz+(tmp.z+0.05-oz)*q+lift);
        if(u.fit==null){p.scale.setScalar(1);p.rotation.set(0,0,0);p.position.set(0,0,0);p.updateMatrixWorld(true);const bx=new T.Box3().setFromObject(p);const sz=bx.getSize(V3(0,0,0));u.fit=Math.min(1.0/Math.max(sz.x,sz.z*0.7,0.01),(RS*0.7)/Math.max(sz.y,0.01));}const sCell=u.fit*(this._rs||1);const sSock=(0.25+0.2*ic)*u.s;p.scale.setScalar((sCell+(sSock-sCell)*q)*(isSel?(q<0.5?1.08:1.5):1));p.rotation.set(0.15*(1-q),Math.sin(t*0.7+i)*0.5*(1-q)+(isSel?Math.sin(t*3)*0.4:0),0);if(isSel&&q>0.5)p.position.addScaledVector(V3(0,0,1),0.3+Math.sin(t*4)*0.05);
        const inn=q>0.98;if(inn)done++;s.led.material.color.set(inn?'#2B6BF0':'#8C939C');if(isSel)s.led.material.color.set(Math.sin(t*8)>0?'#2B6BF0':'#FBFBF8');});
      this._done=done;
      const heal=sm((A-0.86)/0.1);crack.visible=heal<0.99;crack.scale.setScalar(1);stitches.forEach((st,i)=>{st.scale.setScalar(Math.max(0.001,sm(heal*1.4-i*0.1)));});
      const bt2=A>0.97?1+0.06*Math.pow(Math.max(0,Math.sin(t*5.2)),8):1+0.015*Math.pow(Math.max(0,Math.sin(t*3.1+Math.sin(t*1.7)*2)),6);heart.scale.setScalar(bt2);
      shadow.scale.set(0.9+0.15*A,1,1);
      if(R2){const sl=this._photo==null?0:this._photo;if(sl!==shown){shown=sl;while(holder.children.length)holder.remove(holder.children[0]);const c=parts[sl].clone(true);c.position.set(0,0,0);c.rotation.set(0,0,0);c.scale.setScalar(1);c.updateMatrixWorld(true);const box=new T.Box3().setFromObject(c);const sz=box.getSize(V3(0,0,0));const ct=box.getCenter(V3(0,0,0));c.position.sub(ct);const wr=new T.Group();wr.add(c);wr.scale.setScalar(1.3/Math.max(sz.x,sz.y,sz.z,0.01));holder.add(wr);}
        holder.rotation.y=t*0.8;holder.rotation.x=Math.sin(t*0.6)*0.25;const pw2=pc.clientWidth,ph2=pc.clientHeight;if(pw2&&ph2&&(pw2!==this._pw||ph2!==this._ph)){this._pw=pw2;this._ph=ph2;R2.setSize(pw2,ph2,false);cam2.aspect=pw2/ph2;cam2.updateProjectionMatrix();}R2.render(sc2,cam2);}
      R.render(scene,cam);};
    loop();this.setState({three:true});
  }
  renderVals(){
    const s=this.state||{};const active=s.active||0;const a=s.pa||0;const e=1-a;const seen=s.seen||{};
    const W=1440,H=780;const vh0=Math.min(s.vh||900,1000);const stage=Math.max(420,vh0-56);const k=(s.vw||1440)/W;const HH=stage/k;const lineH=Math.max(150,Math.min(330,(HH-112)/2));const lw=(s.vw||1440)>=1180?200:0;const k1=Math.min(((s.vw||1440)-lw-40)/W,(stage-24)/H);
    const wheel=CH.map((c,i)=>{const d=i-active;const ad=Math.abs(d);const th=d*25*Math.PI/180;const r=ad===0?100:108;
      const x=r*Math.cos(th);const y=190+r*Math.sin(th)-(ad===0?14:10);const op=ad===0?1:(ad===1?0.45:(ad===2?0.2:0));
      return {href:'#ch-'+c[0],label:ad===0?c[1]:c[0]+' · '+c[1],style:`position:absolute;left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;white-space:nowrap;text-decoration:none;color:#121212;opacity:${op};font-family:${ad===0?"'Dela Gothic One',sans-serif":"'IBM Plex Mono',monospace"};font-size:${ad===0?20:12.5}px;pointer-events:${ad<3?'auto':'none'}`};});
    const pp={};POS.forEach((p,i)=>{const x=p[0]*e+CX*(1-e),y=p[1]*e+(CY+10)*(1-e);const sc=0.25+0.75*e;pp['p'+(i+1)]=`transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${sc.toFixed(3)});opacity:${Math.min(1,e*1.8).toFixed(2)}`;});
    const sh=(dx,dy,r)=>`transform-box:fill-box;transform-origin:center;transform:translate(${(dx*e).toFixed(1)}px,${(dy*e).toFixed(1)}px) rotate(${(r*e).toFixed(2)}deg)`;
    const nums=POS.map((p,i)=>{const lx=CX+292*Math.cos(p[2]),ly=CY+268*Math.sin(p[2]);return {n:String(i+1),style:`position:absolute;left:${(lx/620*100).toFixed(2)}%;top:${(ly/600*100).toFixed(2)}%;transform:translate(-50%,-50%);border:1px solid #121212;background:#FBFBF8;font-size:10px;line-height:1;padding:3px 4px;min-width:18px;text-align:center;opacity:${e.toFixed(2)};transition:opacity .2s`};});
    const tiles=TILES.map((k,ti)=>{const last=ti===TILES.length-1;const on=last?'#121212':'#FBFBF8';const bg=last?'#86B2EE':'#121212';
      return {arrow:last?'▶':'',style:`display:grid;grid-template-columns:repeat(7,1fr);width:58px;height:58px;padding:6px;background:${bg};gap:0`,cells:PIX[k].join('').split('').map(ch=>`display:block;aspect-ratio:1;background:${ch==='X'?on:'transparent'}`)};});
    const sel=s.sel==null?0:s.sel;const C=OBJS[sel];
    return {
      wheel,curNum:CH[active][0],heartD:HEART_D,gearD:GEAR_D,springD:SPRING_D,leadD:LEAD_D,pp,nums,tiles,
      leadStyle:`opacity:${e.toFixed(2)}`,shL:sh(-74,8,-7),shR:sh(74,-8,6),
      c1Section:`position:relative;height:${stage}px;background:#FBFBF8;overflow:hidden;display:flex;align-items:center;justify-content:center;padding-left:${lw}px`,
      c1Box:`position:relative;width:${(W*k1).toFixed(0)}px;height:${(H*k1).toFixed(0)}px`,
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
      toggleAsm:()=>{this._tA=(this._tA||0)>0.5?0:1;this._sel=-1;this.setState({tgt:this._tA,pop:false});},
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
      cur:{n:'0'+(sel+1),sit:C.sit,mod:C.mod,goal:C.goal,fin:C.fin}
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
