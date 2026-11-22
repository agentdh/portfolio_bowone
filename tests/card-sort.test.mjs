import assert from "node:assert/strict";
import {test} from "node:test";
import sort from "../src/redesign/card-sort.cjs";
import runtime from "../src/redesign/runtime.cjs";

test("only order-only updates may reuse the existing gallery nodes",()=>{
  const a={id:"grid:0",order:1,opId:"a",sourcePath:"thumbnail/a.jpg",title:"a.jpg"};
  const b={...a,id:"grid:1",order:2,opId:"b",sourcePath:"thumbnail/b.jpg",title:"b.jpg"};
  assert.equal(runtime.sameCardContent([a,b],[{...b,id:"grid:0",order:1},{...a,id:"grid:1",order:2}]),true);
  assert.equal(runtime.sameCardContent([a,b],[a,{...b,title:"새 이름"}]),false);
  assert.equal(runtime.sameCardContent([a,b],[a]),false);
});

test("moving one or several cards preserves their order and can place them after the last card",()=>{
  assert.deepEqual(sort.reorderKeys(["a","b","c","d"],["a"],"d",true),["b","c","d","a"]);
  assert.deepEqual(sort.reorderKeys(["a","b","c","d","e"],["d","b"],"e",true),["a","c","e","b","d"]);
  assert.deepEqual(sort.reorderKeys(["a","b","c"],["b"],"a"),["b","a","c"]);
  assert.deepEqual(sort.reorderKeys(["a","b","c"],["a"],""),["b","c","a"]);
});

test("dropping onto the selection or an unknown target never loses or duplicates a card",()=>{
  assert.deepEqual(sort.reorderKeys(["a","b","c"],["a","b"],"b"),["a","b","c"]);
  assert.deepEqual(sort.reorderKeys(["a","b","c"],["unknown"],"a"),["a","b","c"]);
  assert.deepEqual(sort.reorderKeys(["a","b","c"],["a"],"unknown"),["a","b","c"]);
});

function gesture(){
  let now=0, next=0;
  const queue=new Map(),events=[];
  const timers={setTimeout(fn,delay){const key=++next;queue.set(key,{fn,at:now+delay});return key;},clearTimeout(key){queue.delete(key);}};
  const value=sort.createPressDrag({
    timers,start:point=>events.push(["start",point.x]),move:point=>events.push(["move",point.x]),
    drop:point=>events.push(["drop",point.x]),cancel:()=>events.push(["cancel"]),
  });
  const advance=ms=>{now+=ms;for(const [id,row] of queue)if(row.at<=now){queue.delete(id);row.fn();}};
  return {value,events,advance};
}
const pointer=(x,overrides={})=>({button:0,pointerId:1,clientX:x,clientY:20,pointerType:"mouse",...overrides});

test("a simple card click still opens normally while a held drag suppresses only its trailing click",()=>{
  const {value,events,advance}=gesture();
  value.down(pointer(10));value.up(pointer(11));
  assert.deepEqual(events,[]);
  assert.equal(value.takeClick(),false);
  value.down(pointer(10));advance(200);value.move(pointer(50));value.up(pointer(75));
  assert.deepEqual(events,[["start",50],["move",50],["drop",75]]);
  assert.equal(value.takeClick(),true);
  assert.equal(value.takeClick(),false);
  value.down(pointer(10));value.up(pointer(10));
  assert.equal(value.takeClick(),false);
});

test("escape, pointer cancellation, and another pointer cannot accidentally commit a move",()=>{
  const {value,events,advance}=gesture();
  value.down(pointer(10));advance(200);value.move(pointer(40));
  value.up(pointer(75,{pointerId:2}));
  assert.equal(events.some(row=>row[0]==="drop"),false);
  value.cancel();
  assert.deepEqual(events.at(-1),["cancel"]);
  value.up(pointer(75));
  assert.equal(events.some(row=>row[0]==="drop"),false);
});

test("a mouse drag starts as soon as the pointer moves and needs no artificial hold delay",()=>{
  const {value,events}=gesture();
  value.down(pointer(10));value.move(pointer(35));value.up(pointer(45));
  assert.deepEqual(events,[["start",35],["move",35],["drop",45]]);
  assert.equal(value.takeClick(),true);
});
