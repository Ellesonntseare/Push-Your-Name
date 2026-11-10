import assert from 'node:assert/strict';
import {Puzzle,HeadInput,makeLevel,NAMES} from './game-core.mjs';
let verified=0;
for(let seed=1;seed<=30;seed++)for(let i=0;i<6;i++){
  const level=makeLevel(i,seed);const p=new Puzzle(level);
  assert(NAMES.includes(p.name));assert.equal(p.blocks.length,p.name.length);
  assert(p.placed<p.goals.length,'scrambled board must be unfinished');
  p.start();p.tick(3);for(const direction of level.solution){if(p.phase==='won')break;assert(p.move(direction),'inverse path move');}
  assert.equal(p.phase,'won');verified++;
}
const p=new Puzzle(makeLevel(0));p.start();p.tick(2);assert.equal(p.phase,'countdown');assert(!p.move(0));p.tick(2);assert.equal(p.remaining,59);p.tick(100);assert.equal(p.phase,'lost');assert(!p.move(1));
p.reset();p.start();p.tick(3);const before=JSON.stringify(p.blocks);for(let d=0;d<4;d++)if(p.move(d)){assert(p.undo());break;}assert.equal(JSON.stringify(p.blocks),before);
const h=new HeadInput();assert.equal(h.update(0,0,true,1),null);assert.equal(h.update(20,0,true,1),1);assert.equal(h.update(20,0,true,1),null);h.update(0,0,true,1);assert.equal(h.update(-20,0,true,1),3);h.update(0,0,false);assert.equal(h.update(20,0,true,1),null);
console.log(`PASS: ${verified} solvable boards, timer, undo, gesture latch and face-loss checks.`);
