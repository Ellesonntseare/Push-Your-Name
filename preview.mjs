import {Puzzle,HeadInput,makeLevel,NAMES,ORDER} from './game-core.mjs';
import {LEVELS} from './levels.mjs';
const $=s=>document.querySelector(s),canvas=$('canvas'),ctx=canvas.getContext('2d'),video=$('video');
let game=new Puzzle(LEVELS[0]),head=new HeadInput(),tracker=null,stream=null,recorder=null,last=performance.now(),lastVideo=-1,baseline=[0,0],angles=null,face=false,calibration=null,busy=false;
const status=t=>$('#status').textContent=t;
ORDER.forEach((v,i)=>$('#level').add(new Option(NAMES[v],i)));
function reset(){game=new Puzzle(LEVELS[Number($('#level').value)]);head=new HeadInput();}
$('#level').onchange=reset;$('#restart').onclick=reset;$('#undo').onclick=()=>game.undo();$('#start').onclick=()=>game.start();
$('#calibrate').onclick=()=>{if(!face)return status('Enable the camera and face it first.');calibration={until:performance.now()+1000,samples:[]};status('Hold your head centred for one second…');};
$('#camera').onclick=async()=>{
 if(busy||stream)return;busy=true;$('#camera').disabled=true;status('Loading head tracking…');
 try{
  const {FaceLandmarker,FilesetResolver}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs');
  const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm');
  tracker=await FaceLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'},runningMode:'VIDEO',numFaces:1,outputFacialTransformationMatrixes:true});
  stream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480},audio:false});video.srcObject=stream;await video.play();status('Camera ready. Face forward and press Centre head.');
 }catch(e){stream?.getTracks().forEach(t=>t.stop());stream=null;tracker?.close();tracker=null;status('Head controls could not start: '+e.message);$('#camera').disabled=false;}finally{busy=false;}
};
document.addEventListener('keydown',e=>{const d=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].indexOf(e.key);if(d>=0&&e.target.tagName!=='SELECT'){e.preventDefault();if(!e.repeat)game.move(d);}});
$('#record').onclick=()=>{
 if(!globalThis.MediaRecorder||!canvas.captureStream)return status('Video recording is unavailable in this browser.');
 reset();const capture=canvas.captureStream(30),chunks=[];
 try{const recordedName=game.name;recorder=new MediaRecorder(capture);recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=()=>{capture.getTracks().forEach(t=>t.stop());const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType}));a.download='PushYourName-'+recordedName+'.webm';a.textContent='Save recorded round';$('#downloads').append(a);$('#record').disabled=false;$('#stop').disabled=true;status('Recording ready. Press Save recorded round.');};recorder.start();game.start();$('#record').disabled=true;$('#stop').disabled=false;status('Recording the game view. Press Stop recording to save.');}catch(e){capture.getTracks().forEach(t=>t.stop());status(e.message);}
};
$('#stop').onclick=()=>{if(recorder?.state==='recording')recorder.stop();};
function box(x,y,w,h,color,r=14){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function text(t,x,y,size=30,color='#fff',align='center'){ctx.fillStyle=color;ctx.font=`800 ${size}px system-ui`;ctx.textAlign=align;ctx.fillText(t,x,y);}
function draw(){
 const bg=ctx.createLinearGradient(0,0,0,1280);bg.addColorStop(0,'#4d2182');bg.addColorStop(1,'#150f2a');ctx.fillStyle=bg;ctx.fillRect(0,0,720,1280);
 if(stream&&video.readyState>=2){ctx.save();ctx.beginPath();ctx.rect(0,815,720,465);ctx.clip();ctx.translate(720,0);ctx.scale(-1,1);const scale=Math.max(720/video.videoWidth,465/video.videoHeight),w=video.videoWidth*scale,h=video.videoHeight*scale;ctx.drawImage(video,(720-w)/2,815+(465-h)/2,w,h);ctx.restore();}
 text('PUSH YOUR NAME',360,76,48,'#ffe17b');text(game.name,360,127,32,'#e3d4ff');
 box(32,155,656,70,'#21123e');text(`${Math.ceil(game.remaining)}s`,105,202,36,game.remaining<=10?'#ff849d':'#96ffe0');text(`${game.placed} / ${game.goals.length}`,355,200);text(`${game.moves} moves`,590,200,26);
 const cell=78,ox=48,oy=250;
 for(let y=0;y<game.height;y++)for(let x=0;x<game.width;x++){
  const wall=!game.free(x,y),px=ox+x*cell,py=oy+y*cell;
  box(px,py,cell-5,cell-5,wall?'#24153b':'#6842a0',12);
  const goal=game.goals.find(g=>g.x===x&&g.y===y);if(goal){ctx.strokeStyle='#9df9d4';ctx.lineWidth=3;ctx.strokeRect(px+7,py+7,cell-19,cell-19);text(goal.letter,px+36,py+49,30,'#bca6d4');}
  const b=game.at(x,y);if(b){const correct=goal?.letter===b.letter;box(px+3,py+3,cell-11,cell-11,correct?'#32c18d':['#ed7189','#e9ad49','#6395ed'][b.letter.charCodeAt(0)%3]);box(px+7,py+6,cell-19,9,'#ffffff35',4);text(b.letter,px+36,py+51,40);}
  if(game.player.x===x&&game.player.y===y){box(px+9,py+10,55,55,'#58e0ec',25);text('••',px+36,py+42,23,'#17294b');}
 }
 box(52,900,616,68,'#201137dd');text(stream?(face?'HEAD CONTROL ACTIVE':'FIND YOUR FACE'):'ARROW KEYS • CAMERA OFF',360,944,26,'#9bffe2');
 if(game.phase!=='playing'){
  box(70,455,580,165,'#190d36ee');const title={ready:'READY TO PUSH?',countdown:String(Math.max(1,Math.ceil(game.countdown))),won:'NAME COMPLETE!',lost:'TIME’S UP!'}[game.phase];text(title,360,521,42,'#ffe17b');text(game.phase==='won'?`${(game.seconds-game.remaining).toFixed(1)} seconds · ${game.moves} moves`:game.phase==='ready'?'Start round or Record round':game.phase==='lost'?`${game.placed} letters placed`:'Get ready!',360,574,25);
 }
 box(52,1160,616,70,'#201137dd');text('MOVE YOUR HEAD TO PUSH',360,1205,29);text('DEVELOPMENT PREVIEW',360,1261,18,'#c6b0ec');
}
function frame(now){
 const dt=Math.max(0,(now-last)/1000);last=now;game.tick(dt);
 if(tracker&&video.readyState>=2&&lastVideo!==video.currentTime){
  lastVideo=video.currentTime;
  try{const r=tracker.detectForVideo(video,now),m=r.facialTransformationMatrixes[0]?.data;face=!!m;
   if(m){angles=[Math.atan2(m[8],m[10])*180/Math.PI,Math.atan2(-m[9],Math.hypot(m[8],m[10]))*180/Math.PI];
    if(calibration){calibration.samples.push(angles);if(now>=calibration.until){baseline=[0,1].map(i=>calibration.samples.reduce((s,a)=>s+a[i],0)/calibration.samples.length);calibration=null;head=new HeadInput();status('Centred. Return to centre after each move.');}}
    else{const d=head.update(-(angles[0]-baseline[0]),angles[1]-baseline[1],true,dt);if(d!==null)game.move(d);}
   }else{head.update(0,0,false);if(calibration){calibration=null;status('Face lost. Centre your head again.');}}
  }catch(e){tracker.close();tracker=null;status('Tracking stopped: '+e.message);}
 }
 draw();requestAnimationFrame(frame);
}
window.addEventListener('pagehide',()=>{if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());tracker?.close();});
requestAnimationFrame(frame);
