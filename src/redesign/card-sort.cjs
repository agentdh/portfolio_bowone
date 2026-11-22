"use strict";

function reorderKeys(keys,ids,before,after=false){
  const selected=new Set(ids);
  if(selected.has(before) || before && !keys.includes(before))return keys.slice();
  const moving=keys.filter(id=>selected.has(id));
  if(!moving.length)return keys.slice();
  const kept=keys.filter(id=>!selected.has(id));
  const at=before?kept.indexOf(before)+(after?1:0):kept.length;
  kept.splice(at,0,...moving);
  return kept;
}

function createPressDrag({start,move,drop,cancel=()=>{},timers=globalThis}){
  let press=null, timer, swallow=false;
  const point=event=>({x:event.clientX,y:event.clientY,pointerId:event.pointerId});
  const stop=()=>{timers.clearTimeout(timer);const previous=press;press=null;return previous;};
  const activate=()=>{
    if(!press || press.active || !press.moved)return;
    press.active=true;swallow=true;
    start(press.last);
  };
  return {
    down(event){
      if(press || event.button!==0 || event.isPrimary===false)return false;
      swallow=false;
      const first=point(event);
      press={first,last:first,active:false,held:false,moved:false};
      timer=timers.setTimeout(()=>{if(press){press.held=true;activate();}},160);
      return true;
    },
    move(event){
      if(!press || press.first.pointerId!==event.pointerId)return false;
      press.last=point(event);
      press.moved=Math.hypot(press.last.x-press.first.x,press.last.y-press.first.y)>=7;
      if(press.held || event.pointerType!=="touch")activate();
      if(!press?.active)return false;
      move(press.last);
      return true;
    },
    up(event){
      if(!press || press.first.pointerId!==event.pointerId)return false;
      const previous=stop();
      if(previous.active)drop(point(event));
      return previous.active;
    },
    cancel(){
      const previous=stop();
      if(previous?.active)cancel();
    },
    takeClick(){const value=swallow;swallow=false;return value;},
    get active(){return !!press?.active;},
  };
}
module.exports={reorderKeys,createPressDrag};
