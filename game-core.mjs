// Portable puzzle rules. Rendering and Effect House tracking are separate adapters.
export const NAMES = Object.freeze(['SERAME','MATHAPELO','MAJORO','NTSEARE','RORISANG','LEPHUTING']);
export const ORDER = Object.freeze([0,2,3,4,1,5]);
export const LIMITS = Object.freeze([60,55,55,50,50,45]);
const DIR = [[0,-1],[1,0],[0,1],[-1,0]];
const copy = x => JSON.parse(JSON.stringify(x));
export class Puzzle {
  constructor(level) { this.level=copy(level); this.reset(); }
  reset() { Object.assign(this,copy(this.level)); this.moves=0; this.history=[]; this.phase='ready'; this.remaining=this.seconds; this.countdown=3; }
  start() { if(this.phase==='ready') this.phase='countdown'; }
  tick(dt) {
    if(!Number.isFinite(dt)||dt<0) return;
    if(this.phase==='countdown') {
      this.countdown-=dt;
      if(this.countdown>0) return;
      dt=-this.countdown; this.countdown=0; this.phase='playing';
    }
    if(this.phase==='playing') { this.remaining=Math.max(0,this.remaining-dt); if(this.remaining===0)this.phase='lost'; }
  }
  free(x,y) { return x>0&&y>0&&x<this.width-1&&y<this.height-1&&!this.walls.some(p=>p[0]===x&&p[1]===y); }
  at(x,y) { return this.blocks.find(b=>b.x===x&&b.y===y); }
  get placed() { return this.goals.filter(g=>this.at(g.x,g.y)?.letter===g.letter).length; }
  move(d) {
    if(this.phase!=='playing'||!Number.isInteger(d)||d<0||d>3) return false;
    const [dx,dy]=DIR[d], x=this.player.x+dx,y=this.player.y+dy,b=this.at(x,y);
    if(!this.free(x,y)||(b&&(!this.free(x+dx,y+dy)||this.at(x+dx,y+dy))))return false;
    this.history.push(copy({player:this.player,blocks:this.blocks,moves:this.moves}));
    if(b){b.x+=dx;b.y+=dy;} this.player={x,y};this.moves++;
    if(this.placed===this.goals.length)this.phase='won';
    return true;
  }
  undo(){if(this.phase!=='playing'||!this.history.length)return false;Object.assign(this,this.history.pop());return true;}
}
// One gesture per neutral-to-tilt transition. Feed calibrated yaw/pitch degrees.
export class HeadInput {
  constructor(){this.armed=true;this.filtered=[0,0];this.valid=false;}
  update(yaw,pitch,facePresent,dt=1/30){
    if(!facePresent||!Number.isFinite(yaw)||!Number.isFinite(pitch)){this.valid=false;this.armed=false;return null;}
    if(!this.valid){this.filtered=[yaw,pitch];this.valid=true;}
    const a=1-Math.exp(-Math.max(0,dt)*18);
    this.filtered=this.filtered.map((v,i)=>v+a*([yaw,pitch][i]-v));
    const [x,y]=this.filtered;
    if(Math.abs(x)<6&&Math.abs(y)<6){this.armed=true;return null;}
    if(!this.armed||Math.max(Math.abs(x),Math.abs(y))<13)return null;
    this.armed=false;
    return Math.abs(x)>Math.abs(y)?(x>0?1:3):(y>0?2:0);
  }
}
// Scramble solved boards with reversible pulls; inverse path proves solvability.
export function makeLevel(index,seed=1234){
  const name=NAMES[ORDER[index]], width=8,height=8;
  let s=(seed+index*997)>>>0;const rand=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
  const goals=[...name].map((letter,i)=>({letter,x:1+i%5,y:2+Math.floor(i/5)*3}));
  const blocks=copy(goals),walls=[];
  // Narrower later boards, with walls outside goal spaces.
  if(index>=2)walls.push([6,3]);if(index>=4)walls.push([1,6]);
  let player={x:6,y:6},trace=[];
  const free=(x,y)=>x>0&&y>0&&x<width-1&&y<height-1&&!walls.some(p=>p[0]===x&&p[1]===y);
  const at=(x,y)=>blocks.find(b=>b.x===x&&b.y===y);
  const signature=()=>JSON.stringify([player,blocks]);
  let states=[signature()], seen=new Map([[states[0],0]]);
  for(let i=0;i<20000;i++){
    const d=Math.floor(rand()*4),[dx,dy]=DIR[d],nx=player.x+dx,ny=player.y+dy;
    if(!free(nx,ny)||at(nx,ny))continue;
    const behind=at(player.x-dx,player.y-dy);
    if(behind&&rand()<0.8){behind.x=player.x;behind.y=player.y;}
    else if(behind)continue;
    player={x:nx,y:ny};trace.push((d+2)%4);
    const key=signature();
    if(seen.has(key)){
      const cut=seen.get(key);trace.length=cut;states.length=cut+1;
      seen=new Map(states.map((v,j)=>[v,j]));
    }else{states.push(key);seen.set(key,states.length-1);}
    const misplaced=goals.filter(g=>at(g.x,g.y)?.letter!==g.letter).length;
    if(i>250+index*100&&misplaced>=Math.ceil(name.length/2))break;
  }
  if(goals.every(g=>at(g.x,g.y)?.letter===g.letter))return makeLevel(index,seed+77);
  return {name,width,height,goals,blocks,walls,player,seconds:LIMITS[index],solution:trace.reverse()};
}
