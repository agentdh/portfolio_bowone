import assert from "node:assert/strict";
import { test } from "node:test";
import imageViewport from "../src/redesign/image-viewport.cjs";

function fixture(){
  const stage = new EventTarget();
  stage.getBoundingClientRect=()=>({left:0,top:0,width:400,height:300});
  const captured=new Set();
  stage.setPointerCapture=id=>captured.add(id);
  stage.hasPointerCapture=id=>captured.has(id);
  stage.releasePointerCapture=id=>captured.delete(id);
  stage.classList={add(){},remove(){}};
  const image={style:{}};
  let label;
  const view=imageViewport(stage,()=>image,percent=>{label=percent;});
  const fire=(type,values={})=>{
    const event=new Event(type,{cancelable:true});
    Object.assign(event,values);
    stage.dispatchEvent(event);
    return event;
  };
  return {view,fire,image,get label(){return label;}};
}
test("left drag has no edges even at fit scale and double-click returns to fit",()=>{
  const f=fixture();
  f.fire("pointerdown",{button:0,pointerId:1,clientX:30,clientY:30});
  f.fire("pointermove",{pointerId:1,clientX:900,clientY:-590});
  f.fire("pointerup",{pointerId:1});
  assert.equal(f.image.style.transform,"translate(870px,-620px) scale(1)");
  f.fire("dblclick",{button:0});
  assert.equal(f.image.style.transform,"translate(0px,0px) scale(1)");
  assert.equal(f.label,"100%");
});
test("wheel keeps the cursor anchor, continues past old scale limits, and does not reset on 100%",()=>{
  const f=fixture();
  const cursor={clientX:300,clientY:150};
  f.fire("wheel",{...cursor,deltaY:-100});
  assert.match(f.image.style.transform,/^translate\(-12\.[0-9]+px,0px\) scale\(1\.12\)$/);
  f.fire("wheel",{...cursor,deltaY:100});
  assert.equal(f.label,"100%");
  for(let i=0;i<45;i++)f.fire("wheel",{...cursor,deltaY:-100});
  assert.ok(parseFloat(f.label)>500);
  for(let i=0;i<75;i++)f.fire("wheel",{...cursor,deltaY:100});
  assert.ok(parseFloat(f.label)<25);
  f.view.reset();
  assert.equal(f.label,"100%");
});
