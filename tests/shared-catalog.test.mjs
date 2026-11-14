import assert from "node:assert/strict";
import { test } from "node:test";
import catalog from "../src/redesign/shared-catalog.cjs";
import runtime from "../src/redesign/runtime.cjs";

test("the public snapshot uses shared membership and order across sections, without resurrecting removed cards",()=>{
  const a={src:"./thumbnail/new.png",title:"새 썸네일"};
  const b={src:"./thumbnail/kept.png",title:"갱신한 썸네일"};
  const c={src:"./illustration/new.jpg",title:"새 러프퀄"};
  const d={src:"./animation-video/new.mp4",type:"video"};
  const old={portfolio:{"thumbnail-ld":[{...b,showTitle:false},{src:"./thumbnail/removed.png"}],"illust-rough":[{src:"./illustration/removed.png"}]}};
  const current={portfolio:{"thumbnail-ld":[a,b],"illust-rough":[c],animation2DGrid:[d]},bowoneEditor:{version:1,settings:{version:1,entries:{"hero.lead":{text:"저장된 소개"}}},orders:{}}};
  const result=catalog.readSharedSnapshot(current,old);
  assert.deepEqual(result.portfolio["thumbnail-ld"].map(row=>row.src),[a.src,b.src]);
  assert.equal(result.portfolio["thumbnail-ld"][1].showTitle,false);
  assert.equal(result.portfolio["thumbnail-ld"][0].sharedMedia,true);
  assert.deepEqual(result.portfolio["illust-rough"].map(row=>row.src),[c.src]);
  assert.equal(result.portfolio.animation2DGrid[0].type,"video");
  assert.equal(result.editorSettings.entries["hero.lead"].text,"저장된 소개");
});

test("explicit new-view order is retained without burying newly added works",()=>{
  const current={portfolio:{one:["new","a","b"].map(name=>({src:"./thumbnail/"+name+".jpg"}))},bowoneEditor:{version:1,orders:{one:["thumbnail/b.jpg","thumbnail/a.jpg"]}}};
  const result=catalog.readSharedSnapshot(current,{portfolio:{}});
  assert.deepEqual(result.portfolio.one.map(row=>row.src),["./thumbnail/new.jpg","./thumbnail/b.jpg","./thumbnail/a.jpg"]);
  assert.equal(catalog.readSharedSnapshot({portfolio:{bad:[]}},null),null);
});

test("a renamed work remains accessible through the representative selection using the new file path",()=>{
  const previous={portfolio:{"thumbnail-ld":[{src:"./thumbnail/이전.jpg",showTitle:false}]}};
  const current={portfolio:{"thumbnail-ld":[{src:"./thumbnail/새 이름.jpg",renamedFrom:"thumbnail/이전.jpg"}]}};
  const snapshot=catalog.readSharedSnapshot(current,previous);
  const items=runtime.normalizeArchive(snapshot.portfolio);
  assert.equal(items.length,1);
  assert.equal(items[0].showTitle,false);
  assert.equal(runtime.featureWorkIndex(items).get("thumbnail/이전.jpg").src,"./thumbnail/새 이름.jpg");
});
